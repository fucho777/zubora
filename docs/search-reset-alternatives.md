# 検索回数リセット機能 - SQL Direct アプローチ

GitHub Actions で認証の問題が継続的に発生するため、以下の代替手段で対応します。

## 方法 1: Supabase SQL スケジューラを使用する

Supabase ダッシュボード > SQL Editor から以下の手順で定期実行を設定します：

1. 「+ New Query」ボタンをクリック
2. 以下の SQL コードを貼り付け：

```sql
-- 検索回数を毎日リセットする
SELECT reset_daily_search_count();
```

3. 「Schedule」ボタンをクリック
4. スケジュール設定：
   - Name: `Daily Search Count Reset`
   - Schedule: `0 0 * * *` (毎日午前 0 時に実行)
   - Timezone: `Asia/Tokyo`
5. 「Create schedule」ボタンをクリック

これで Supabase 内部で毎日定期的に検索回数がリセットされます。

## 方法 2: cron.みたいな外部サービスを使用する

外部の cron サービスを使って直接データベースに接続する方法もあります：

1. [cron-job.org](https://cron-job.org/)などの外部 cron サービスにサインアップ
2. 以下の cURL コマンドを設定：

```bash
curl -X POST https://pmjdyztlqovnqjwavbpb.supabase.co/rest/v1/rpc/reset_daily_search_count \
-H "apikey: YOUR_SUPABASE_ANON_KEY_HERE" \
-H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY_HERE" \
-H "Content-Type: application/json"
```

**注意**: `YOUR_SUPABASE_ANON_KEY_HERE`を`.env`ファイルにある実際の`VITE_SUPABASE_ANON_KEY`の値に置き換えてください。

3. 毎日午前 0 時に実行するように設定

## 方法 3: PostgreSQL の cron 拡張機能を使う

もし Postgres の cron 拡張機能が有効化されている場合、以下の方法でスケジュール設定できます：

```sql
-- cron拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 毎日0時に検索回数をリセットするジョブを追加
SELECT cron.schedule('0 0 * * *', 'SELECT reset_daily_search_count()');
```

**注意**: この方法は Supabase で`pg_cron`拡張機能が有効になっている必要があります。
