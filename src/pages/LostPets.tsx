import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

interface LostPost {
  id: string;
  title: string;
  species: string;
  breed: string;
  sex?: string;
  colors: string[];
  description: string;
  location_text: string;
  images: string[];
  thumbnail?: string;
  created_at: string;
  lost_at: string;
  expires_at: string;
  user_id: string;
}

export default function LostPets() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [posts, setPosts] = useState<LostPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [sexFilter, setSexFilter] = useState("");
  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [userProfile, setUserProfile] = useState<{ country?: string; province?: string } | null>(null);
  const [searchParams] = useSearchParams();

  // 🔹 Paginación
  const pageSize = 10;
  const [page, setPage] = useState(0);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSpeciesFilter("all");
    setSexFilter("");
    setColorFilters([]);
    setLocationFilter("");
  };

  useEffect(() => {
    const q = searchParams.get("q");
    const sp = searchParams.get("species");
    if (q) setSearchTerm(q);
    if (sp) setSpeciesFilter(sp);

    if (user?.id) {
      supabase
        .from("profiles")
        .select("country, province")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          setUserProfile(data);
        });
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [searchTerm, speciesFilter, sexFilter, colorFilters, locationFilter, userProfile, page]);

  const fetchPosts = async () => {
    setLoading(true);

    let query = supabase
      .from("lost_posts")
      .select("*")
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

    if (speciesFilter && speciesFilter !== "all") {
      query = query.eq("species", speciesFilter);
    }

    if (locationFilter) {
      query = query.ilike("location_text", `%${locationFilter}%`);
    }

    if (sexFilter) {
      query = query.eq("sex", sexFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      let filteredData = data || [];
      if (colorFilters.length > 0) {
        filteredData = filteredData.filter((post) => {
          return post.colors && colorFilters.some((color) => post.colors.includes(color));
        });
      }
      setPosts(filteredData);
    }
    setLoading(false);
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expiration = new Date(expiresAt);
    const now = new Date();
    const daysLeft = (expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 7;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">{t("nav.lost")}</h1>
          <Link to="/lost/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("home.postAlert")}
            </Button>
          </Link>
        </div>

        <AdvancedSearch
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          speciesFilter={speciesFilter}
          onSpeciesFilterChange={setSpeciesFilter}
          sexFilter={sexFilter}
          onSexFilterChange={setSexFilter}
          colorFilters={colorFilters}
          onColorFiltersChange={setColorFilters}
          locationFilter={locationFilter}
          onLocationFilterChange={setLocationFilter}
          onReset={handleResetFilters}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card
              key={post.id}
              className={`overflow-hidden cursor-pointer hover:shadow-md transition ${
                isExpiringSoon(post.expires_at) ? "border-destructive" : ""
              }`}
              onClick={() => (window.location.href = `/post/lost/${post.id}`)}
            >
              {(post.thumbnail || post.images?.[0]) && (
                <div className="aspect-video bg-muted">
                  <img
                    src={post.thumbnail || post.images[0]}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="font-semibold">{post.title}</h3>
                <p className="text-sm text-muted-foreground">{post.location_text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
