# ズボラシェフAI

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/fucho777/zubora)

## セットアップ手順

1. リポジトリをクローン
```bash
git clone https://github.com/fucho777/zubora.git
cd zubora
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
```bash
cp .env.example .env
# .envファイルを編集して必要なAPIキーなどを設定
```

4. 開発サーバーを起動
```bash
npm run dev
```

## 環境変数

以下の環境変数を`.env`ファイルに設定する必要があります：

- `VITE_SUPABASE_URL`: SupabaseプロジェクトのURL
- `VITE_SUPABASE_ANON_KEY`: Supabase匿名認証キー
- `VITE_YOUTUBE_API_KEY`: YouTube Data APIキー
- `VITE_GEMINI_API_KEY`: Google Gemini APIキー
- `VITE_GEMINI_MODEL`: 使用するGeminiモデル名
- `GMAIL_USER`: メール送信用のGmailアドレス
- `GMAIL_APP_PASSWORD`: Gmailアプリパスワード

## セキュリティ上の注意点

- 環境変数（`.env`）ファイルはGitにコミットしないでください
- APIキーなどの秘密情報はコード内にハードコードしないでください
- GitHub Actionsを使用する場合は、GitHub Secretsに秘密情報を設定してください