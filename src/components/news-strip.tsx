import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { SensitiveImage } from "@/components/SensitiveImage";
import { useAuth } from "@/hooks/useAuth";

interface Post {
  id: string;
  title: string;
  location_text: string;
  created_at: string;
  species?: string;
  images?: string[];
  type: 'lost' | 'reported' | 'adoption';
  state?: string;
  country?: string;
  province?: string;
}

export const NewsStrip = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const [userProfile, setUserProfile] = useState<{ country?: string; province?: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('country, province')
          .eq('id', user.id)
          .single();
        setUserProfile(data);
      }
    };
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        let lostQuery = supabase
          .from('lost_posts')
          .select('id, title, location_text, created_at, species, images, country, province')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(8);

        let reportedQuery = supabase
          .from('reported_posts')
          .select('id, title, location_text, created_at, species, images, state, country, province')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(8);

        let adoptionQuery = supabase
          .from('adoption_posts')
          .select('id, title, location_text, created_at, species, images, country, province')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(8);

        if (userProfile?.province) {
          lostQuery = lostQuery.eq('province', userProfile.province);
          reportedQuery = reportedQuery.eq('province', userProfile.province);
          adoptionQuery = adoptionQuery.eq('province', userProfile.province);
        }

        const [lostRes, reportedRes, adoptionRes] = await Promise.all([
          lostQuery,
          reportedQuery,
          adoptionQuery
        ]);

        const combinedPosts: Post[] = [
          ...(lostRes.data?.map(post => ({ ...post, type: 'lost' as const })) || []),
          ...(reportedRes.data?.map(post => ({ ...post, type: 'reported' as const })) || []),
          ...(adoptionRes.data?.map(post => ({ ...post, type: 'adoption' as const })) || [])
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
         .slice(0, 15);

        setPosts(combinedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPosts();
  }, [userProfile]);

  useEffect(() => {
    if (!scrollRef.current || posts.length === 0) return;

    const scrollContainer = scrollRef.current;
    let rafId: number;
    const step = 0.8;

    const animate = () => {
      if (!scrollContainer) return;

      if (!isPaused && !isManualScrolling) {
        const next = scrollContainer.scrollLeft + step;
        if (posts.length > 1) {
          const originalWidth = scrollContainer.scrollWidth / 2;
          scrollContainer.scrollLeft = next >= originalWidth ? (next - originalWidth) : next;
        } else {
          const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
          if (maxScroll > 0) {
            scrollContainer.scrollLeft = next >= maxScroll ? 0 : next;
          }
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isPaused, isManualScrolling, posts]);

  if (loading) {
    return (
      <div className="w-full py-4">
        <h2 className="text-lg font-semibold mb-3 text-primary">{t('home.latestNews')}</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[280px] h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const displayedPosts = posts.length > 1 ? [...posts, ...posts] : posts;

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-primary">{t('home.latestNews')}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => scrollRef.current!.scrollLeft -= 300}>←</Button>
          <Button variant="outline" size="sm" onClick={() => scrollRef.current!.scrollLeft += 300}>→</Button>
        </div>
      </div>
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-hidden pb-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {displayedPosts.map((post, idx) => (
          <Card 
            key={`${post.id}-${idx}`} 
            className="min-w-[280px] bg-card hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
            onClick={() => navigate(`/post/${post.type}/${post.id}`)}
          >
            {post.images && post.images.length > 0 && (
              <div className="relative h-32 w-full overflow-hidden">
                <SensitiveImage 
                  src={
                    post.images[0].startsWith("http") 
                      ? `${post.images[0]}?width=400&height=300&quality=70`
                      : `https://jwvcgawjkltegcnyyryo.supabase.co/storage/v1/object/public/posts/${post.images[0]}?width=400&height=300&quality=70`
                  }
                  alt={post.title}
                  className="w-full h-full object-cover"
                  isSensitive={post.type === "reported" && (post.state === "injured" || post.state === "sick")}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute top-2 left-2">
                  <Badge variant={post.type === 'lost' ? 'destructive' : post.type === 'adoption' ? 'secondary' : 'default'}>
                    {post.type === 'lost' ? t('status.lost') : post.type === 'adoption' ? 'En adopción' : t('status.reported')}
                  </Badge>
                </div>
              </div>
            )}
            <div className="p-3">
              <h3 className="font-medium text-sm mb-2 line-clamp-2">{post.title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{post.location_text}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
