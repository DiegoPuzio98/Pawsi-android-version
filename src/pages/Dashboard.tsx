import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { Search, Edit3, Trash2, Eye, Calendar, MapPin, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface Post {
  id: string;
  title: string;
  species?: string;
  status: string;
  created_at: string;
  location_text?: string;
  thumbnail_url?: string; // 👈 agregado
  type: "adoption" | "lost" | "reported" | "classified";
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(0);

  const limit = 10; // 👈 cantidad de posts por página

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user, page]);

  const fetchUserPosts = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const start = page * limit;
      const end = (page + 1) * limit - 1;

      const [adoptionResult, lostResult, reportedResult, classifiedResult] =
        await Promise.all([
          supabase.from("adoption_posts").select("*").eq("user_id", user.id).range(start, end),
          supabase.from("lost_posts").select("*").eq("user_id", user.id).range(start, end),
          supabase.from("reported_posts").select("*").eq("user_id", user.id).range(start, end),
          supabase.from("classifieds").select("*").eq("user_id", user.id).range(start, end),
        ]);

      const allPosts: Post[] = [
        ...(adoptionResult.data?.map((p) => ({ ...p, type: "adoption" as const })) || []),
        ...(lostResult.data?.map((p) => ({ ...p, type: "lost" as const })) || []),
        ...(reportedResult.data?.map((p) => ({ ...p, type: "reported" as const })) || []),
        ...(classifiedResult.data?.map((p) => ({ ...p, type: "classified" as const })) || []),
      ].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPosts(allPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({ title: "Error", description: "No se pudieron cargar las publicaciones" });
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string, postType: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta publicación?")) return;

    try {
      let error;

      if (postType === "adoption") {
        ({ error } = await supabase.from("adoption_posts").delete().eq("id", postId));
      } else if (postType === "lost") {
        ({ error } = await supabase.from("lost_posts").delete().eq("id", postId));
      } else if (postType === "reported") {
        ({ error } = await supabase.from("reported_posts").delete().eq("id", postId));
      } else if (postType === "classified") {
        ({ error } = await supabase.from("classifieds").delete().eq("id", postId));
      }

      if (error) throw error;

      setPosts(posts.filter((p) => p.id !== postId));
      toast({ title: "¡Eliminado!", description: "Publicación eliminada correctamente" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo eliminar la publicación" });
    }
  };

  const updatePostStatus = async (postId: string, postType: string, newStatus: string) => {
    try {
      let error;
      const newStatusAdjusted =
        postType === "reported" && newStatus === "resolved" ? "inactive" : newStatus;

      if (postType === "adoption") {
        ({ error } = await supabase.from("adoption_posts").update({ status: newStatusAdjusted }).eq("id", postId));
      } else if (postType === "lost") {
        ({ error } = await supabase.from("lost_posts").update({ status: newStatusAdjusted }).eq("id", postId));
      } else if (postType === "reported") {
        ({ error } = await supabase.from("reported_posts").update({ status: newStatusAdjusted }).eq("id", postId));
      } else if (postType === "classified") {
        ({ error } = await supabase.from("classifieds").update({ status: newStatusAdjusted }).eq("id", postId));
      }

      if (error) throw error;

      setPosts(posts.map((p) => (p.id === postId ? { ...p, status: newStatusAdjusted } : p)));
      toast({ title: "¡Actualizado!", description: "Estado actualizado correctamente" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo actualizar el estado" });
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.id.includes(searchTerm);

    if (activeTab === "resolved") {
      return (
        matchesSearch &&
        (post.status === "resolved" || (post.type === "reported" && post.status === "inactive"))
      );
    } else if (activeTab === "all") {
      return matchesSearch && post.status !== "resolved" && post.status !== "inactive";
    } else {
      return (
        matchesSearch &&
        post.type === activeTab &&
        post.status !== "resolved" &&
        post.status !== "inactive"
      );
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "resolved":
        return "bg-blue-100 text-blue-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "adoption":
        return "Adopción";
      case "lost":
        return "Perdida";
      case "reported":
        return "Reportada";
      case "classified":
        return "Marketplace";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Mi Dashboard</h1>
          <Link to="/profile">
            <Button variant="outline">
              <Edit3 className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{posts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {posts.filter((p) => p.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resueltas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {posts.filter((p) => p.status === "resolved" || (p.type === "reported" && p.status === "inactive")).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Este mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {posts.filter((p) => new Date(p.created_at).getMonth() === new Date().getMonth()).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por título o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="adoption">Adopciones</TabsTrigger>
            <TabsTrigger value="lost">Perdidas</TabsTrigger>
            <TabsTrigger value="reported">Reportadas</TabsTrigger>
            <TabsTrigger value="classified">Marketplace</TabsTrigger>
            <TabsTrigger value="resolved">Resueltas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          <Badge variant="outline">{getTypeLabel(post.type)}</Badge>
                          <Badge className={getStatusColor(post.status)}>
                            {post.status === "active"
                              ? "Activa"
                              : post.status === "resolved"
                              ? "Resuelta"
                              : "Inactiva"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>ID: {post.id.slice(0, 8)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                          {post.location_text && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{post.location_text}</span>
                            </div>
                          )}
                        </div>

                        {/* Thumbnail */}
                        {post.thumbnail_url && (
                          <div className="mt-3">
                            <img
                              src={post.thumbnail_url}
                              alt="Thumbnail"
                              className="h-32 w-32 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {activeTab === "resolved" ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePostStatus(post.id, post.type, "active")}
                            >
                              Publicar de nuevo
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deletePost(post.id, post.type)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            {post.status === "active" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePostStatus(post.id, post.type, "resolved")}
                              >
                                Marcar Resuelta
                              </Button>
                            )}
                            {post.status === "resolved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePostStatus(post.id, post.type, "active")}
                              >
                                Reactivar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deletePost(post.id, post.type)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "No se encontraron publicaciones"
                      : "No tienes publicaciones aún"}
                  </p>
                  {!searchTerm && (
                    <div className="mt-4 space-x-2">
                      <Link to="/adoptions/new">
                        <Button>Publicar Adopción</Button>
                      </Link>
                      <Link to="/lost/new">
                        <Button variant="outline">Reportar Perdida</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Paginación */}
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Anterior
          </Button>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
            Siguiente
          </Button>
        </div>
      </main>
    </div>
  );
}
