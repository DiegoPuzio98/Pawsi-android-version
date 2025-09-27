import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Phone, Mail } from "lucide-react";
import { ChatCenter } from "@/components/ChatCenter";

interface ContactInfo {
  contact_email?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  store_contact?: string;
}

interface ContactOptionsProps {
  contactInfo: ContactInfo;
  postId: string;
  postType: string;
  recipientId: string;
  postTitle?: string;
  loading?: boolean;
}

export function ContactOptions({ contactInfo, postId, postType, recipientId, postTitle, loading = false }: ContactOptionsProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Cargando información de contacto...</p>
        </CardContent>
      </Card>
    );
  }

  const hasContactInfo = contactInfo.contact_email || contactInfo.contact_phone || 
                        contactInfo.contact_whatsapp || contactInfo.store_contact;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold mb-3">Opciones de contacto</h3>
        
        {/* Internal messaging system */}
        {recipientId && postId && (
          <ChatCenter 
            postId={postId}
            postType={postType}
            recipientId={recipientId}
            postTitle={postTitle}
          />
        )}

        {hasContactInfo && (
          <>
            {/* WhatsApp */}
            {contactInfo.contact_whatsapp && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  const sanitizedPhone = contactInfo.contact_whatsapp?.replace(/\D/g, '') || '';
                  window.open(`https://wa.me/${sanitizedPhone}`, '_blank');
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            )}

            {/* Phone */}
            {contactInfo.contact_phone && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open(`tel:${contactInfo.contact_phone}`, '_blank')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Teléfono
              </Button>
            )}

            {/* Email */}
            {contactInfo.contact_email && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open(`mailto:${contactInfo.contact_email}`, '_blank')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            )}

            {/* Store contact for marketplace */}
            {contactInfo.store_contact && (
              <div className="bg-muted p-3 rounded">
                <p className="text-sm font-medium mb-1">Información de contacto:</p>
                <p className="text-sm">{contactInfo.store_contact}</p>
              </div>
            )}
          </>
        )}

        {!hasContactInfo && (
          <p className="text-sm text-muted-foreground">
            El usuario solo permite contacto através del sistema interno de mensajes.
          </p>
        )}
      </CardContent>
    </Card>
  );
}