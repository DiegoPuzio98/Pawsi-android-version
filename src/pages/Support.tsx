import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "@/components/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MessageSquare } from "lucide-react";

export default function Support() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create mailto link
      const subject = encodeURIComponent(`Pawsi Support: ${formData.subject}`);
      const body = encodeURIComponent(
        `Nombre: ${formData.name}\n` +
        `Email: ${formData.email}\n\n` +
        `Mensaje:\n${formData.message}`
      );
      
      const mailtoUrl = `mailto:ecomervix@gmail.com?subject=${subject}&body=${body}`;
      window.location.href = mailtoUrl;

      toast({
        title: "Correo preparado",
        description: "Se abrirá tu cliente de correo para enviar el mensaje.",
      });

      // Reset form
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo preparar el correo. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-primary mb-6">{t('nav.support')}</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Formulario de Contacto
              </CardTitle>
              <CardDescription>
                Envíanos tu consulta y te responderemos lo antes posible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">{t('form.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    rows={6}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Preparando..." : "Enviar Mensaje"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Correo Electrónico</p>
                    <a 
                      href="mailto:ecomervix@gmail.com"
                      className="text-sm text-primary hover:underline"
                    >
                      ecomervix@gmail.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preguntas Frecuentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">¿Cómo puedo reportar una mascota?</h4>
                  <p className="text-sm text-muted-foreground">
                    Ve a la sección "Mascotas Reportadas" y haz clic en "Reportar Avistamiento".
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">¿Cuánto tiempo permanece activa una publicación?</h4>
                  <p className="text-sm text-muted-foreground">
                    Las mascotas perdidas permanecen activas por 2 meses. Los reportes por 2 meses también.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">¿Puedo editar mi publicación?</h4>
                  <p className="text-sm text-muted-foreground">
                    Actualmente no es posible editar publicaciones. Contacta al soporte para modificaciones.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  {t('disclaimer.platform')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}