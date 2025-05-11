# 検索回数のリセット機能

このディレクトリには、ユーザーの日次検索回数を自動的にリセットする Edge Function が含まれています。

## 機能概要

- 毎日深夜（00:00 JST）にすべてのユーザーの`daily_search_count`を 0 にリセット
- データベースの`reset_daily_search_count`関数を呼び出し
- 実行結果とリセットされたユーザー数をログに記録

## デプロイ手順

### 1. Edge Function をデプロイ

```bash
cd /Users/sugimotokento/Desktop/zubora
supabase functions deploy reset-daily-search-count
```

### 2. 環境変数の設定

セキュリティのため、この Edge Function 用の秘密鍵を設定します：

```bash
supabase secrets set CRON_SECRET=YOUR_SECRET_KEY
```

`YOUR_SECRET_KEY`は強力なランダム文字列に置き換えてください。

### 3. スケジュール設定

以下の方法で毎日実行されるようにスケジュールします：

#### 方法 1: Supabase Schedule を使う（推奨）

1. Supabase ダッシュボードにログイン
2. プロジェクト > Database > Scheduled tasks へ移動
3. 新しいスケジュールを作成:
   - 名前: `Reset daily search count`
   - スケジュール: `0 15 * * *` (毎日日本時間 0:00 に実行、UTC で 15:00)
   - SQL:
   ```sql
   SELECT http_post(
     'https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/reset-daily-search-count',
     '{}',
     '{}'::jsonb,
     array[
       http_header('Authorization', 'Bearer YOUR_SECRET_KEY')
     ]
   );
   ```

#### 方法 2: 外部 CRON サービスを使用

外部のクーロンサービス（例：cron-job.org）を使って、毎日 00:00 JST に Edge Function にリクエストを送信することもできます。

```
URL: https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/reset-daily-search-count
メソッド: POST
ヘッダー: Authorization: Bearer YOUR_SECRET_KEY
```

## テスト方法

機能を手動でテストするには：

```bash
curl -X POST https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/reset-daily-search-count \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "Content-Type: application/json"
```

成功した場合、レスポンスは以下のようになります：

```json
{ "success": true, "count": 10 }
```

## ローカルでのテスト

ローカル環境でテストする場合：

```bash
cd /Users/sugimotokento/Desktop/zubora
supabase start
supabase functions serve reset-daily-search-count
```

別のターミナルで：

```bash
curl -X POST http://localhost:54321/functions/v1/reset-daily-search-count \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "Content-Type: application/json"
```
