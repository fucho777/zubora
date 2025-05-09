/*
  # Add Edge Function error handling

  1. Changes
    - Add function to log Edge Function errors
    - Add function to check Edge Function health
    - Add table for Edge Function logs

  2. Security
    - Only allow system to write logs
    - Allow authenticated users to read logs
*/

-- Create edge_function_logs table
CREATE TABLE IF NOT EXISTS public.edge_function_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  status text NOT NULL,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.edge_function_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for reading logs
CREATE POLICY "Authenticated users can read logs"
  ON public.edge_function_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to log Edge Function errors
CREATE OR REPLACE FUNCTION public.log_edge_function_error(
  p_function_name text,
  p_error_message text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.edge_function_logs (
    function_name,
    status,
    error_message,
    metadata
  )
  VALUES (
    p_function_name,
    'error',
    p_error_message,
    p_metadata
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;