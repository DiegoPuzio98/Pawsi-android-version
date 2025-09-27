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

export default function LostNew() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [species, setSpecies] = useState<string>("");
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [lostAt, setLostAt] = useState("");
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string>("lost");
  
  // Captcha
  const [captchaQuestion, setCaptchaQuestion] = useState<{a: number, b: number, answer: number}>({ a: 0, b: 0, answer: 0 });
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);

  const genSecret = () => {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return (arr[0] % 900000 + 100000).toString();
  };

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ a, b, answer: a + b });
    setCaptchaAnswer("");
    setCaptchaValid(false);
  };

  // Generate captcha on component mount and load user profile location
  useEffect(() => {
    generateCaptcha();
    
    // Load user's profile location
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
    if (!title || !species || !breed || !description || !colors.length || !location || !lostAt || !country || !province) {
      toast({ title: "Faltan campos obligatorios", description: "Todos los campos marcados con * son requeridos" });
      return;
    }
    if (!user) {
      toast({ title: "Inicia sesión", description: "Debes iniciar sesión para publicar." });
      return;
    }
    if (parseInt(captchaAnswer) !== captchaQuestion.answer) {
      toast({ title: "Captcha incorrecto", description: "Verifica la respuesta del cálculo matemático" });
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

      const { error } = await supabase.from("lost_posts").insert({
        title,
        species: normalizedSpecies,
        breed: breed || null,
        sex: sex || null,
        colors,
        description: description || null,
        location_text: location,
        location_lat: locationLat,
        location_lng: locationLng,
        images: status === "dead" ? [] : images,
        contact_whatsapp: whatsapp || null,
        contact_phone: phone || null,
        contact_email: email || null,
        lost_at: lostAt ? new Date(lostAt).toISOString() : null,
        owner_secret_hash,
        status: "active",
        user_id: user?.id,
        country: country || null,
        province: province || null,
      });

      if (error) throw error;

      toast({ title: "¡Alerta publicada!", description: "Tu alerta se publicó correctamente." });
      window.location.href = "/lost";
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
        <h1 className="text-3xl font-bold text-primary mb-4">Reportar mascota perdida</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Aconsejamos evitar datos personales sensibles, como teléfonos, nombres y direcciones exactas.
        </p>

        <Card>
          <CardContent className="p-4 grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Gata perdida en Centro" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Especie *</label>
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
                <label className="block text-sm font-medium mb-1">Raza *</label>
                <BreedSelector 
                  species={species}
                  breed={breed}
                  onBreedChange={setBreed}
                />
              </div>
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
            <div>
              <label className="block text-sm font-medium mb-1">Colores *</label>
              <ColorSelector 
                selectedColors={colors}
                onColorsChange={setColors}
                maxColors={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción *</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ubicación *</label>
              <LocationSelector
                country={country}
                province={province}
                onCountryChange={setCountry}
                onProvinceChange={setProvince}
                disabled={submitting}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Área aproximada *</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Barrio / zona" />
                <ConsentAlert fieldValue={location} fieldType="address" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha/hora de pérdida *</label>
                <Input type="datetime-local" value={lostAt} onChange={(e) => setLostAt(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado de la mascota *</label>
                <Select value={status} onValueChange={setStatus} disabled={true}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">Perdida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ubicación exacta (opcional)</label>
              <p className="text-xs text-muted-foreground mb-2">
                Al completar este campo, consientes que la información sea visible públicamente.
              </p>
              <ConsentAlert fieldValue={locationLat ? "ubicación" : ""} fieldType="address" />
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
              {status === "dead" ? (
                <div className="p-4 border rounded-md bg-muted">
                  <p className="text-sm text-muted-foreground">Las fotos están deshabilitadas para reportes de animales fallecidos</p>
                </div>
              ) : (
                <>
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
                </>
              )}
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Verificación anti-spam *</label>
                <div className="flex items-center gap-4">
                  <span className="text-sm">¿Cuánto es {captchaQuestion.a} + {captchaQuestion.b}?</span>
                  <Input 
                    type="number"
                    value={captchaAnswer}
                    onChange={(e) => {
                      setCaptchaAnswer(e.target.value);
                      setCaptchaValid(parseInt(e.target.value) === captchaQuestion.answer);
                    }}
                    className="w-20"
                    placeholder="="
                  />
                  <Button type="button" variant="outline" size="sm" onClick={generateCaptcha}>
                    Nuevo
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={onSubmit} disabled={submitting || !captchaValid}>
                  {submitting ? "Publicando..." : "Publicar alerta"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
