# GitHub Secrets for Reset Function

以下のシークレットをGitHubリポジトリに設定する必要があります：

1. リポジトリの「Settings」タブを開く
2. 左側のメニューから「Secrets and variables」→「Actions」を選択
3. 「New repository secret」ボタンをクリック
4. 次の内容でシークレットを作成:

## `SUPABASE_ANON_KEY`

Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtamR5enRscW92bnFqd2F2YnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MTg2MDUsImV4cCI6MjA2MjE5NDYwNX0.gAXbydA6xLBHUepiXER_97BGRHk6sT56Q-qOzCMmMp8`

## 注意点

シークレットを設定した後、GitHub Actionsワークフローを再度実行してください。
