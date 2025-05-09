/*
  # Add batch processing functionality

  1. New Tables
    - `batch_jobs`
      - `id` (uuid, primary key) - Unique identifier for the job
      - `job_type` (text) - Type of batch job (e.g., 'cleanup_tokens', 'update_popular_videos')
      - `status` (text) - Current status of the job (pending, running, completed, failed)
      - `started_at` (timestamptz) - When the job started
      - `completed_at` (timestamptz) - When the job completed
      - `error` (text) - Error message if the job failed
      - `metadata` (jsonb) - Additional job metadata
      - `created_at` (timestamptz) - When the job was created

  2. Functions
    - `create_batch_job`: Creates a new batch job
    - `update_batch_job_status`: Updates the status of a batch job
    - `get_batch_job`: Gets the details of a batch job
    - `cleanup_old_batch_jobs`: Removes completed/failed jobs older than 7 days
*/

-- Create batch_jobs table
CREATE TABLE IF NOT EXISTS public.batch_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  error text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'running', 'completed', 'failed'))
);

-- Create index for job type and status
CREATE INDEX IF NOT EXISTS idx_batch_jobs_type_status 
ON public.batch_jobs(job_type, status);

-- Create index for cleanup
CREATE INDEX IF NOT EXISTS idx_batch_jobs_completed_at 
ON public.batch_jobs(completed_at) 
WHERE status IN ('completed', 'failed');

-- Function to create a new batch job
CREATE OR REPLACE FUNCTION public.create_batch_job(
  p_job_type text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_id uuid;
BEGIN
  INSERT INTO public.batch_jobs (job_type, metadata)
  VALUES (p_job_type, p_metadata)
  RETURNING id INTO v_job_id;
  
  RETURN v_job_id;
END;
$$;

-- Function to update batch job status
CREATE OR REPLACE FUNCTION public.update_batch_job_status(
  p_job_id uuid,
  p_status text,
  p_error text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.batch_jobs
  SET 
    status = p_status,
    started_at = CASE 
      WHEN p_status = 'running' AND started_at IS NULL THEN now()
      ELSE started_at
    END,
    completed_at = CASE 
      WHEN p_status IN ('completed', 'failed') THEN now()
      ELSE completed_at
    END,
    error = CASE
      WHEN p_status = 'failed' THEN p_error
      ELSE NULL
    END
  WHERE id = p_job_id;
END;
$$;

-- Function to get batch job details
CREATE OR REPLACE FUNCTION public.get_batch_job(p_job_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'job_type', job_type,
    'status', status,
    'started_at', started_at,
    'completed_at', completed_at,
    'error', error,
    'metadata', metadata,
    'created_at', created_at
  )
  INTO v_job
  FROM public.batch_jobs
  WHERE id = p_job_id;
  
  RETURN v_job;
END;
$$;

-- Function to cleanup old batch jobs
CREATE OR REPLACE FUNCTION public.cleanup_old_batch_jobs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  DELETE FROM public.batch_jobs
  WHERE 
    status IN ('completed', 'failed')
    AND completed_at < now() - interval '7 days'
  RETURNING count(*) INTO v_deleted_count;
  
  RETURN v_deleted_count;
END;
$$;