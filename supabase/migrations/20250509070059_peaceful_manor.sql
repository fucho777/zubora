/*
  # Fix email verification flow

  1. Changes
    - Drop existing verify_email function
    - Create new verify_email function with jsonb return type
    - Add detailed error handling and logging
    - Maintain verification attempts tracking

  2. Security
    - Maintain SECURITY DEFINER
    - Keep existing RLS policies
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS public.verify_email(text);

-- Create the new function with jsonb return type
CREATE OR REPLACE FUNCTION public.verify_email(token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    current_time timestamptz := now();
    result jsonb;
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
            
            result := jsonb_build_object(
                'success', false,
                'error', 'Token expired'
            );
            RETURN result;
        END IF;

        -- Token doesn't exist
        UPDATE verification_attempts 
        SET error_message = 'Invalid token'
        WHERE token = token AND created_at = current_time;
        
        result := jsonb_build_object(
            'success', false,
            'error', 'Invalid token'
        );
        RETURN result;
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

    result := jsonb_build_object(
        'success', true,
        'email', user_record.email
    );
    RETURN result;
END;
$$;