export const sendVerificationEmail = async (
  email: string, 
  token: string,
  baseUrl: string
) => {
  try {
    // Ensure we have a valid base URL
    if (!baseUrl) {
      baseUrl = window.location.origin;
    }

    // Construct the full redirect URL
    const redirectUrl = `${baseUrl}/verify-email`;

    console.log('Sending verification email:', {
      email,
      redirectUrl,
      hasToken: !!token
    });

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-verification-email`,
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
    throw new Error(error.message || 'Failed to send verification email');
  }

  return response.json();
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw new Error('メール送信に失敗しました。しばらく時間をおいて再度お試しください。');
  }
};