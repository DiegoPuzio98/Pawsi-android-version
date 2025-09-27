import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface DeletionRequest {
  content_type: string;
  content_id: string;
  admin_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content_type, content_id, admin_email }: DeletionRequest = await req.json();

    // Verify admin access
    if (admin_email !== 'ecomervix@gmail.com') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let tableName = '';
    let content = null;
    let userId = null;

    // Get content and user info before deletion
    switch (content_type) {
      case 'adoption':
        tableName = 'adoption_posts';
        break;
      case 'lost':
        tableName = 'lost_posts';
        break;
      case 'reported':
        tableName = 'reported_posts';
        break;
      case 'classified':
        tableName = 'classifieds';
        break;
      default:
        throw new Error('Invalid content type');
    }

    // Get content details
    const { data: contentData } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', content_id)
      .single();

    if (!contentData) {
      throw new Error('Content not found');
    }

    content = contentData;
    userId = contentData.user_id;

    // Delete the content
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .eq('id', content_id);

    if (deleteError) {
      throw deleteError;
    }

    // Log the deletion
    await supabase.from('deletion_logs').insert({
      content_type,
      content_id,
      deleted_by: admin_email,
    });

    // Create notification for the user
    if (userId) {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'post_deleted',
        message: `Tu publicación "${content.title}" fue eliminada por contenido inapropiado. Revisa los Términos de Uso de Pawsi. Violaciones repetidas pueden resultar en suspensión de cuenta.`,
        meta: { content_id, content_type }
      });

      // Get user email and send email notification
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      
      if (userData?.user?.email) {
        await resend.emails.send({
          from: "Pawsi <noreply@pawsi.com>",
          to: [userData.user.email],
          subject: "Contenido eliminado - Pawsi",
          html: `
            <h2>Tu contenido ha sido eliminado</h2>
            <p>Hola,</p>
            <p>Tu publicación "<strong>${content.title}</strong>" (ID: ${content_id}) ha sido eliminada por contenido inapropiado.</p>
            <p>Te recomendamos revisar nuestros <a href="https://pawsi.com/terms">Términos de Uso</a> para evitar futuras violaciones.</p>
            <p><strong>Advertencia:</strong> Violaciones repetidas pueden resultar en la suspensión de tu cuenta.</p>
            <p>Si crees que esto es un error, puedes contactarnos.</p>
            <p>Equipo de Pawsi</p>
          `,
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Content deleted and notifications sent'
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error handling content deletion:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);