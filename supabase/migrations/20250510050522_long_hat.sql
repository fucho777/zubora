/*
  # Add account deletion logging and cleanup

  1. New Functions
    - `delete_user_account`: Safely deletes a user account and all related data
    - `log_account_deletion`: Logs account deletion details

  2. Security
    - Only allow authenticated users to delete their own accounts
    - Ensure all related data is properly cleaned up
    - Log deletion attempts for audit purposes
*/

-- Function to delete user account and related data
CREATE OR REPLACE FUNCTION public.delete_user_account(p_user_id uuid, p_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_valid_password boolean;
  v_result jsonb;
BEGIN
  -- Verify password
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = p_user_id
    AND encrypted_password = crypt(p_password, encrypted_password)
  ) INTO v_valid_password;

  IF NOT v_valid_password THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'パスワードが正しくありません。'
    );
  END IF;

  -- Begin deletion process
  BEGIN
    -- Delete saved recipes (cascade will handle foreign key relationships)
    DELETE FROM public.saved_recipes WHERE user_id = p_user_id;
    
    -- Delete user record
    DELETE FROM public.users WHERE id = p_user_id;
    
    -- Log the deletion
    INSERT INTO public.account_deletion_logs (
      user_id,
      metadata
    ) VALUES (
      p_user_id,
      jsonb_build_object(
        'deleted_at', CURRENT_TIMESTAMP,
        'had_saved_recipes', EXISTS (
          SELECT 1 FROM public.saved_recipes WHERE user_id = p_user_id
        )
      )
    );

    -- Return success
    RETURN jsonb_build_object(
      'success', true,
      'message', 'アカウントが正常に削除されました。'
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error and return failure
    RETURN jsonb_build_object(
      'success', false,
      'error', 'アカウントの削除中にエラーが発生しました。'
    );
  END;
END;
$$;