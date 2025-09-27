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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting daily maintenance job...');

    // 1. Send renewal reminders (2 days before expiration)
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    // Get lost posts expiring in 2 days
    const { data: expiringLostPosts, error: lostError } = await supabase
      .from('lost_posts')
      .select('id, title, user_id, expires_at')
      .eq('status', 'active')
      .lte('expires_at', twoDaysFromNow.toISOString())
      .gt('expires_at', new Date().toISOString());

    if (lostError) {
      console.error('Error fetching expiring lost posts:', lostError);
    }

    // Get reported posts expiring in 2 days
    const { data: expiringReportedPosts, error: reportedError } = await supabase
      .from('reported_posts')
      .select('id, title, user_id, expires_at')
      .eq('status', 'active')
      .lte('expires_at', twoDaysFromNow.toISOString())
      .gt('expires_at', new Date().toISOString());

    if (reportedError) {
      console.error('Error fetching expiring reported posts:', reportedError);
    }

    // Send renewal reminders
    const expiringPosts = [
      ...(expiringLostPosts || []).map(p => ({ ...p, type: 'lost' })),
      ...(expiringReportedPosts || []).map(p => ({ ...p, type: 'reported' }))
    ];

    for (const post of expiringPosts) {
      // Create notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: post.user_id,
          type: 'renewal_reminder',
          message: `Tu publicación "${post.title || post.id}" expira pronto. ¡Renuévala para mantenerla visible!`,
          meta: {
            post_type: post.type,
            post_id: post.id,
            expires_at: post.expires_at
          }
        });

      if (notificationError) {
        console.error('Error creating renewal notification:', notificationError);
      }

      // Send email reminder
      const { data: userData } = await supabase.auth.admin.getUserById(post.user_id);
      
      if (userData?.user?.email) {
        const emailSubject = "Tu publicación expira pronto — Pawsi";
        const emailBody = `
          <h2>Tu publicación está por expirar</h2>
          <p>Hola,</p>
          <p>Tu publicación <strong>"${post.title || post.id}"</strong> expira el ${new Date(post.expires_at).toLocaleDateString('es-AR')}.</p>
          <p>Para mantenerla visible en Pawsi, puedes renovarla por 2 meses más desde tu panel de usuario.</p>
          <p><a href="${Deno.env.get('SUPABASE_URL')}/dashboard" target="_blank" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Renovar Publicación</a></p>
          <p>Si no la renuevas, será eliminada automáticamente después de la fecha de expiración.</p>
          <p>Equipo de Pawsi</p>
        `;

        const emailResponse = await resend.emails.send({
          from: "Pawsi <noreply@pawsi.com>",
          to: [userData.user.email],
          subject: emailSubject,
          html: emailBody,
        });

        console.log(`Renewal reminder sent to ${userData.user.email}:`, emailResponse);
      }
    }

    // 2. Delete expired posts
    const now = new Date().toISOString();

    // Delete expired lost posts
    const { data: expiredLostPosts, error: expiredLostError } = await supabase
      .from('lost_posts')
      .select('id, title, user_id')
      .eq('status', 'active')
      .lt('expires_at', now);

    if (!expiredLostError && expiredLostPosts) {
      for (const post of expiredLostPosts) {
        // Delete the post
        const { error: deleteError } = await supabase
          .from('lost_posts')
          .delete()
          .eq('id', post.id);

        if (deleteError) {
          console.error('Error deleting expired lost post:', deleteError);
          continue;
        }

        // Create notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: post.user_id,
            type: 'post_deleted',
            message: `Tu publicación "${post.title || post.id}" fue eliminada automáticamente por haber expirado.`,
            meta: {
              post_type: 'lost',
              post_id: post.id,
              reason: 'expired'
            }
          });

        if (notificationError) {
          console.error('Error creating deletion notification:', notificationError);
        }

        // Log deletion
        const { error: logError } = await supabase
          .from('deletion_logs')
          .insert({
            content_type: 'lost',
            content_id: post.id,
            deleted_by: 'system:expired',
            processed: true
          });

        if (logError) {
          console.error('Error logging deletion:', logError);
        }
      }
    }

    // Delete expired reported posts
    const { data: expiredReportedPosts, error: expiredReportedError } = await supabase
      .from('reported_posts')
      .select('id, title, user_id')
      .eq('status', 'active')
      .lt('expires_at', now);

    if (!expiredReportedError && expiredReportedPosts) {
      for (const post of expiredReportedPosts) {
        // Delete the post
        const { error: deleteError } = await supabase
          .from('reported_posts')
          .delete()
          .eq('id', post.id);

        if (deleteError) {
          console.error('Error deleting expired reported post:', deleteError);
          continue;
        }

        // Create notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: post.user_id,
            type: 'post_deleted',
            message: `Tu publicación "${post.title || post.id}" fue eliminada automáticamente por haber expirado.`,
            meta: {
              post_type: 'reported',
              post_id: post.id,
              reason: 'expired'
            }
          });

        if (notificationError) {
          console.error('Error creating deletion notification:', notificationError);
        }

        // Log deletion
        const { error: logError } = await supabase
          .from('deletion_logs')
          .insert({
            content_type: 'reported',
            content_id: post.id,
            deleted_by: 'system:expired',
            processed: true
          });

        if (logError) {
          console.error('Error logging deletion:', logError);
        }
      }
    }

    // 3. Process unprocessed deletion logs (fallback for console deletions)
    const { data: unprocessedLogs, error: logsError } = await supabase
      .from('deletion_logs')
      .select('*')
      .eq('processed', false);

    if (!logsError && unprocessedLogs) {
      for (const log of unprocessedLogs) {
        // Try to find the user who owned the content
        let userId: string | null = null;

        // This would require additional logic to find the user based on content_id
        // For now, we'll mark it as processed since we can't determine the owner
        console.log(`Processing deletion log for ${log.content_type}:${log.content_id}`);

        const { error: updateError } = await supabase
          .from('deletion_logs')
          .update({ processed: true })
          .eq('id', log.id);

        if (updateError) {
          console.error('Error updating deletion log:', updateError);
        }
      }
    }

    console.log('Daily maintenance job completed successfully');

    return new Response(JSON.stringify({ 
      ok: true,
      processed: {
        renewal_reminders: expiringPosts.length,
        expired_lost_posts: expiredLostPosts?.length || 0,
        expired_reported_posts: expiredReportedPosts?.length || 0,
        unprocessed_logs: unprocessedLogs?.length || 0
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in daily maintenance job:', error);
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