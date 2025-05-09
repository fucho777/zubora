import { createClient } from 'npm:@supabase/supabase-js@2.39.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface BatchJob {
  id: string;
  job_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  metadata: Record<string, unknown>;
}

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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify required environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Get pending jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('batch_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (jobsError) {
      throw jobsError;
    }

    const results = [];

    // Process each job
    for (const job of (jobs as BatchJob[] || [])) {
      try {
        // Mark job as running
        await supabase.rpc('update_batch_job_status', {
          p_job_id: job.id,
          p_status: 'running'
        });

        // Process job based on type
        switch (job.job_type) {
          case 'cleanup_tokens':
            await supabase.rpc('cleanup_expired_verification_tokens');
            break;

          case 'cleanup_old_jobs':
            await supabase.rpc('cleanup_old_batch_jobs');
            break;

          case 'update_popular_videos':
            // Implement video popularity update logic
            await updatePopularVideos(supabase);
            break;

          default:
            throw new Error(`Unknown job type: ${job.job_type}`);
        }

        // Mark job as completed
        await supabase.rpc('update_batch_job_status', {
          p_job_id: job.id,
          p_status: 'completed'
        });

        results.push({
          job_id: job.id,
          status: 'completed'
        });
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);

        // Mark job as failed
        await supabase.rpc('update_batch_job_status', {
          p_job_id: job.id,
          p_status: 'failed',
          p_error: error.message
        });

        results.push({
          job_id: job.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Batch processor error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process batch jobs',
        details: error.message,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function updatePopularVideos(supabase: any) {
  // Get videos with recent saves
  const { data: videos, error } = await supabase
    .from('popular_videos')
    .select('*')
    .order('save_count', { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  // Update video metadata and rankings
  for (const video of videos) {
    await supabase
      .from('popular_videos')
      .update({
        last_updated: new Date().toISOString()
      })
      .eq('video_id', video.video_id);
  }
}