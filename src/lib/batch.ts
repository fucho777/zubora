import { supabase } from './supabase';

export interface BatchJob {
  id: string;
  job_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function createBatchJob(
  jobType: string,
  metadata: Record<string, unknown> = {}
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .rpc('create_batch_job', {
        p_job_type: jobType,
        p_metadata: metadata
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating batch job:', error);
    return null;
  }
}

export async function getBatchJob(jobId: string): Promise<BatchJob | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_batch_job', {
        p_job_id: jobId
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting batch job:', error);
    return null;
  }
}

export async function processBatchJobs(): Promise<void> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration is missing');
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/batch-processor`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Failed to process batch jobs: ${
          errorData?.error || response.statusText
        }`
      );
    }

    const result = await response.json();
    console.log('Batch processing result:', result);
  } catch (error) {
    console.error('Batch processing error:', error);
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      console.error('Network error - Edge Function might not be deployed');
    }
    throw error;
  }
}

// Schedule batch jobs
export async function scheduleBatchJobs(): Promise<void> {
  try {
    // Schedule token cleanup job
    await createBatchJob('cleanup_tokens');
    
    // Schedule old jobs cleanup
    await createBatchJob('cleanup_old_jobs');
    
    // Schedule popular videos update
    await createBatchJob('update_popular_videos', {
      limit: 100,
      updateMetadata: true
    });
  } catch (error) {
    console.error('Error scheduling batch jobs:', error);
  }
}