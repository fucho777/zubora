// ベーシックな認証テスト用のEdge Function
Deno.serve(async (req) => {
  try {
    // リクエストのURLとヘッダーを取得
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const authHeader = req.headers.get('Authorization') || '';
    const envAuthKey = Deno.env.get('CRON_SECRET');

    // デバッグ情報を返す
    return new Response(
      JSON.stringify({
        success: true,
        debug: {
          method: req.method,
          url: req.url,
          token: token ? 'Present' : 'Missing',
          tokenLength: token?.length,
          authHeader: authHeader ? authHeader.substring(0, 10) + '...' : 'Missing',
          envKeyExists: !!envAuthKey,
          envKeyLength: envAuthKey?.length,
          // 極端に慎重なアプローチ: 最初の数文字だけを表示
          tokenFirstChars: token?.substring(0, 3),
          envKeyFirstChars: envAuthKey?.substring(0, 3),
          // 確認情報
          tokenMatches: token === envAuthKey,
          headerMatches: authHeader.replace(/^Bearer\s+/i, '') === envAuthKey
        }
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
