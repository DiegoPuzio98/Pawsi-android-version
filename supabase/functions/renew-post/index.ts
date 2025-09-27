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

interface RenewRequest {
  post_id: string;
  post_type: string;
  user_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { post_id, post_type, user_id }: RenewRequest = await req.json();

    console.log('Processing post renewal:', { post_id, post_type, user_id });

    // Calculate new expiration date (2 months from now)
    const newExpiresAt = new Date();
    newExpiresAt.setMonth(newExpiresAt.getMonth() + 2);

    let updateError: any = null;
    let postData: any = null;

    // Update the post's expiration date based on type
    if (post_type === 'lost') {
      const { data, error } = await supabase
        .from('lost_posts')
        .update({ expires_at: newExpiresAt.toISOString() })
        .eq('id', post_id)
        .eq('user_id', user_id)
        .select('id, title')
        .single();
      
      updateError = error;
      postData = data;
    } else if (post_type === 'reported') {
      const { data, error } = await supabase
        .from('reported_posts')
        .update({ expires_at: newExpiresAt.toISOString() })
        .eq('id', post_id)
        .eq('user_id', user_id)
        .select('id, title')
        .single();
      
      updateError = error;
      postData = data;
    } else if (post_type === 'adoption') {
      // For adoption posts, update the updated_at field instead
      const { data, error } = await supabase
        .from('adoption_posts')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', post_id)
        .eq('user_id', user_id)
        .select('id, title')
        .single();
      
      updateError = error;
      postData = data;
    } else if (post_type === 'classified') {
      // For classifieds, update the updated_at field
      const { data, error } = await supabase
        .from('classifieds')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', post_id)
        .eq('user_id', user_id)
        .select('id, title')
        .single();
      
      updateError = error;
      postData = data;
    }

    if (updateError) {
      console.error('Error updating post:', updateError);
      throw updateError;
    }

    if (!postData) {
      return new Response(JSON.stringify({ error: 'Post not found or not owned by user' }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id,
        type: 'post_renewed',
        message: `Tu publicación "${postData.title || post_id}" ha sido renovada exitosamente.`,
        meta: {
          post_type,
          post_id,
          renewed_until: newExpiresAt.toISOString()
        }
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    // Get user email and send confirmation
    const { data: userData } = await supabase.auth.admin.getUserById(user_id);
    
    if (userData?.user?.email) {
      const emailSubject = "Publicación renovada — Pawsi";
      const emailBody = `
        <h2>Publicación renovada exitosamente</h2>
        <p>Hola,</p>
        <p>Tu publicación <strong>"${postData.title || post_id}"</strong> ha sido renovada exitosamente.</p>
        ${post_type === 'lost' || post_type === 'reported' ? 
          `<p>Nueva fecha de expiración: <strong>${newExpiresAt.toLocaleDateString('es-AR')}</strong></p>` : 
          `<p>Tu publicación ha sido actualizada para aparecer como nueva.</p>`
        }
        <p>Gracias por usar Pawsi.</p>
        <p>Equipo de Pawsi</p>
      `;

      const emailResponse = await resend.emails.send({
        from: "Pawsi <noreply@pawsi.com>",
        to: [userData.user.email],
        subject: emailSubject,
        html: emailBody,
      });

      console.log('Renewal confirmation email sent:', emailResponse);
    }

    return new Response(JSON.stringify({ 
      ok: true,
      renewed_until: newExpiresAt.toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error renewing post:', error);
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