# GitHub Actions を使った検索回数のリセット機能

この文書では、GitHub Actions を使って検索回数リセット機能を毎日自動実行するための設定手順を説明します。

## セットアップ手順

### 1. ワークフローファイルの作成

プロジェクトディレクトリに `.github/workflows/reset-search-count.yml` ファイルが既に作成されています。このファイルに以下の設定が含まれています：

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
          curl -X POST https://pmjdyztlqovnqjwavbpb.functions.supabase.co/reset-daily-search-count \
          -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
          -H "Content-Type: application/json" \
          -d '{}'
```

### 2. GitHub シークレットの設定

1. GitHub リポジトリにアクセスし、「Settings」タブをクリック
2. 左側のメニューから「Secrets and variables」→「Actions」を選択
3. 「New repository secret」ボタンをクリック
4. 次の内容で新しいシークレットを作成:
   - 名前: `CRON_SECRET`
   - 値: Edge Function で設定したシークレットキー（例：`yWcXRdLzKpA8vTqB3mS5`）と同じ値
5. 「Add secret」をクリック

### 重要なポイント

- `${{ secrets.CRON_SECRET }}` という構文は、GitHub シークレットの値を参照するための標準的な方法です
- シークレットキー自体をコードにハードコードすることは避け、必ず GitHub の Secrets 機能を使用してください
- GitHub Actions のワークフローログには、実際のシークレット値は表示されません（セキュリティのため自動的にマスクされます）

### 手動実行方法

ワークフローを手動で実行してテストするには:

1. GitHub リポジトリの「Actions」タブに移動
2. 左側のワークフローリストから「Reset Daily Search Count」を選択
3. 右側の「Run workflow」ボタンをクリック
4. 「Run workflow」をクリック

実行後、GitHub のワークフローログで結果を確認できます。成功すると、Edge Function からの応答（`{"success":true,"count":X}`）がログに表示されます。
