import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabaseクライアントを初期化
// Edge Function内では環境変数からURLとキーを取得できます
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
    if (req.method === 'POST') {
      // セキュリティチェック - Authorization headerをチェック
      const authHeader = req.headers.get('Authorization');
      const envAuthKey = Deno.env.get('CRON_SECRET');
      
      if (!envAuthKey || authHeader !== `Bearer ${envAuthKey}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
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
    }
    
    // GETリクエストには簡単な説明を返す
    return new Response(JSON.stringify({ 
      description: 'This function resets daily search count for all users. It should be called on a schedule.'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
