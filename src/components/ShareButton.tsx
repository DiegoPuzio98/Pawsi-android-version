import { Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNativeShare } from "@/hooks/useNativeShare";
import { toast } from "sonner";

type ShareData = {
  id: string;
  type: string;
  title: string;
  description?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  contactEmail?: string;
};

interface ShareButtonProps {
  post: ShareData;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ShareButton({ post, variant = "outline", size = "sm", className = "" }: ShareButtonProps) {
  const { sharePost } = useNativeShare();

  const handleShare = async () => {
    try {
      await sharePost(post);
      toast.success("Compartido exitosamente");
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Error al compartir");
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant={variant}
      size={size}
      className={className}
    >
      <Share className="h-4 w-4" />
    </Button>
  );
}