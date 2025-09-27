import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Flag, MessageCircle } from "lucide-react";
import { ReportDialog } from "./ReportDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PostActionsProps {
  postId: string;
  postType: 'adoption' | 'lost' | 'reported' | 'classified';
  contactWhatsapp?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  isHighlighted?: boolean;
  onHighlightChange?: (highlighted: boolean) => void;
}

export function PostActions({ 
  postId, 
  postType, 
  contactWhatsapp,
  contactPhone,
  contactEmail, 
  isHighlighted, 
  onHighlightChange 
}: PostActionsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [highlightLoading, setHighlightLoading] = useState(false);

  const handleHighlight = async () => {
    if (!user) {
      toast({ title: "Inicia sesión", description: "Debes iniciar sesión para guardar publicaciones" });
      return;
    }

    setHighlightLoading(true);
    try {
      if (isHighlighted) {
        // Remove highlight
        const { error } = await supabase
          .from('user_highlights')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .eq('post_type', postType);
        
        if (error) throw error;
        onHighlightChange?.(false);
        toast({ title: "Publicación eliminada de guardados" });
      } else {
        // Add highlight
        const { error } = await supabase
          .from('user_highlights')
          .insert({
            user_id: user.id,
            post_id: postId,
            post_type: postType
          });
        
        if (error) throw error;
        onHighlightChange?.(true);
        toast({ title: "Publicación guardada" });
      }
    } catch (error: any) {
      console.error('Error managing highlight:', error);
      toast({ title: "Error", description: "No se pudo actualizar el guardado" });
    } finally {
      setHighlightLoading(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      toast({ title: "Inicia sesión", description: "Debes iniciar sesión para contactar al publicador." });
      window.location.href = "/auth";
      return;
    }

    // Navigate to post detail page to see all contact options including Pawsi
    const currentPath = window.location.pathname;
    if (currentPath.includes('/post/')) {
      // Already on post detail page - this shouldn't happen
      toast({ title: "Usa las opciones de contacto disponibles en la página" });
    } else {
      // Navigate to post detail to see contact options
      window.location.href = `/post/${postType}/${postId}`;
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {/* Highlight button */}
      <Button 
        size="sm" 
        variant="outline"
        onClick={handleHighlight}
        disabled={highlightLoading}
      >
        <Heart 
          className={`h-4 w-4 mr-1 ${isHighlighted ? 'fill-current text-primary' : ''}`} 
        />
        {isHighlighted ? 'Guardado' : 'Guardar'}
      </Button>

      {/* Report button */}
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => setReportOpen(true)}
      >
        <Flag className="h-4 w-4 mr-1" />
        Reportar
      </Button>

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        postId={postId}
        postType={postType}
      />
    </div>
  );
}