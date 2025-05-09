/*
  # Fix verify email function with proper timestamp handling

  1. Changes
    - Fix timestamp comparison logic
    - Improve error handling and messages
    - Add proper type casting
    - Return detailed error messages in Japanese

  2. Security
    - Maintain SECURITY DEFINER
    - Keep existing RLS policies
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS public.verify_email(text);

-- Create the new function with improved timestamp handling
CREATE OR REPLACE FUNCTION public.verify_email(token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    result jsonb;
BEGIN
    -- Log verification attempt
    INSERT INTO verification_attempts (token, verified)
    VALUES (token, false);

    -- Find user with matching token
    SELECT * INTO user_record
    FROM public.users
    WHERE verification_token = token
    AND verification_token_expires IS NOT NULL
    AND verification_token_expires > CURRENT_TIMESTAMP
    AND NOT email_verified;

    -- Handle various error cases
    IF user_record IS NULL THEN
        -- Check if token exists but expired
        IF EXISTS (
            SELECT 1 FROM public.users 
            WHERE verification_token = token 
            AND verification_token_expires IS NOT NULL
            AND verification_token_expires <= CURRENT_TIMESTAMP
        ) THEN
            UPDATE verification_attempts 
            SET error_message = 'Token expired'
            WHERE token = token 
            AND created_at >= CURRENT_TIMESTAMP - interval '1 minute';
            
            result := jsonb_build_object(
                'success', false,
                'error', 'Token expired',
                'message', 'メール認証リンクの有効期限が切れています。新しい認証メールを送信してください。'
            );
            RETURN result;
        END IF;

        -- Token doesn't exist or is invalid
        UPDATE verification_attempts 
        SET error_message = 'Invalid token'
        WHERE token = token 
        AND created_at >= CURRENT_TIMESTAMP - interval '1 minute';
        
        result := jsonb_build_object(
            'success', false,
            'error', 'Invalid token',
            'message', 'メール認証リンクが無効です。新しい認証メールを送信してください。'
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
    SET 
        verified = true,
        error_message = NULL
    WHERE token = token 
    AND created_at >= CURRENT_TIMESTAMP - interval '1 minute';

    result := jsonb_build_object(
        'success', true,
        'email', user_record.email,
        'message', 'メールアドレスの確認が完了しました。'
    );
    RETURN result;
END;
$$;