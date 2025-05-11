import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabaseクライアントを初期化
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

// メイン関数 - 検索回数をリセットする
const resetDailySearchCount = async () => {
  try {
    // reset_daily_search_count関数を呼び出す
    const { data, error } = await supabase.rpc('reset_daily_search_count');
    
    if (error) {
      console.error('Error resetting daily search count:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log(`Daily search count reset for ${data} users`);
    return { success: true, count: data };
  } catch (e) {
    console.error('Unexpected error resetting daily search count:', e);
    return { success: false, error: e.message };
  }
};

// Denoハンドラー
Deno.serve(async (req) => {
  try {
    // リクエストのURLからトークンを取得
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const envAuthKey = Deno.env.get('CRON_SECRET');

    // GETリクエストの場合、認証なしで説明を返す
    if (req.method === 'GET' && !token) {
      return new Response(JSON.stringify({ 
        description: 'This function resets daily search count for all users.',
        usage: 'Send a POST request with token parameter or use Authorization header'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Authorization headerとURLパラメータのどちらでも認証可能に
    const authHeader = req.headers.get('Authorization') || '';
    const isHeaderAuth = envAuthKey && authHeader.includes(envAuthKey);
    const isTokenAuth = envAuthKey && token === envAuthKey;

    // 認証チェック
    if (!isHeaderAuth && !isTokenAuth) {
      // ログ出力を追加
      console.error('Authentication failed:', { 
        headerAuth: authHeader ? 'Present' : 'Missing', 
        tokenAuth: token ? 'Present' : 'Missing',
        envKeyExists: !!envAuthKey
      });
      
      return new Response(JSON.stringify({ 
        error: 'Unauthorized', 
        message: 'Invalid or missing authentication'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 検索回数リセット処理の実行
    const result = await resetDailySearchCount();
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('Unexpected function error:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
