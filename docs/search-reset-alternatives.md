# 検索回数リセット機能 - SQL Direct アプローチ

GitHub Actionsで認証の問題が継続的に発生するため、以下の代替手段で対応します。

## 方法1: Supabase SQLスケジューラを使用する

Supabaseダッシュボード > SQL Editor から以下の手順で定期実行を設定します：

1. 「+ New Query」ボタンをクリック
2. 以下のSQLコードを貼り付け：

```sql
-- 検索回数を毎日リセットする
SELECT reset_daily_search_count();
```

3. 「Schedule」ボタンをクリック
4. スケジュール設定：
   - Name: `Daily Search Count Reset`
   - Schedule: `0 0 * * *` (毎日午前0時に実行)
   - Timezone: `Asia/Tokyo`
5. 「Create schedule」ボタンをクリック

これでSupabase内部で毎日定期的に検索回数がリセットされます。

## 方法2: cron.みたいな外部サービスを使用する

外部のcronサービスを使って直接データベースに接続する方法もあります：

1. [cron-job.org](https://cron-job.org/)などの外部cronサービスにサインアップ
2. 以下のcURLコマンドを設定：

```bash
curl -X POST https://pmjdyztlqovnqjwavbpb.supabase.co/rest/v1/rpc/reset_daily_search_count \
-H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtamR5enRscW92bnFqd2F2YnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MTg2MDUsImV4cCI6MjA2MjE5NDYwNX0.gAXbydA6xLBHUepiXER_97BGRHk6sT56Q-qOzCMmMp8" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtamR5enRscW92bnFqd2F2YnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MTg2MDUsImV4cCI6MjA2MjE5NDYwNX0.gAXbydA6xLBHUepiXER_97BGRHk6sT56Q-qOzCMmMp8" \
-H "Content-Type: application/json"
```

3. 毎日午前0時に実行するように設定

## 方法3: PostgreSQLのcron拡張機能を使う

もしPostgresのcron拡張機能が有効化されている場合、以下の方法でスケジュール設定できます：

```sql
-- cron拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 毎日0時に検索回数をリセットするジョブを追加
SELECT cron.schedule('0 0 * * *', 'SELECT reset_daily_search_count()');
```

**注意**: この方法はSupabaseで`pg_cron`拡張機能が有効になっている必要があります。
