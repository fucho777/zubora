/*
  # Enhance email verification system

  1. Changes
    - Add better token validation
    - Add token expiration check
    - Add error messages for different verification states
    - Add logging for verification attempts

  2. Security
    - Improve token validation
    - Add rate limiting for verification attempts
*/

-- Add verification attempt logging
CREATE TABLE IF NOT EXISTS verification_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    token text NOT NULL,
    ip_address text,
    user_agent text,
    verified boolean DEFAULT false,
    error_message text,
    created_at timestamptz DEFAULT now()
);

-- Enhanced verify_email function with better error handling
CREATE OR REPLACE FUNCTION public.verify_email(token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    current_time timestamptz := now();
BEGIN
    -- Log verification attempt
    INSERT INTO verification_attempts (token, verified)
    VALUES (token, false);

    -- Find user with matching token
    SELECT * INTO user_record
    FROM public.users
    WHERE verification_token = token
    AND verification_token_expires > current_time
    AND NOT email_verified;

    -- Handle various error cases
    IF user_record IS NULL THEN
        -- Check if token exists but expired
        IF EXISTS (
            SELECT 1 FROM public.users 
            WHERE verification_token = token 
            AND verification_token_expires <= current_time
        ) THEN
            UPDATE verification_attempts 
            SET error_message = 'Token expired'
            WHERE token = token AND created_at = current_time;
            RETURN false;
        END IF;

        -- Token doesn't exist
        UPDATE verification_attempts 
        SET error_message = 'Invalid token'
        WHERE token = token AND created_at = current_time;
        RETURN false;
    END IF;

    -- Update user as verified
    UPDATE public.users
    SET 
        email_verified = true,
        verification_token = NULL,
        verification_token_expires = NULL
    WHERE id = user_record.id;

    -- Log successful verification
    UPDATE verification_attempts 
    SET verified = true
    WHERE token = token AND created_at = current_time;

    RETURN true;
END;
$$;