import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { MapboxPicker } from "@/components/MapboxPicker";
import { LocationSelector } from "@/components/LocationSelector";
import { uploadFiles } from "@/utils/fileUpload";
import { useAuth } from "@/hooks/useAuth";
import { ConsentAlert } from "@/components/ConsentAlert";

const categories = [
  { value: 'food', label: 'Comida' },
  { value: 'toys', label: 'Juguetes' }, 
  { value: 'accessories', label: 'Accesorios' },
  { value: 'medicine', label: 'Medicina' },
  { value: 'services', label: 'Servicios' },
  { value: 'other', label: 'Otros' }
] as const;

export default function MarketplaceNew() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [storeContact, setStoreContact] = useState("");

  const [submitting, setSubmitting] = useState(false);

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
    if (!title || !category) {
      toast({ title: "Faltan campos obligatorios", description: "Título y categoría son requeridos" });
      return;
    }
    if (!user) {
      toast({ title: "Inicia sesión", description: "Debes iniciar sesión para publicar." });
      return;
    }
    setSubmitting(true);
    try {
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

      const { error } = await supabase.from("classifieds").insert({
        title,
        category,
        condition: condition || null,
        description: description || null,
        price: price ? Number(price) : null,
        images,
        location_text: location || null,
        location_lat: locationLat,
        location_lng: locationLng,
        contact_whatsapp: whatsapp || null,
        contact_email: email || null,
        store_contact: storeContact || null,
        status: "active",
        user_id: user?.id,
        country: country || null,
        province: province || null,
      });

      if (error) throw error;

      toast({ title: "¡Publicado!", description: "Tu anuncio fue creado" });
      window.location.href = "/marketplace";
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
        <h1 className="text-3xl font-bold text-primary mb-4">Publicar en Marketplace</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Prohibida la venta de animales. Usa lugares públicos y seguros para encuentros.
        </p>

        <Card>
          <CardContent className="p-4 grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Correa reforzada" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoría *</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Estado (opcional)</label>
                <Input value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="Nuevo/Usado" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Precio (opcional)</label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Área (opcional)</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Barrio / zona" />
                <ConsentAlert fieldValue={location} fieldType="address" />
              </div>
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
                <label className="block text-sm font-medium mb-1">Email (opcional)</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contacto de tienda (opcional)</label>
                <Input value={storeContact} onChange={(e) => setStoreContact(e.target.value)} placeholder="@mitienda" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onSubmit} disabled={submitting}>
                {submitting ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
