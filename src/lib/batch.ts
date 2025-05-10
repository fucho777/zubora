import { supabase } from './supabase';
import { logEdgeFunctionError } from './utils';

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

// Check if Edge Function is available
async function checkEdgeFunctionAvailability(url: string, key: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${url}/functions/v1/batch-processor/health`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`
        }
      }
    );
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function processBatchJobs(): Promise<void> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration is missing. Please check your environment variables.');
    }

    // Check if Edge Function is available before proceeding
    const isAvailable = await checkEdgeFunctionAvailability(supabaseUrl, supabaseAnonKey);
    if (!isAvailable) {
      console.warn('Batch processor Edge Function is not available. Skipping batch processing.', {
        timestamp: new Date().toISOString()
      });
      return;
    }

    console.log('Starting batch processing...', {
      timestamp: new Date().toISOString(),
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    });

    const response = await fetch(
      `${supabaseUrl}/functions/v1/batch-processor`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      
      // Log the error details
      await logEdgeFunctionError('batch-processor', errorData.error || response.statusText, {
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      });
      
      throw new Error(`Failed to process batch jobs: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('Batch processing completed:', {
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Enhanced error logging
    const errorDetails = {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };

    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      console.warn('Batch processing: Network error (Edge Function may not be deployed)', {
        ...errorDetails,
        url: import.meta.env.VITE_SUPABASE_URL
      });
      return; // Silently handle network errors in development
    }
    
    console.error('Batch processing error:', errorDetails);
    
    // Log to Supabase if it's not a network error
    if (!(error instanceof Error) || !error.message.includes('Failed to fetch')) {
      await logEdgeFunctionError('batch-processor', errorDetails.message, errorDetails);
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