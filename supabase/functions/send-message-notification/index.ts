import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface MessageNotificationRequest {
  recipient_id: string;
  sender_id: string;
  message_subject: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipient_id, sender_id, message_subject }: MessageNotificationRequest = await req.json();

    // Get sender profile
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', sender_id)
      .single();

    const senderName = senderProfile?.display_name || 'Usuario';

    // Create notification
    await supabase.from('notifications').insert({
      user_id: recipient_id,
      type: 'new_message',
      message: `Nuevo mensaje de ${senderName}: ${message_subject}`,
      meta: { sender_id, message_subject }
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error sending message notification:', error);
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