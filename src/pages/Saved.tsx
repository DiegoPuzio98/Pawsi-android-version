import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { PostActions } from "@/components/PostActions";
import { MapPin, Calendar } from "lucide-react";

interface Highlight {
  id: string;
  post_id: string;
  post_type: "lost" | "reported" | "adoption" | "classified";
}

interface BasePost {
  id: string;
  title: string;
  images?: string[];
  created_at: string;
  location_text?: string;
  status: string;
}

export default function Saved() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Array<BasePost & { post_type: Highlight["post_type"] }>>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const { data: highlights, error } = await supabase
          .from("user_highlights")
          .select("post_id, post_type")
          .eq("user_id", user.id);

        if (error) throw error;

        const rpIds = highlights?.filter((h) => h.post_type === "reported").map((h) => h.post_id) || [];
        const lpIds = highlights?.filter((h) => h.post_type === "lost").map((h) => h.post_id) || [];

        const queries: any[] = [];
        if (rpIds.length)
          queries.push(
            supabase
              .from("reported_posts")
              .select("*")
              .in("id", rpIds)
              .range(page * pageSize, (page + 1) * pageSize - 1)
          );
        if (lpIds.length)
          queries.push(
            supabase
              .from("lost_posts")
              .select("*")
              .in("id", lpIds)
              .range(page * pageSize, (page + 1) * pageSize - 1)
          );

        const results = await Promise.all(queries);
        const collected: Array<BasePost & { post_type: Highlight["post_type"] }> = [];

        if (rpIds.length) {
          const rp = results.shift();
          rp?.data?.forEach((p: any) => collected.push({ ...p, post_type: "reported" }));
        }
        if (lpIds.length) {
          const lp = results.shift();
          lp?.data?.forEach((p: any) => collected.push({ ...p, post_type: "lost" }));
        }

        setPosts(
          collected.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        );
      } catch (e: any) {
        console.error(e);
        toast({ title: "Error", description: e.message });
      } finally {
        setLoading(false);
      }
    })();
  }, [user, page]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Button onClick={() => (window.location.href = "/auth")}>Iniciar sesión</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-primary mb-6">{t("nav.saved")}</h1>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Aún no tienes guardados</div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Card key={`${post.post_type}-${post.id}`} className="overflow-hidden">
                  {post.images?.[0] && (
                    <div className="aspect-video bg-muted">
                      <img
                        src={
                          post.images[0].startsWith("http")
                            ? post.images[0]
                            : `https://jwvcgawjkltegcnyyryo.supabase.co/storage/v1/object/public/posts/${post.images[0]}`
                        }
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      <Badge
                        className={
                          post.status === "resolved"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {post.status === "resolved" ? t("status.resolved") : t("status.active")}
                      </Badge>
                    </div>
                    {post.location_text && (
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">{post.location_text}</span>
                      </div>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground mb-4">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>

                    <PostActions
                      postId={post.id}
                      postType={post.post_type}
                      isHighlighted={true}
                      onHighlightChange={(h) => {
                        if (!h)
                          setPosts((prev) =>
                            prev.filter(
                              (p) => !(p.id === post.id && p.post_type === post.post_type)
                            )
                          );
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Controles de paginación */}
            <div className="flex justify-center mt-6 space-x-4">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-muted rounded disabled:opacity-50"
              >
                {t("common.previous")}
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={posts.length < pageSize}
                className="px-4 py-2 bg-muted rounded disabled:opacity-50"
              >
                {t("common.next")}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

