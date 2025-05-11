/*
  # Add daily search count reset function

  1. Changes
    - Add function to reset daily search count for all users
    - Add this function to be called by scheduled cron job

  2. Security
    - Function runs with SECURITY DEFINER to ensure proper permissions
*/

-- Function to reset daily search count for all users
CREATE OR REPLACE FUNCTION public.reset_daily_search_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Update all users, reset their daily search count to 0
  UPDATE public.users
  SET 
    daily_search_count = 0
  WHERE
    daily_search_count > 0;
  
  -- Return number of users updated
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Comment explaining how to schedule this function
COMMENT ON FUNCTION public.reset_daily_search_count() IS 
'Function to reset daily search count for all users. 
Should be scheduled to run daily at midnight using pg_cron or 
Supabase Edge Functions with a scheduled trigger.';
