import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { MapboxPicker } from "@/components/MapboxPicker";
import { ColorSelector } from "@/components/ColorSelector";
import { BreedSelector } from "@/components/BreedSelector";
import { LocationSelector } from "@/components/LocationSelector";
import { uploadFiles } from "@/utils/fileUpload";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import bcrypt from "bcryptjs";

import { speciesList, normalizeSpecies } from "@/utils/species";
import { ConsentAlert } from "@/components/ConsentAlert";

export default function AdoptionsNew() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [species, setSpecies] = useState<string>("");
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);

  const genSecret = () => {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return (arr[0] % 900000 + 100000).toString();
  };

  // Load user's profile location
  useEffect(() => {
    if (user?.id) {
      supabase
        .from('profiles')
        .select('country, province')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setCountry(data.country || "");
            setProvince(data.province || "");
          }
        });
    }
  }, [user]);

  const onSubmit = async () => {
    if (!title) {
      toast({ title: "Faltan campos obligatorios", description: "Título es requerido" });
      return;
    }
    if (!user) {
      toast({ title: "Inicia sesión", description: "Debes iniciar sesión para publicar." });
      return;
    }
    setSubmitting(true);
    try {
      const s = genSecret();
      const owner_secret_hash = await bcrypt.hash(s, 10);
      
      // Upload files if any (limit 3)
      let images: string[] = [];
      if (selectedFiles.length > 0) {
        try {
          images = await uploadFiles(selectedFiles.slice(0, 3) as any);
        } catch (uploadError: any) {
          toast({ title: "Error al subir fotos", description: uploadError.message });
          setSubmitting(false);
          return;
        }
      }

      const normalizedSpecies = normalizeSpecies(species);
      if (normalizedSpecies === 'fish') {
        toast({ title: "Especie no permitida", description: "Peces no están permitidos en esta sección." });
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("adoption_posts").insert({
        title,
        species: normalizedSpecies || null,
        breed: breed || null,
        sex: sex || null,
        age: age || null,
        description: description || null,
        location_text: location || null,
        location_lat: locationLat,
        location_lng: locationLng,
        images,
        colors,
        contact_whatsapp: whatsapp || null,
        contact_phone: phone || null,
        contact_email: email || null,
        owner_secret_hash,
        status: "active",
        user_id: user?.id,
        country: country || null,
        province: province || null,
      });

      if (error) throw error;

      toast({ title: "¡Publicación creada!", description: "Tu publicación se creó correctamente." });
      window.location.href = "/adoptions";
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error al publicar", description: e.message ?? "Inténtalo de nuevo" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-primary mb-4">Publicar adopción</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Evita datos sensibles. Sube solo fotos tuyas o con permiso.
        </p>

        <Card>
          <CardContent className="p-4 grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cachorro en adopción" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Especie (opcional)</label>
                <Select value={species} onValueChange={setSpecies}>
                  <SelectTrigger>
                    <SelectValue placeholder="Especie" />
                  </SelectTrigger>
                  <SelectContent>
                    {speciesList.filter(s => s !== 'fish').map((s) => (
                      <SelectItem key={s} value={s}>{t(`species.${s}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Raza (opcional)</label>
                <BreedSelector 
                  species={species}
                  breed={breed}
                  onBreedChange={setBreed}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ubicación (opcional)</label>
              <LocationSelector
                country={country}
                province={province}
                onCountryChange={setCountry}
                onProvinceChange={setProvince}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sexo (opcional)</label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="macho">Macho</SelectItem>
                  <SelectItem value="hembra">Hembra</SelectItem>
                  <SelectItem value="no sé">No sé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Edad (opcional)</label>
                <Input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Ej: 3 meses" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Área (opcional)</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Barrio / zona" />
                <ConsentAlert fieldValue={location} fieldType="address" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Colores (opcional)</label>
              <ColorSelector 
                selectedColors={colors}
                onColorsChange={setColors}
                maxColors={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ubicación (opcional)</label>
              <MapboxPicker
                onLocationChange={(lat, lng) => {
                  setLocationLat(lat);
                  setLocationLng(lng);
                }}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fotos (opcional)</label>
              <p className="text-xs text-muted-foreground mb-2">Máximo 3 fotos</p>
              <FileUpload
                onFilesSelected={(files) => {
                  const incoming = Array.from(files);
                  if (incoming.length > 3) {
                    toast({ title: "Límite de fotos", description: "Solo puedes subir hasta 3 fotos." });
                  }
                  setSelectedFiles(incoming.slice(0, 3));
                }}
                onFileRemove={(index) => {
                  const newFiles = [...selectedFiles];
                  newFiles.splice(index, 1);
                  setSelectedFiles(newFiles);
                }}
                selectedFiles={selectedFiles}
                disabled={submitting}
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp (opcional)</label>
                <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="54911..." />
                <ConsentAlert fieldValue={whatsapp} fieldType="phone" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono (opcional)</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                <ConsentAlert fieldValue={phone} fieldType="phone" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email (opcional)</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onSubmit} disabled={submitting}>
                {submitting ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Se eliminó el diálogo de código secreto por solicitud del usuario */}
      </main>
    </div>
  );
}
