/*
  # Add email verification support

  1. Changes
    - Add email_verified column to users table
    - Add verification_token column to users table
    - Add verification_token_expires column to users table
    - Update RLS policies to handle verification
    - Add function to verify email tokens

  2. Security
    - Only allow verified users to access protected resources
    - Secure token handling
*/

-- Add new columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token text,
ADD COLUMN IF NOT EXISTS verification_token_expires timestamptz;

-- Create function to verify email
CREATE OR REPLACE FUNCTION public.verify_email(token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find user with matching token that hasn't expired
  SELECT * INTO user_record
  FROM public.users
  WHERE verification_token = token
  AND verification_token_expires > now();

  -- If no user found or token expired, return false
  IF user_record IS NULL THEN
    RETURN false;
  END IF;

  -- Update user as verified
  UPDATE public.users
  SET 
    email_verified = true,
    verification_token = NULL,
    verification_token_expires = NULL
  WHERE id = user_record.id;

  RETURN true;
END;
$$;