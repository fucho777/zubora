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

    // Log attempt
    await supabase
      .from('password_reset_attempts')
      .insert({
        email,
        ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
      });

    // Construct reset URL with token
    const resetUrl = `${redirectUrl}?token=${token}`;

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
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
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>パスワードリセット - ズボラシェフAI</title>
            </head>
            <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #f97316; margin-bottom: 30px;">
                  ズボラシェフAI
                </h1>
                
                <p>パスワードリセットのリクエストを受け付けました。</p>
                
                <p>以下のボタンをクリックして、新しいパスワードを設定してください：</p>
                
                <p style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" 
                     style="background-color: #f97316; 
                            color: white; 
                            padding: 12px 24px; 
                            text-decoration: none; 
                            border-radius: 6px;
                            display: inline-block;">
                    パスワードを再設定する
                  </a>
                </p>
                
                <p style="color: #666; font-size: 14px;">
                  ※このリンクの有効期限は1時間です。<br>
                  ※心当たりのない場合は、このメールを破棄してください。
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #666; font-size: 12px; text-align: center;">
                  このメールは自動送信されています。返信はできませんのでご了承ください。
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to send email: ${errorData.message || response.statusText}`);
    }

    // Update attempt record with success
    await supabase
      .from('password_reset_attempts')
      .update({ success: true })
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending password reset email:', error);

    // Log error to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase
        .from('edge_function_logs')
        .insert({
          function_name: 'send-password-reset',
          status: 'error',
          error_message: error.message,
          metadata: {
            timestamp: new Date().toISOString(),
            stack: error.stack
          }
        });
    }

    return new Response(
      JSON.stringify({
        error: 'パスワードリセットメールの送信に失敗しました',
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});