import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "@/components/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { MapboxPicker } from "@/components/MapboxPicker";
import { uploadFiles } from "@/utils/fileUpload";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ConsentAlert } from "@/components/ConsentAlert";
import { LocationSelector } from "@/components/LocationSelector";

export default function VeterinariansNew() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const commonServices = [
    "Consulta general", "Vacunación", "Cirugía", "Emergencias 24h",
    "Radiografías", "Análisis clínicos", "Peluquería", "Hospitalización",
    "Odontología", "Cardiología", "Dermatología", "Oftalmología"
  ];

  const addService = (service: string) => {
    if (service && !services.includes(service)) {
      setServices([...services, service]);
    }
    setNewService("");
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    if (!name || !address || !country || !province) {
      toast({ title: "Faltan campos obligatorios", description: "Nombre, dirección, país y provincia son requeridos" });
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

      const { error } = await supabase.from("veterinarians").insert({
        name,
        description: description || null,
        address,
        location_lat: locationLat,
        location_lng: locationLng,
        phone: phone || null,
        whatsapp: whatsapp || null,
        email: email || null,
        website: website || null,
        services: services.length > 0 ? services : null,
        images,
        status: "active",
        user_id: user?.id,
        country,
        province,
      });

      if (error) throw error;

      toast({ title: "¡Veterinaria agregada!", description: "La veterinaria se agregó correctamente." });
      window.location.href = "/veterinarians";
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error al agregar", description: e.message ?? "Inténtalo de nuevo" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-primary mb-4">Agregar Veterinaria</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Agrega información sobre establecimientos veterinarios para ayudar a la comunidad.
        </p>

        <Card>
          <CardContent className="p-4 grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Clínica Veterinaria San Martín" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono (opcional)</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej: +54911..." />
                <ConsentAlert fieldValue={phone} fieldType="phone" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Dirección *</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej: Av. Corrientes 1234, CABA" />
              <ConsentAlert fieldValue={address} fieldType="address" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe los servicios y características de la veterinaria..." />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Ubicación <span className="text-destructive">*</span>
              </label>
              <LocationSelector
                country={country}
                province={province}
                onCountryChange={setCountry}
                onProvinceChange={setProvince}
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Servicios (opcional)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                {commonServices.map((service) => (
                  <Button
                    key={service}
                    type="button"
                    variant={services.includes(service) ? "default" : "outline"}
                    size="sm"
                    onClick={() => services.includes(service) ? removeService(services.indexOf(service)) : addService(service)}
                    className="justify-start text-xs h-auto py-1"
                  >
                    {service}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar servicio personalizado..."
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addService(newService)}
                />
                <Button type="button" variant="outline" onClick={() => addService(newService)}>
                  Agregar
                </Button>
              </div>
              {services.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {services.map((service, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {service}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeService(index)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ubicación exacta (opcional)</label>
              <p className="text-xs text-muted-foreground mb-2">
                Permite mostrar la veterinaria en el mapa
              </p>
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
                <label className="block text-sm font-medium mb-1">Sitio Web (opcional)</label>
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={onSubmit} disabled={submitting}>
                {submitting ? "Agregando..." : "Agregar Veterinaria"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}