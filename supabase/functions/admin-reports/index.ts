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

const ADMIN_EMAIL = "ecomervix@gmail.com";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify the user is admin by checking their email
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (userError || !user || user.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Admin access required' }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'pending';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get reports with pagination
    const { data: reports, error: reportsError, count } = await supabase
      .from('post_reports')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (reportsError) {
      throw reportsError;
    }

    // For each report, try to get the content details
    const reportsWithContent = await Promise.all(
      reports.map(async (report) => {
        let contentData = null;
        
        try {
          if (report.post_type === 'adoption') {
            const { data } = await supabase
              .from('adoption_posts')
              .select('id, title, description, status, user_id')
              .eq('id', report.post_id)
              .single();
            contentData = data;
          } else if (report.post_type === 'lost') {
            const { data } = await supabase
              .from('lost_posts')
              .select('id, title, description, status, user_id')
              .eq('id', report.post_id)
              .single();
            contentData = data;
          } else if (report.post_type === 'reported') {
            const { data } = await supabase
              .from('reported_posts')
              .select('id, title, description, status, user_id')
              .eq('id', report.post_id)
              .single();
            contentData = data;
          } else if (report.post_type === 'classified') {
            const { data } = await supabase
              .from('classifieds')
              .select('id, title, description, status, user_id')
              .eq('id', report.post_id)
              .single();
            contentData = data;
          }
        } catch (error) {
          console.log(`Content not found for report ${report.id}:`, error);
        }

        return {
          ...report,
          content: contentData
        };
      })
    );

    return new Response(JSON.stringify({
      reports: reportsWithContent,
      pagination: {
        page,
        limit,
        total: count,
        total_pages: Math.ceil((count || 0) / limit)
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error fetching reports:', error);
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