/*
  # Fix password reset functionality

  1. Changes
    - Add function to cleanup expired password reset tokens
    - Add function to validate password reset token
    - Add index for better performance
    - Add logging for password reset attempts

  2. Security
    - All functions run with SECURITY DEFINER
    - Proper error handling and validation
*/

-- Add function to cleanup expired password reset tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_password_reset_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update users with expired tokens
  UPDATE public.users
  SET 
    password_reset_token = NULL,
    password_reset_token_expires = NULL
  WHERE 
    password_reset_token IS NOT NULL
    AND password_reset_token_expires < now();
END;
$$;

-- Add function to validate password reset token
CREATE OR REPLACE FUNCTION public.validate_password_reset_token(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_record RECORD;
BEGIN
  -- Find user with matching token
  SELECT * INTO v_user_record
  FROM public.users
  WHERE password_reset_token = p_token
  AND password_reset_token_expires > now();

  -- Handle invalid or expired token
  IF v_user_record IS NULL THEN
    -- Check if token exists but expired
    IF EXISTS (
      SELECT 1 FROM public.users 
      WHERE password_reset_token = p_token 
      AND password_reset_token_expires <= now()
    ) THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'パスワードリセットリンクの有効期限が切れています。'
      );
    END IF;

    RETURN jsonb_build_object(
      'valid', false,
      'error', 'パスワードリセットリンクが無効です。'
    );
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'email', v_user_record.email
  );
END;
$$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_password_reset_attempts_email_created 
ON public.password_reset_attempts(email, created_at);

-- Add function to log password reset attempt
CREATE OR REPLACE FUNCTION public.log_password_reset_attempt(
  p_email text,
  p_success boolean,
  p_error_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.password_reset_attempts (
    email,
    success,
    error_message
  ) VALUES (
    p_email,
    p_success,
    p_error_message
  );
END;
$$;