import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowLeft, Calendar, MapPin, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MapboxPreview } from "@/components/MapboxPreview";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { SensitiveImage } from "@/components/SensitiveImage";
import { ReportDialog } from "@/components/ReportDialog";
import { ImageLightbox } from "@/components/ImageLightbox";
import { ContactOptions } from "@/components/ContactOptions";
import { PostActions } from "@/components/PostActions";

interface PostData {
  id: string;
  title: string;
  description?: string;
  species?: string;
  breed?: string;
  age?: string;
  images?: string[];
  location_text: string;
  location_lat?: number;
  location_lng?: number;
  created_at: string;
  lost_at?: string;
  seen_at?: string;
  state?: string;
  status?: string;
  user_id?: string;
  category?: string;
  condition?: string;
  price?: number;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  services?: string[];
}

interface ContactInfo {
  contact_email?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  store_contact?: string;
}

export default function PostDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [post, setPost] = useState<PostData | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingContact, setLoadingContact] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isHighlighted, setIsHighlighted] = useState(false);

  // 🔹 Intentamos cachear el post
  useEffect(() => {
    const fetchPost = async () => {
      if (!type || !id) return;

      const cacheKey = `post_${type}_${id}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        setPost(JSON.parse(cached));
        setLoading(false);
        return; // 👈 si ya está en cache no tiramos query
      }

      try {
        let data, error;

        switch (type) {
          case "lost":
            ({ data, error } = await supabase
              .from("lost_posts")
              .select("*")
              .eq("id", id)
              .eq("status", "active")
              .single());
            break;
          case "reported":
            ({ data, error } = await supabase
              .from("reported_posts")
              .select("*")
              .eq("id", id)
              .eq("status", "active")
              .single());
            break;
          case "adoption":
            ({ data, error } = await supabase
              .from("adoption_posts")
              .select("*")
              .eq("id", id)
              .eq("status", "active")
              .single());
            break;
          case "classifieds":
            ({ data, error } = await supabase
              .from("classifieds")
              .select("*")
              .eq("id", id)
              .eq("status", "active")
              .single());
            break;
          case "veterinarians":
            ({ data, error } = await supabase
              .from("veterinarians")
              .select("*")
              .eq("id", id)
              .eq("status", "active")
              .single());
            if (data) data.title = data.name;
            break;
          default:
            throw new Error("Invalid post type");
        }

        if (error) throw error;

        if (data) {
          setPost(data);
          localStorage.setItem(cacheKey, JSON.stringify(data)); // 👈 cache
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del post",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [type, id, navigate, toast]);

  // 🔹 Cacheamos también la info de contacto
  const loadContactInfo = async () => {
    if (!user || !type || !id) {
      toast({
        title: "Autenticación requerida",
        description: "Debes iniciar sesión para ver la información de contacto",
        variant: "destructive",
      });
      return;
    }

    const cacheKey = `contact_${type}_${id}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setContactInfo(JSON.parse(cached));
      return;
    }

    setLoadingContact(true);
    try {
      const post_table =
        type === "classifieds"
          ? "classifieds"
          : type === "veterinarians"
          ? "veterinarians"
          : `${type}_posts`;

      const { data, error } = await supabase.rpc("get_post_contact_info", {
        post_table,
        post_id: id,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setContactInfo(data[0]);
        sessionStorage.setItem(cacheKey, JSON.stringify(data[0])); // 👈 cache
      }
    } catch (error) {
      console.error("Error fetching contact info:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información de contacto",
        variant: "destructive",
      });
    } finally {
      setLoadingContact(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post no encontrado</h1>
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  const getTypeLabel = () => {
    switch (type) {
      case 'lost': return 'Perdido';
      case 'reported': return 'Reportado';
      case 'adoption': return 'Adopción';
      case 'veterinarians':
        return 'Veterinaria';
      case 'classifieds':
        return 'Clasificado';
      default: return type;
    }
  };

  const getTypeVariant = () => {
    switch (type) {
      case 'lost': return 'destructive';
      case 'reported': return 'default';
      case 'adoption': return 'secondary';
      case 'veterinarians':
        return 'default';
      case 'classifieds':
        return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <Card className="overflow-hidden">
          {/* Images Carousel */}
          {post.images && post.images.length > 0 && (
            <div className="relative">
              <Carousel className="w-full">
                <CarouselContent>
                  {post.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div 
                        className="relative h-96 w-full overflow-hidden cursor-pointer"
                        onClick={() => {
                          setLightboxIndex(index);
                          setLightboxOpen(true);
                        }}
                      >
                        <SensitiveImage
                          src={image.startsWith('http') 
                            ? image 
                            : `https://jwvcgawjkltegcnyyryo.supabase.co/storage/v1/object/public/posts/${image}`
                          }
                          alt={`${post.title} - Imagen ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          isSensitive={type === 'reported' && (post.state === 'injured' || post.state === 'sick')}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {post.images.length > 1 && (
                  <>
                    <CarouselPrevious className="absolute left-4 top-1/2" />
                    <CarouselNext className="absolute right-4 top-1/2" />
                  </>
                )}
              </Carousel>
              <div className="absolute top-4 left-4">
                <Badge variant={getTypeVariant() as any}>
                  {getTypeLabel()}
                </Badge>
              </div>
              {post.images.length > 1 && (
                <div className="absolute bottom-4 right-4">
                  <Badge variant="outline" className="bg-black/50 text-white border-white/30">
                    {post.images.length} fotos
                  </Badge>
                </div>
              )}
              {type === 'reported' && post.state && (
                <div className="absolute top-4 right-4">
                  <Badge>
                    {t(`status.${post.state}`)}
                  </Badge>
                </div>
              )}
            </div>
          )}

          <div className="p-6">
            {/* Header without image */}
            {(!post.images || post.images.length === 0) && (
              <div className="mb-4 flex items-center gap-2">
                <Badge variant={getTypeVariant() as any} className="mb-2">
                  {getTypeLabel()}
                </Badge>
                {type === 'reported' && post.state && (
                  <Badge className="mb-2">{t(`status.${post.state}`)}</Badge>
                )}
              </div>
            )}

            {/* Title and basic info */}
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {post.species && (
                <div>
                  <p className="text-sm text-muted-foreground">Especie</p>
                  <p className="font-medium">{t(`species.${post.species}`)}</p>
                </div>
              )}
              {post.breed && (
                <div>
                  <p className="text-sm text-muted-foreground">Raza</p>
                  <p className="font-medium">{post.breed}</p>
                </div>
              )}
              {post.age && (
                <div>
                  <p className="text-sm text-muted-foreground">Edad</p>
                  <p className="font-medium">{post.age}</p>
                </div>
              )}
              {post.category && (
                <div>
                  <p className="text-sm text-muted-foreground">Categoría</p>
                  <p className="font-medium">{post.category}</p>
                </div>
              )}
              {post.condition && (
                <div>
                  <p className="text-sm text-muted-foreground">Condición</p>
                  <p className="font-medium">{post.condition}</p>
                </div>
              )}
              {post.price && (
                <div>
                  <p className="text-sm text-muted-foreground">Precio</p>
                  <p className="font-medium text-primary">${post.price}</p>
                </div>
              )}
              {post.state && (
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-medium">{t(`status.${post.state}`)}</p>
                </div>
              )}
            </div>

            {/* Colors */}
            {(post as any).colors && (post as any).colors.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Colores</h2>
                <div className="flex flex-wrap gap-2">
                  {(post as any).colors.map((c: string) => (
                    <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {post.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Descripción</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{post.description}</p>
              </div>
            )}

            <Separator className="my-6" />

            {/* Location */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Ubicación</h2>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{post.location_text}</span>
              </div>
              {post.location_lat && post.location_lng && (
                <MapboxPreview
                  lat={post.location_lat}
                  lng={post.location_lng}
                  height={300}
                />
              )}
            </div>

            <Separator className="my-6" />

            {/* Dates */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Publicado: {new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              {post.lost_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Perdido: {new Date(post.lost_at).toLocaleDateString()}</span>
                </div>
              )}
              {post.seen_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Visto: {new Date(post.seen_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Contact Section */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Información de Contacto</h2>
              
              {/* Save/Contact Actions */}
              <PostActions
                postId={id!}
                postType={type === 'classifieds' ? 'classified' : (type as any)}
                isHighlighted={isHighlighted}
                onHighlightChange={setIsHighlighted}
              />
              
              {!contactInfo ? (
                <Button 
                  onClick={loadContactInfo} 
                  disabled={loadingContact}
                  className="w-full"
                >
                  {loadingContact ? "Cargando..." : "Mostrar información de contacto"}
                </Button>
              ) : (
                <ContactOptions
                  contactInfo={contactInfo}
                  postId={id!}
                  postType={type!}
                  recipientId={post.user_id || ''}
                  postTitle={post.title}
                  loading={loadingContact}
                />
              )}
            </div>

            {/* Owner actions */}
            {user && post.user_id === user.id && post.status === 'active' && (
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const table = type === 'reported' ? 'reported_posts' : type === 'lost' ? 'lost_posts' : type === 'adoption' ? 'adoption_posts' : type === 'veterinarians' ? 'veterinarians' : 'classifieds';
                    const { error } = await supabase.from(table).update({ status: 'resolved' }).eq('id', post.id);
                    if (error) throw error;
                    toast({ title: 'Caso marcado como resuelto' });
                    navigate(-1);
                  } catch (e: any) {
                    toast({ title: 'Error', description: e.message, variant: 'destructive' });
                  }
                }}
              >
                {t('action.markResolved')}
              </Button>
            )}
          </div>
        </Card>
        <div className="fixed bottom-6 right-6 z-50">
          <Button variant="destructive" onClick={() => setReportOpen(true)}>
            <Flag className="h-4 w-4 mr-2" />
            Reportar publicación
          </Button>
        </div>
        <ReportDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          postId={post.id}
          postType={(type === 'classifieds' ? 'classified' : (type as any))}
        />
        
        {/* Image Lightbox */}
        {post.images && post.images.length > 0 && (
          <ImageLightbox
            images={post.images}
            currentIndex={lightboxIndex}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            isSensitive={type === 'reported' && (post.state === 'injured' || post.state === 'sick')}
            title={post.title}
          />
        )}
      </div>
    </div>
  );
}

