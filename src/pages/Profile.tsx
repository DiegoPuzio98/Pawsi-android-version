import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Navigation } from "@/components/navigation";
import { LocationSelector } from "@/components/LocationSelector";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { uploadFile } from "@/utils/fileUpload";
import { User, Camera, Save, Trash2, MapPin } from "lucide-react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";

interface Profile {
  id: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
  country?: string;
  province?: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || '');
        setCountry(data.country || '');
        setProvince(data.province || '');
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, display_name: user.email?.split('@')[0] || 'Usuario' }])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
        setDisplayName(newProfile.display_name || '');
        setCountry(newProfile.country || '');
        setProvince(newProfile.province || '');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({ title: "Error", description: "No se pudo cargar el perfil" });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      let avatarUrl = profile.avatar_url;

      // Upload new avatar if selected
      if (selectedFile) {
        try {
          avatarUrl = await uploadFile(selectedFile);
        } catch (uploadError: any) {
          toast({ title: "Error al subir imagen", description: uploadError.message });
          setSaving(false);
          return;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          avatar_url: avatarUrl,
          country: country || null,
          province: province || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, display_name: displayName, avatar_url: avatarUrl, country, province });
      setSelectedFile(null);
      toast({ title: "¡Actualizado!", description: "Perfil actualizado correctamente" });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({ title: "Error", description: error.message || "No se pudo actualizar el perfil" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-user');
      // If supabase-js returns { data, error }, error will be populated on failure
      if (error) throw error;
      toast({ title: "Cuenta eliminada", description: "Tu cuenta ha sido eliminada correctamente." });
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({ title: "Error", description: error?.message || "No se pudo eliminar la cuenta" });
    } finally {
      setDeleting(false);
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
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Mi Perfil</h1>
          <Link to="/dashboard">
            <Button variant="outline">
              Volver al Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage 
                  src={selectedFile ? URL.createObjectURL(selectedFile) : profile?.avatar_url} 
                  alt="Avatar" 
                />
                <AvatarFallback className="text-xl">
                  {displayName.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="w-full max-w-xs">
                <label className="block text-sm font-medium mb-2">
                  <Camera className="h-4 w-4 inline mr-1" />
                  Foto de Perfil
                </label>
                <FileUpload
                  onFilesSelected={(files) => setSelectedFile(files[0])}
                  onFileRemove={() => setSelectedFile(null)}
                  selectedFiles={selectedFile ? [selectedFile] : []}
                  multiple={false}
                  accept="image/*"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre para mostrar
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  El email no se puede cambiar desde aquí
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Ubicación
                </label>
                <LocationSelector
                  country={country}
                  province={province}
                  onCountryChange={setCountry}
                  onProvinceChange={setProvince}
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Esto ayuda a mostrar contenido relevante para tu área
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Miembro desde
                </label>
                <Input
                  value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={updateProfile} 
                disabled={saving || !displayName.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-destructive">Eliminar cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Esta acción no se puede deshacer. Se eliminará tu cuenta de forma permanente.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? "Eliminando..." : "Eliminar cuenta"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Esto no se puede revertir. ¿Seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción borrará tu cuenta definitivamente y cerrará tu sesión.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteAccount}>
                    Sí, eliminar mi cuenta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}