import { createTransport } from 'npm:nodemailer@6.9.12';
import { createClient } from 'npm:@supabase/supabase-js@2.39.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
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

    // Get Gmail configuration
    const gmailUser = Deno.env.get('GMAIL_USER');
    const gmailAppPassword = Deno.env.get('GMAIL_APP_PASSWORD');

    if (!gmailUser || !gmailAppPassword) {
      throw new Error('Gmail configuration is missing');
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

    // Create email transporter
    const transporter = createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      }
    });

    // Send email
    await transporter.sendMail({
      from: gmailUser,
      to: email,
      subject: 'パスワードリセットのご案内 - ズボラシェフAI',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin: 0;">ズボラシェフAI</h1>
            <p style="color: #666; margin-top: 10px;">パスワードリセットのご案内</p>
          </div>
          
          <p>パスワードリセットのリクエストを受け付けました。<br>
          以下のボタンをクリックして、新しいパスワードを設定してください。</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" 
               style="background-color: #f97316; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;
                      font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              パスワードを再設定する
            </a>
          </div>
          
          <div style="background-color: #fff3e0; padding: 15px; border-radius: 6px; margin: 30px 0;">
            <p style="color: #d84315; font-size: 14px; margin: 0;">
              ※ このリンクの有効期限は1時間です。<br>
              ※ パスワードリセットの心当たりがない場合は、このメールを破棄してください。
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center; margin-bottom: 0;">
            このメールは自動送信されています。返信はできませんのでご了承ください。
          </p>
        </div>
      `
    });

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