# GitHub Secrets for Reset Function

以下のシークレットを GitHub リポジトリに設定する必要があります：

1. リポジトリの「Settings」タブを開く
2. 左側のメニューから「Secrets and variables」→「Actions」を選択
3. 「New repository secret」ボタンをクリック
4. 次の内容でシークレットを作成:

## `SUPABASE_ANON_KEY`

Value: `.env`ファイルにある`VITE_SUPABASE_ANON_KEY`の値を設定してください。

**注意**: シークレットキーは直接ドキュメントに記載せず、適切に管理してください。

## 注意点

シークレットを設定した後、GitHub Actions ワークフローを再度実行してください。
