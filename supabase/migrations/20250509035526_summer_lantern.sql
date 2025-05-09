/*
  # Fix token cleanup implementation

  1. Changes
    - Add cleanup function for expired verification tokens
    - Add index on verification_token_expires for better performance

  2. Security
    - Function runs with SECURITY DEFINER to ensure proper permissions
*/

-- Add index for better performance when cleaning up expired tokens
CREATE INDEX IF NOT EXISTS idx_users_verification_token_expires 
ON public.users(verification_token_expires) 
WHERE verification_token_expires IS NOT NULL;

-- Create function to cleanup expired verification tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update users with expired tokens
  UPDATE public.users
  SET 
    verification_token = NULL,
    verification_token_expires = NULL
  WHERE 
    verification_token IS NOT NULL
    AND verification_token_expires < now();
END;
$$;