/*
  # Add password reset token cleanup

  1. Changes
    - Add function to cleanup expired password reset tokens
    - Add function to validate password reset token
    - Add index for better performance when cleaning up expired tokens

  2. Security
    - Functions run with SECURITY DEFINER to ensure proper permissions
    - Validate token expiration
*/

-- Add index for better performance when cleaning up expired tokens
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token_expires 
ON public.users(password_reset_token_expires) 
WHERE password_reset_token_expires IS NOT NULL;

-- Function to cleanup expired password reset tokens
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

-- Function to validate password reset token
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