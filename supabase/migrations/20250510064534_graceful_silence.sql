/*
  # Add password reset functionality

  1. Changes
    - Add function to initiate password reset
    - Add function to validate reset token
    - Add function to reset password
    - Add logging for reset attempts

  2. Security
    - Secure token generation
    - Token expiration
    - Rate limiting
    - Detailed error logging
*/

-- Function to initiate password reset
CREATE OR REPLACE FUNCTION public.initiate_password_reset(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_record RECORD;
  v_token text;
  v_attempts_count integer;
BEGIN
  -- Check rate limiting (max 5 attempts per hour)
  SELECT COUNT(*)
  INTO v_attempts_count
  FROM password_reset_attempts
  WHERE email = p_email
  AND created_at > now() - interval '1 hour';

  IF v_attempts_count >= 5 THEN
    -- Log attempt
    INSERT INTO password_reset_attempts (
      email,
      success,
      error_message
    ) VALUES (
      p_email,
      false,
      'Rate limit exceeded'
    );

    RETURN jsonb_build_object(
      'success', false,
      'error', '試行回数が多すぎます。しばらく時間をおいてから再度お試しください。'
    );
  END IF;

  -- Find user by email
  SELECT * INTO v_user_record
  FROM public.users
  WHERE email = p_email
  AND email_verified = true;

  -- If user not found or email not verified, still return success to prevent email enumeration
  IF v_user_record IS NULL THEN
    -- Log attempt
    INSERT INTO password_reset_attempts (
      email,
      success,
      error_message
    ) VALUES (
      p_email,
      false,
      'User not found or email not verified'
    );

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

  -- Log successful attempt
  INSERT INTO password_reset_attempts (
    email,
    success
  ) VALUES (
    p_email,
    true
  );

  -- Return success with token
  RETURN jsonb_build_object(
    'success', true,
    'token', v_token,
    'message', 'パスワードリセットの手順をメールで送信しました。'
  );
END;
$$;

-- Function to validate reset token
CREATE OR REPLACE FUNCTION public.validate_reset_token(p_token text)
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

  -- Log successful password reset
  INSERT INTO password_reset_attempts (
    email,
    success
  ) VALUES (
    v_user_record.email,
    true
  );

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'message', 'パスワードが正常に変更されました。'
  );
END;
$$;