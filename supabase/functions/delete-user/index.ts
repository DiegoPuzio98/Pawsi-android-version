// Supabase Edge Function: delete-user
// Deletes the currently authenticated user and their profile
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Json = Record<string, unknown> | Array<unknown> | string | number | boolean | null;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables");
      return new Response(JSON.stringify({ error: "Missing Supabase envs" } as Json), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(JSON.stringify({ error: "No auth" }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Client to read the current user from the JWT
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Admin client to bypass RLS and delete user
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      console.error("User authentication error:", userErr);
      return new Response(JSON.stringify({ error: "Not authenticated" }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Deleting user: ${user.id}`);

    // Clean profile (optional, but helps with cleanup)
    const { error: profileError } = await admin.from("profiles").delete().eq("id", user.id);
    if (profileError) {
      console.warn("Error deleting profile:", profileError);
    }

    // Delete auth user
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) {
      console.error("Error deleting user:", delErr);
      return new Response(JSON.stringify({ error: delErr.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`User ${user.id} successfully deleted`);
    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error("Unexpected error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});