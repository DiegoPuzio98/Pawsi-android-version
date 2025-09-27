import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { ContactOptions } from "@/components/ContactOptions";

interface ContactInfoDialogProps {
  postId: string;
  postType: string;
  recipientId?: string;
  postTitle?: string;
  contactInfo?: {
    email?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    store_contact?: string | null;
  };
  loading?: boolean;
}

export function ContactInfoDialog({ 
  postId, 
  postType, 
  recipientId, 
  postTitle, 
  contactInfo, 
  loading = false 
}: ContactInfoDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Info className="h-4 w-4 mr-1" />
          Mostrar información de contacto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Información de contacto</DialogTitle>
        </DialogHeader>
        <ContactOptions
          contactInfo={{
            contact_email: contactInfo?.email,
            contact_phone: contactInfo?.phone,
            contact_whatsapp: contactInfo?.whatsapp,
            store_contact: contactInfo?.store_contact
          }}
          postId={postId}
          postType={postType}
          recipientId={recipientId || ''}
          postTitle={postTitle}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}