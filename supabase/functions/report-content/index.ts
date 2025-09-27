import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportRequest {
  content_type: 'post' | 'message' | 'profile';
  content_id: string;
  reason: string;
  message?: string;
  reporter_id?: string;
  reported_user_id?: string;
}

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
    const { content_type, content_id, reason, message, reporter_id, reported_user_id }: ReportRequest = await req.json();

    console.log('Processing report:', { content_type, content_id, reason, reporter_id });

    // Insert report into database
    const { data: report, error: reportError } = await supabase
      .from('post_reports')
      .insert({
        post_type: content_type,
        post_id: content_id,
        reason,
        description: message,
        reporter_user_id: reporter_id,
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error inserting report:', reportError);
      throw reportError;
    }

    console.log('Report created:', report.id);

    // Send email to admin
    const adminEmailSubject = `Nuevo reporte en Pawsi — ${content_type} ${content_id}`;
    const adminEmailBody = `
      <h2>Nuevo reporte recibido</h2>
      <p><strong>ID del reporte:</strong> ${report.id}</p>
      <p><strong>Tipo de contenido:</strong> ${content_type}</p>
      <p><strong>ID del contenido:</strong> ${content_id}</p>
      <p><strong>Razón:</strong> ${reason}</p>
      ${message ? `<p><strong>Mensaje:</strong> ${message}</p>` : ''}
      <p><strong>Reporter ID:</strong> ${reporter_id || 'Anónimo'}</p>
      <p><strong>Usuario reportado ID:</strong> ${reported_user_id || 'N/A'}</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</p>
      <hr>
      <p><a href="https://supabase.com/dashboard/project/${Deno.env.get('SUPABASE_PROJECT_REF')}/editor" target="_blank">Ver en Supabase</a></p>
    `;

    const adminEmailResponse = await resend.emails.send({
      from: "Pawsi <noreply@pawsi.com>",
      to: ["ecomervix@gmail.com"],
      subject: adminEmailSubject,
      html: adminEmailBody,
    });

    console.log('Admin email sent:', adminEmailResponse);

    // Send confirmation email to reporter if available
    if (reporter_id) {
      const { data: reporterProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', reporter_id)
        .single();

      if (reporterProfile) {
        // Get reporter email from auth.users (this requires service role)
        const { data: userData } = await supabase.auth.admin.getUserById(reporter_id);
        
        if (userData?.user?.email) {
          const confirmationEmailBody = `
            <h2>Recibimos tu reporte</h2>
            <p>Hola,</p>
            <p>Recibimos tu reporte con ID: <strong>${report.id}</strong></p>
            <p>Gracias por ayudar a mantener nuestra comunidad segura. Lo revisaremos pronto.</p>
            <p>Equipo de Pawsi</p>
          `;

          const confirmationEmailResponse = await resend.emails.send({
            from: "Pawsi <noreply@pawsi.com>",
            to: [userData.user.email],
            subject: "Recibimos tu reporte — Pawsi",
            html: confirmationEmailBody,
          });

          console.log('Confirmation email sent:', confirmationEmailResponse);
        }
      }
    }

    return new Response(JSON.stringify({ 
      ok: true, 
      report_id: report.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error processing report:', error);
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