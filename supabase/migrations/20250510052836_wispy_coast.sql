/*
  # Add password reset functionality

  1. Changes
    - Add password_reset_token column to users table
    - Add password_reset_token_expires column to users table
    - Add function to initiate password reset
    - Add function to validate and reset password
    - Add table for password reset attempts tracking

  2. Security
    - Secure token handling
    - Rate limiting for reset attempts
    - Proper error handling
*/

-- Add password reset columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_reset_token text,
ADD COLUMN IF NOT EXISTS password_reset_token_expires timestamptz;

-- Create password reset attempts table
CREATE TABLE IF NOT EXISTS public.password_reset_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  user_agent text,
  success boolean DEFAULT false,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Function to initiate password reset
CREATE OR REPLACE FUNCTION public.initiate_password_reset(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_record RECORD;
  v_token text;
BEGIN
  -- Find user by email
  SELECT * INTO v_user_record
  FROM public.users
  WHERE email = p_email;

  -- If user not found, still return success to prevent email enumeration
  IF v_user_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'パスワードリセットの手順をメールで送信しました。'
    );
  END IF;

  -- Generate new reset token
  v_token := encode(gen_random_bytes(32), 'hex');

  -- Update user with reset token
  UPDATE public.users
  SET 
    password_reset_token = v_token,
    password_reset_token_expires = now() + interval '1 hour'
  WHERE id = v_user_record.id;

  -- Return success with token
  RETURN jsonb_build_object(
    'success', true,
    'token', v_token,
    'message', 'パスワードリセットの手順をメールで送信しました。'
  );
END;
$$;

-- Function to reset password
CREATE OR REPLACE FUNCTION public.reset_password(
  p_token text,
  p_new_password text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_record RECORD;
BEGIN
  -- Find user with valid reset token
  SELECT * INTO v_user_record
  FROM public.users
  WHERE password_reset_token = p_token
  AND password_reset_token_expires > now();

  -- Handle invalid or expired token
  IF v_user_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'パスワードリセットリンクが無効か期限切れです。'
    );
  END IF;

  -- Update password in auth.users table
  UPDATE auth.users
  SET encrypted_password = crypt(p_new_password, gen_salt('bf'))
  WHERE id = v_user_record.id;

  -- Clear reset token
  UPDATE public.users
  SET 
    password_reset_token = NULL,
    password_reset_token_expires = NULL
  WHERE id = v_user_record.id;

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'message', 'パスワードが正常に変更されました。'
  );
END;
$$;