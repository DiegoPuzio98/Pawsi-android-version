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
const ADMIN_EMAIL = "ecomervix@gmail.com";

interface DeleteRequest {
  content_type: string;
  content_id: string;
  report_id: string;
  admin_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (userError || !user || user.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Admin access required' }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { content_type, content_id, report_id, admin_id }: DeleteRequest = await req.json();

    console.log('Processing content deletion:', { content_type, content_id, report_id });

    // Get content details before deletion to notify owner
    let contentData: any = null;
    let contentOwnerEmail: string | null = null;

    if (content_type === 'adoption') {
      const { data } = await supabase
        .from('adoption_posts')
        .select('id, title, user_id')
        .eq('id', content_id)
        .single();
      contentData = data;
    } else if (content_type === 'lost') {
      const { data } = await supabase
        .from('lost_posts')
        .select('id, title, user_id')
        .eq('id', content_id)
        .single();
      contentData = data;
    } else if (content_type === 'reported') {
      const { data } = await supabase
        .from('reported_posts')
        .select('id, title, user_id')
        .eq('id', content_id)
        .single();
      contentData = data;
    } else if (content_type === 'classified') {
      const { data } = await supabase
        .from('classifieds')
        .select('id, title, user_id')
        .eq('id', content_id)
        .single();
      contentData = data;
    }

    if (!contentData) {
      return new Response(JSON.stringify({ error: 'Content not found' }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get owner email
    if (contentData.user_id) {
      const { data: userData } = await supabase.auth.admin.getUserById(contentData.user_id);
      contentOwnerEmail = userData?.user?.email || null;
    }

    // Delete the content
    let deleteError: any = null;

    if (content_type === 'adoption') {
      const { error } = await supabase
        .from('adoption_posts')
        .delete()
        .eq('id', content_id);
      deleteError = error;
    } else if (content_type === 'lost') {
      const { error } = await supabase
        .from('lost_posts')
        .delete()
        .eq('id', content_id);
      deleteError = error;
    } else if (content_type === 'reported') {
      const { error } = await supabase
        .from('reported_posts')
        .delete()
        .eq('id', content_id);
      deleteError = error;
    } else if (content_type === 'classified') {
      const { error } = await supabase
        .from('classifieds')
        .delete()
        .eq('id', content_id);
      deleteError = error;
    }

    if (deleteError) {
      console.error('Error deleting content:', deleteError);
      throw deleteError;
    }

    // Update report status
    const { error: reportUpdateError } = await supabase
      .from('post_reports')
      .update({
        status: 'resolved',
        resolved_by: admin_id,
        resolved_at: new Date().toISOString()
      })
      .eq('id', report_id);

    if (reportUpdateError) {
      console.error('Error updating report:', reportUpdateError);
    }

    // Create notification for content owner
    if (contentData.user_id) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: contentData.user_id,
          type: 'post_deleted',
          message: `Tu publicación "${contentData.title || content_id}" fue eliminada por no cumplir con las normas de la comunidad.`,
          meta: {
            content_type,
            content_id,
            content_title: contentData.title
          }
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
    }

    // Send email to content owner
    if (contentOwnerEmail) {
      const emailSubject = `Tu contenido ${content_id} fue eliminado — Pawsi`;
      const emailBody = `
        <h2>Contenido eliminado</h2>
        <p>Hola,</p>
        <p>Tu publicación <strong>"${contentData.title || content_id}"</strong> fue eliminada por no cumplir con las normas de nuestra comunidad.</p>
        <p>Te pedimos que revises nuestros <a href="${Deno.env.get('SUPABASE_URL')}/terms" target="_blank">términos y condiciones</a> para evitar futuras infracciones.</p>
        <p><strong>Nota importante:</strong> La reincidencia en el incumplimiento de las normas puede resultar en la suspensión o eliminación de tu cuenta.</p>
        <p>Si consideras que esto es un error, puedes contactarnos respondiendo a este email.</p>
        <p>Equipo de Pawsi</p>
      `;

      const emailResponse = await resend.emails.send({
        from: "Pawsi <noreply@pawsi.com>",
        to: [contentOwnerEmail],
        subject: emailSubject,
        html: emailBody,
      });

      console.log('Owner notification email sent:', emailResponse);
    }

    // Log the deletion
    const { error: logError } = await supabase
      .from('deletion_logs')
      .insert({
        content_type,
        content_id,
        deleted_by: `admin:${admin_id}`,
        processed: true
      });

    if (logError) {
      console.error('Error logging deletion:', logError);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error processing deletion:', error);
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