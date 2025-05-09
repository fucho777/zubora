import { createTransport } from 'npm:nodemailer@6.9.12';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface EmailRequest {
  email: string;
  token: string;
  redirectUrl: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const { email, token, redirectUrl } = await req.json() as EmailRequest;

    // Validate redirectUrl
    if (!redirectUrl || !redirectUrl.startsWith('http')) {
      throw new Error('Invalid redirect URL');
    }

    // Verify required environment variables
    const gmailUser = Deno.env.get('GMAIL_USER');
    const gmailAppPassword = Deno.env.get('GMAIL_APP_PASSWORD');

    if (!gmailUser || !gmailAppPassword) {
      throw new Error('Missing required environment variables');
    }

    // Create verification URL using the provided redirect URL
    const verificationUrl = `${redirectUrl}?token=${token}`;

    const transporter = createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    const mailOptions = {
      from: Deno.env.get('GMAIL_USER'),
      to: email,
      subject: 'メールアドレスの確認 - ズボラシェフAI',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">ズボラシェフAI</h1>
          <p>ご登録ありがとうございます！</p>
          <p>以下のボタンをクリックして、メールアドレスの確認を完了してください：</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #f97316; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              メールアドレスを確認する
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            このリンクは24時間有効です。期限が切れた場合は、再度登録をお願いします。
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send verification email' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
        statusText: error.message
      }
    );
  }
});