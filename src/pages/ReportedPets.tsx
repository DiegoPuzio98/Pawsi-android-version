import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { PostActions } from "@/components/PostActions";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Plus } from "lucide-react";
import { SensitiveImage } from "@/components/SensitiveImage";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ReportedPost {
  id: string;
  title: string;
  species: string | null;
  breed: string | null;
  sex?: string | null;
  colors: string[];
  description: string | null;
  location_text: string;
  location_lat?: number | null;
  location_lng?: number | null;
  images: string[];
  created_at: string;
  contact_whatsapp?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  status: string;
  state?: string;
}

const speciesKeyForI18n = (s?: string | null) => {
  switch (s) {
    case "dog": return "dogs";
    case "cat": return "cats";
    case "bird": return "birds";
    case "rodent": return "rodents";
    case "fish": return "fish";
    default: return s || "";
  }
};

const statusKeyForI18n = (s?: string | null) => {
  switch (s) {
    case "seen": return "seen";
    case "injured": return "injured";
    case "sick": return "sick";
    case "dead": return "dead";
    case "other": return "other";
    default: return "";
  }
};

export default function ReportedPets() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ReportedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [breedFilter, setBreedFilter] = useState("");
  const [sexFilter, setSexFilter] = useState("");
  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [userProfile, setUserProfile] = useState<{ country?: string; province?: string } | null>(null);
  const [searchParams] = useSearchParams();

  // 🔹 Paginación
  const pageSize = 9;
  const [page, setPage] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSpeciesFilter("all");
    setBreedFilter("");
    setSexFilter("");
    setColorFilters([]);
    setLocationFilter("");
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("country, province")
          .eq("id", user.id)
          .single();
        setUserProfile(data);
      }
    };
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    // Initialize from URL params once
    const q = searchParams.get("q");
    const sp = searchParams.get("species");
    if (q) setSearchTerm(q);
    if (sp) setSpeciesFilter(sp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [searchTerm, speciesFilter, breedFilter, sexFilter, colorFilters, locationFilter, userProfile, page]);

  const fetchPosts = async () => {
    setLoading(true);

    let query = supabase
      .from("reported_posts")
      .select("*", { count: "exact" })
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (userProfile?.province) {
      query = query.eq("province", userProfile.province);
    }

    if (searchTerm) {
      query = query.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location_text.ilike.%${searchTerm}%,breed.ilike.%${searchTerm}%`
      );
    }

    if (breedFilter) {
      query = query.ilike("breed", `%${breedFilter}%`);
    }

    if (speciesFilter && speciesFilter !== "all") {
      const map: Record<string, string[]> = {
        dogs: ["dog", "dogs", "perro", "perros", "canes"],
        cats: ["cat", "cats", "gato", "gatos", "felinos"],
        birds: ["bird", "birds", "ave", "aves"],
        rodents: ["rodent", "rodents", "roedor", "roedores"],
        fish: ["fish", "pez", "peces"],
      };
      const values = map[speciesFilter] ?? [speciesFilter];
      query = query.in("species", values);
    }

    if (locationFilter) {
      query = query.ilike("location_text", `%${locationFilter}%`);
    }

    if (sexFilter) {
      query = query.eq("sex", sexFilter);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      let filteredData = data || [];

      // Filtro por colores
      if (colorFilters.length > 0) {
        filteredData = filteredData.filter((post) => {
          return post.colors && colorFilters.some((color) => post.colors.includes(color));
        });
      }

      setPosts(filteredData);
      if (count !== null) setTotalPosts(count);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">{t("nav.reported")}</h1>
          <Link to="/reported/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("home.reportSighting")}
            </Button>
          </Link>
        </div>

        {/* Advanced Search */}
        <AdvancedSearch
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          speciesFilter={speciesFilter}
          onSpeciesFilterChange={setSpeciesFilter}
          breedFilter={breedFilter}
          onBreedFilterChange={setBreedFilter}
          sexFilter={sexFilter}
          onSexFilterChange={setSexFilter}
          colorFilters={colorFilters}
          onColorFiltersChange={setColorFilters}
          locationFilter={locationFilter}
          onLocationFilterChange={setLocationFilter}
          onReset={handleResetFilters}
        />

        {/* Posts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition"
              onClick={() => navigate(`/post/reported/${post.id}`)}
            >
              {post.images?.[0] && (
                <div className="relative aspect-video bg-muted">
                  <SensitiveImage
                    src={
                      post.images[0].startsWith("http")
                        ? post.images[0]
                        : `https://jwvcgawjkltegcnyyryo.supabase.co/storage/v1/object/public/posts/${post.images[0]}?width=400&height=300&resize=cover`
                    }
                    alt={post.title}
                    className="w-full h-full object-cover"
                    isSensitive={post.state === "injured" || post.state === "sick"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {post.state && (
                    <div className="absolute top-2 left-2">
                      <Badge>{t(`status.${statusKeyForI18n(post.state)}`)}</Badge>
                    </div>
                  )}
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{post.title}</h3>
                  <div className="flex items-center gap-2">
                    {post.species && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {t(`species.${speciesKeyForI18n(post.species)}`)}
                      </span>
                    )}
                    {!post.images?.[0] && post.state && (
                      <Badge>{t(`status.${statusKeyForI18n(post.state)}`)}</Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mb-2">
                  {post.breed && <span className="text-sm text-muted-foreground">Raza: {post.breed}</span>}
                  {post.sex && <span className="text-sm text-muted-foreground">Sexo: {post.sex}</span>}
                </div>

                {post.colors && post.colors.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.colors.map((color) => (
                      <Badge key={color} variant="secondary" className="text-xs">
                        {color}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-sm mb-3 line-clamp-2">{post.description}</p>

                <div className="flex items-center text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">{post.location_text}</span>
                </div>

                <div className="flex items-center text-xs text-muted-foreground mb-3">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>

                <PostActions
                  postId={post.id}
                  postType="reported"
                  contactWhatsapp={post.contact_whatsapp}
                  contactPhone={post.contact_phone}
                  contactEmail={post.contact_email}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Paginación */}
        {totalPosts > pageSize && (
          <div className="flex justify-center gap-4 mt-8">
            <Button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              {t("pagination.previous")}
            </Button>
            <span className="self-center text-sm">
              {t("pagination.page")} {page + 1} / {Math.ceil(totalPosts / pageSize)}
            </span>
            <Button
              disabled={(page + 1) * pageSize >= totalPosts}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("pagination.next")}
            </Button>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron mascotas reportadas</p>
          </div>
        )}
      </main>
    </div>
  );
}


