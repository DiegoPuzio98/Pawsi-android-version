import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";

import Index from "./pages/Index";
import AuthPage from "./pages/auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ReportedPets from "./pages/ReportedPets";
import LostPets from "./pages/LostPets";
import Marketplace from "./pages/Marketplace";
import Veterinarians from "./pages/Veterinarians";
import Adoptions from "./pages/Adoptions";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import ReportedNew from "./pages/ReportedNew";
import LostNew from "./pages/LostNew";
import MarketplaceNew from "./pages/MarketplaceNew";
import VeterinariansNew from "./pages/VeterinariansNew";
import AdoptionsNew from "./pages/AdoptionsNew";
import PostDetail from "./pages/PostDetail";
import Saved from "./pages/Saved";
import Messages from "./pages/Messages";
import Terms from "./pages/Terms";
import AdminPanel from "./pages/AdminPanel";
import ResetPassword from "./pages/ResetPassword";
import Footer from "./components/Footer";

import { StatusBar, Style } from "@capacitor/status-bar";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.setBackgroundColor({ color: "#00000000" });
    StatusBar.setOverlaysWebView({ overlay: false });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen flex flex-col">
                <div className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route
                      path="/auth"
                      element={
                        <AuthGuard requireAuth={false}>
                          <AuthPage />
                        </AuthGuard>
                      }
                    />
                    {/* ✅ Página pública para recuperar contraseña */}
                    <Route path="/reset-password" element={<ResetPassword />} />

                    <Route
                      path="/dashboard"
                      element={
                        <AuthGuard requireAuth={true}>
                          <Dashboard />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <AuthGuard requireAuth={true}>
                          <Profile />
                        </AuthGuard>
                      }
                    />
                    <Route path="/reported" element={<ReportedPets />} />
                    <Route
                      path="/reported/new"
                      element={
                        <AuthGuard requireAuth={true}>
                          <ReportedNew />
                        </AuthGuard>
                      }
                    />
                    <Route path="/lost" element={<LostPets />} />
                    <Route
                      path="/lost/new"
                      element={
                        <AuthGuard requireAuth={true}>
                          <LostNew />
                        </AuthGuard>
                      }
                    />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route
                      path="/marketplace/new"
                      element={
                        <AuthGuard requireAuth={true}>
                          <MarketplaceNew />
                        </AuthGuard>
                      }
                    />
                    <Route path="/veterinarians" element={<Veterinarians />} />
                    <Route
                      path="/veterinarians/new"
                      element={
                        <AuthGuard requireAuth={true}>
                          <VeterinariansNew />
                        </AuthGuard>
                      }
                    />
                    <Route path="/adoptions" element={<Adoptions />} />
                    <Route
                      path="/adoptions/new"
                      element={
                        <AuthGuard requireAuth={true}>
                          <AdoptionsNew />
                        </AuthGuard>
                      }
                    />
                    <Route path="/support" element={<Support />} />
                    <Route
                      path="/saved"
                      element={
                        <AuthGuard requireAuth={true}>
                          <Saved />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/messages"
                      element={
                        <AuthGuard requireAuth={true}>
                          <Messages />
                        </AuthGuard>
                      }
                    />
                    <Route path="/terms" element={<Terms />} />
                    <Route
                      path="/admin"
                      element={
                        <AuthGuard requireAuth={true}>
                          <AdminPanel />
                        </AuthGuard>
                      }
                    />
                    <Route path="/post/:type/:id" element={<PostDetail />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Footer />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;


