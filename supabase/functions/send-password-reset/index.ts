import { createClient } from 'npm:@supabase/supabase-js@2.39.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const { email, token, redirectUrl } = await req.json();

    // Validate input
    if (!email || !token || !redirectUrl) {
      throw new Error('Missing required parameters');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get email service configuration
    const emailApiKey = Deno.env.get('EMAIL_API_KEY');
    const emailFrom = Deno.env.get('EMAIL_FROM');

    if (!emailApiKey || !emailFrom) {
      throw new Error('Email service not configured');
    }

    // Construct reset URL
    const resetUrl = `${redirectUrl}?token=${token}`;

    // Send email using your email service
    const response = await fetch('https://api.emailprovider.com/v1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: email,
        subject: 'パスワードリセットのご案内 - ズボラシェフAI',
        html: `
          <p>パスワードリセットのリクエストを受け付けました。</p>
          <p>以下のリンクをクリックして、新しいパスワードを設定してください：</p>
          <p><a href="${resetUrl}">パスワードを再設定する</a></p>
          <p>※このリンクの有効期限は1時間です。</p>
          <p>※心当たりのない場合は、このメールを破棄してください。</p>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending password reset email:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to send password reset email',
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});