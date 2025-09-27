import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, Home, Camera, AlertTriangle, ShoppingCart, Heart, Stethoscope, Phone, LogOut, User, Settings, Bookmark, MessageSquare } from "lucide-react";
import { PawIcon } from "@/components/ui/paw-icon";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NotificationBell } from "@/components/NotificationBell";
import { supabase } from "@/integrations/supabase/client";

// Remove menuItems as we'll dynamically generate them with translations

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const { t } = useLanguage();
  const { isAuthenticated, signOut, user } = useAuth();

  // Fetch unread message count
  useEffect(() => {
    if (user?.id) {
      const fetchUnreadCount = async () => {
        const { data } = await supabase
          .from('messages')
          .select('id')
          .eq('recipient_id', user.id)
          .is('read_at', null);
        
        setUnreadCount(data?.length || 0);
      };

      fetchUnreadCount();
      
      // Set up real-time subscription for messages
      const channel = supabase
        .channel('unread-messages')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'messages' },
          () => fetchUnreadCount()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const menuItems = [
    { icon: Home, label: t('nav.home'), path: "/" },
    { icon: Camera, label: t('nav.reported'), path: "/reported" },
    { icon: AlertTriangle, label: t('nav.lost'), path: "/lost" },
    { icon: ShoppingCart, label: t('nav.marketplace'), path: "/marketplace" },
    { icon: Stethoscope, label: t('nav.veterinarians'), path: "/veterinarians" },
    { icon: Heart, label: t('nav.adoptions'), path: "/adoptions" },
    { icon: Phone, label: t('nav.support'), path: "/support" },
  ];

  const authMenuItems = [
    { icon: User, label: t('nav.dashboard'), path: "/dashboard" },
    { icon: MessageSquare, label: "Mensajes", path: "/messages", showBadge: true },
    { icon: Bookmark, label: t('nav.saved'), path: "/saved" },
    { icon: Settings, label: t('nav.profile'), path: "/profile" },
  ];

  // Add admin menu item for admin users
  if (user?.email === 'ecomervix@gmail.com') {
    authMenuItems.push({ icon: Settings, label: "Panel Admin", path: "/admin" });
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <PawIcon size={32} />
          <span className="text-2xl font-bold text-primary">Pawsi</span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <NotificationBell />
          {!isAuthenticated ? (
            <Link to="/auth">
              <Button variant="outline" size="sm">
                {t('auth.signIn')}
              </Button>
            </Link>
          ) : (
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              {t('auth.signOut')}
            </Button>
          )}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <div className="flex flex-col gap-4 mt-8 pb-20">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              {isAuthenticated && (
                <>
                  <hr className="my-2" />
                  {authMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between gap-3 p-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.showBadge && unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {unreadCount}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};