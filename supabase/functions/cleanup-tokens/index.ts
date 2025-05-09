import { createClient } from 'npm:@supabase/supabase-js@2.39.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, Authorization, accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Verify required environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey,
        timestamp: new Date().toISOString()
      });
      throw new Error('Missing required environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting token cleanup...', {
      timestamp: new Date().toISOString()
    });

    // Call the cleanup function
    const { data, error } = await supabase
      .rpc('cleanup_expired_verification_tokens')
      .throwOnError();

    if (error) {
      console.error('Database cleanup error:', {
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    console.log('Token cleanup completed', {
      data,
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
    console.error('Token cleanup failed:', errorDetails);

    return new Response(
      JSON.stringify({ 
        error: 'Failed to cleanup expired tokens',
        details: errorDetails.message,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});