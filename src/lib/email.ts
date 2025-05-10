interface EmailOptions {
  type: 'verification' | 'reset';
  email: string;
  token: string;
  baseUrl: string;
}

export const sendEmail = async ({
  type,
  email: string, 
  token: string,
  baseUrl: string
}: EmailOptions) => {
  try {
    // Ensure we have a valid base URL
    if (!baseUrl) {
      baseUrl = window.location.origin;
    }

    // Construct the appropriate redirect URL
    const redirectUrl = `${baseUrl}/${type === 'verification' ? 'verify-email' : 'reset-password'}`;

    console.log('Sending verification email:', {
      email,
      redirectUrl,
      hasToken: !!token,
      type
    });

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${type === 'verification' ? 'send-verification-email' : 'send-password-reset'}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email,
          token,
          redirectUrl,
        }),
      }
    );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Failed to send ${type} email`);
  }

  return response.json();
  } catch (error) {
    console.error(`Error sending ${type} email:`, error);
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw new Error(`${type === 'verification' ? '確認' : 'リセット'}メールの送信に失敗しました。しばらく時間をおいて再度お試しください。`);
  }
};

// Convenience functions for specific email types
export const sendVerificationEmail = async (email: string, token: string, baseUrl: string) => {
  return sendEmail({ type: 'verification', email, token, baseUrl });
};

export const sendPasswordResetEmail = async (email: string, token: string, baseUrl: string) => {
  return sendEmail({ type: 'reset', email, token, baseUrl });
};