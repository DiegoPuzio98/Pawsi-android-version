import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PostReportRequest {
  postId: string;
  postType: string;
  reason: string;
  description?: string;
  reporterEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postId, postType, reason, description, reporterEmail }: PostReportRequest = await req.json();

    const reasonLabels: Record<string, string> = {
      'spam': 'Spam o contenido repetitivo',
      'inappropriate': 'Contenido inapropiado', 
      'fake': 'Información falsa',
      'animal_abuse': 'Posible maltrato animal',
      'commercial': 'Venta comercial no permitida',
      'other': 'Otro motivo'
    };

    const emailResponse = await resend.emails.send({
      from: "PetHome Reports <onboarding@resend.dev>",
      to: ["ecomervix@gmail.com"],
      subject: `Reporte de publicación - ${reasonLabels[reason] || reason}`,
      html: `
        <h1>Nuevo reporte de publicación</h1>
        <p><strong>ID de publicación:</strong> ${postId}</p>
        <p><strong>Tipo de publicación:</strong> ${postType}</p>
        <p><strong>Motivo:</strong> ${reasonLabels[reason] || reason}</p>
        ${description ? `<p><strong>Descripción:</strong> ${description}</p>` : ''}
        ${reporterEmail ? `<p><strong>Email del reportante:</strong> ${reporterEmail}</p>` : '<p><strong>Reportante:</strong> Usuario anónimo</p>'}
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</p>
        <hr>
        <p><em>Este reporte fue enviado automáticamente desde PetHome.</em></p>
      `,
    });

    console.log("Report email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-post-report function:", error);
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