# 検索回数リセット機能のセットアップ手順

Supabase ダッシュボードに「Scheduled tasks」機能がない場合は、外部スケジューラーを使って検索回数のリセット機能を定期実行することができます。

## セットアップ手順

### 1. Edge Function のデプロイ

すでに作成した Edge Function をデプロイします。Supabase ダッシュボードから:

1. 左側のメニューから「Edge Functions」を選択
2. 「Create a new function」をクリック
3. 名前に「reset-daily-search-count」と入力
4. 次のコードをコピー＆ペースト:

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabaseクライアントを初期化
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

// メイン関数 - 検索回数をリセットする
const resetDailySearchCount = async () => {
  try {
    // reset_daily_search_count関数を呼び出す
    const { data, error } = await supabase.rpc("reset_daily_search_count");

    if (error) {
      console.error("Error resetting daily search count:", error.message);
      return { success: false, error: error.message };
    }

    console.log(`Daily search count reset for ${data} users`);
    return { success: true, count: data };
  } catch (e) {
    console.error("Unexpected error resetting daily search count:", e);
    return { success: false, error: e.message };
  }
};

// Denoハンドラー
Deno.serve(async (req) => {
  try {
    if (req.method === "POST") {
      // セキュリティチェック - Authorization headerをチェック
      const authHeader = req.headers.get("Authorization");
      const envAuthKey = Deno.env.get("CRON_SECRET");

      if (!envAuthKey || authHeader !== `Bearer ${envAuthKey}`) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // 検索回数リセット処理の実行
      const result = await resetDailySearchCount();

      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // GETリクエストには簡単な説明を返す
    return new Response(
      JSON.stringify({
        description:
          "This function resets daily search count for all users. It should be called on a schedule.",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

5. 「Deploy Function」をクリック

### 2. シークレットキーの設定

1. Edge Functions 設定ページで、「Secrets」タブに移動
2. 「Add New Secret」をクリック
3. 名前に「CRON_SECRET」と入力
4. 値には強力なランダム文字列を設定（例：`yWcXRdLzKpA8vTqB3mS5`）
5. 「Save」をクリック

### 3. 外部スケジューラーのセットアップ

#### 方法 1: Cron-job.org（推奨・簡単）

1. [Cron-job.org](https://cron-job.org)にアクセスしてアカウント登録
2. ログイン後「CREATE CRONJOB」ボタンをクリック
3. 基本設定:
   - タイトル: `Reset Zubora Chef Search Count`
   - URL: `https://YOUR_PROJECT_ID.functions.supabase.co/reset-daily-search-count`（YOUR_PROJECT_ID を実際のプロジェクト ID に置き換え）
   - メソッド: `POST`
   - Request Body: `{}`
   - Headers: `Authorization: Bearer YOUR_SECRET_KEY`（YOUR_SECRET_KEY を設定した値に置き換え）
4. スケジュール設定:
   - 「Advanced」タブをクリック
   - 「Every day at 00:00」（日本時間 0 時）に設定
5. 「CREATE CRONJOB」ボタンをクリック

#### 方法 2: GitHub Actions

リポジトリに GitHub Actions を設定する場合:

1. `.github/workflows/reset-search-count.yml`ファイルを作成:

```yaml
name: Reset Daily Search Count

on:
  schedule:
    # 毎日UTC 15:00 (日本時間 0:00) に実行
    - cron: "0 15 * * *"
  # 手動実行用
  workflow_dispatch:

jobs:
  reset-count:
    runs-on: ubuntu-latest
    steps:
      - name: Call Reset Function
        run: |
          curl -X POST https://YOUR_PROJECT_ID.functions.supabase.co/reset-daily-search-count \
          -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
          -H "Content-Type: application/json" \
          -d '{}'
```

2. GitHub リポジトリの「Settings」→「Secrets and variables」→「Actions」メニューで、新しいシークレットを追加:
   - 名前: `CRON_SECRET`
   - 値: Edge Function で設定した同じシークレットキーの値

### 4. 手動テスト

機能が正しく動作するか手動でテストするには:

```bash
curl -X POST https://YOUR_PROJECT_ID.functions.supabase.co/reset-daily-search-count \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

成功すると次のようなレスポンスが返ります:

```json
{ "success": true, "count": 10 }
```

## 重要: フォールバックメカニズム

すでに実装済みのクライアント側のフォールバックメカニズムにより、万が一スケジューラが実行されなくても、ユーザーが新しい日に最初に検索した時点で検索回数がリセットされます。
