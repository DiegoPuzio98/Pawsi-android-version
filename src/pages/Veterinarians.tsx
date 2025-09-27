import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Calendar, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

interface Veterinarian {
  id: string;
  name: string;
  description: string;
  address: string;
  services?: string[];
  images?: string[];
  created_at: string;
  status: string;
  province?: string;
}

export default function Veterinarians() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userProfile, setUserProfile] = useState<{ country?: string; province?: string } | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 9;

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
    fetchVeterinarians();
  }, [searchTerm, userProfile, page]);

  const fetchVeterinarians = async () => {
    setLoading(true);
    let query = supabase
      .from("veterinarians")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (userProfile?.province) {
      query = query.eq("province", userProfile.province);
    }

    if (searchTerm) {
      query = query.or(
        `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`
      );
    }

    const { data, error } = await query;
    if (error) console.error("Error fetching veterinarians:", error);
    else setVeterinarians(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">{t("nav.veterinarians")}</h1>
          <Link to="/veterinarians/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("action.addVeterinarian")}
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t("action.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {veterinarians.map((vet) => (
            <Link key={vet.id} to={`/post/veterinarians/${vet.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                {vet.images?.[0] && (
                  <div className="aspect-video bg-muted">
                    <img
                      src={vet.images[0]}
                      alt={vet.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{vet.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {vet.address}
                  </div>
                  <p className="text-sm line-clamp-2">{vet.description}</p>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(vet.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Paginación */}
        <div className="flex justify-center mt-6 space-x-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            {t("common.previous")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={veterinarians.length < pageSize}
          >
            {t("common.next")}
          </Button>
        </div>

        {!loading && veterinarians.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("empty.noVets")}</p>
          </div>
        )}
      </main>
    </div>
  );
}

