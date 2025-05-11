# Gitの履歴から機密情報を削除するための手順

以下の手順で、すでに公開されてしまった`.env`ファイルを含む秘密情報をGitの履歴から完全に削除することができます。

**注意**: この操作はGitの履歴を書き換えるため、チーム開発の場合は全員に連絡し、作業を調整する必要があります。

## 必要なツール

- git-filter-repo: Gitの履歴を安全に改変するためのツール
  ```bash
  # Macの場合
  brew install git-filter-repo
  
  # Linuxの場合(Ubuntu/Debian)
  apt-get install git-filter-repo
  
  # pipを使う場合
  pip install git-filter-repo
  ```

## 手順

1. ローカルの変更をコミットまたはスタッシュします
   ```bash
   git add .
   git commit -m "現在の変更をコミット"
   # または
   git stash
   ```

2. `.env`ファイルの代わりに空のファイルを作成
   ```bash
   cp .env.example .env.safe
   ```

3. git-filter-repoを使用して、`.env`ファイルの履歴から秘密情報を削除
   ```bash
   git filter-repo --path .env --replace-text <(echo ".env=>.env.safe")
   ```

4. リモートリポジトリに強制プッシュ
   **注意**: これはリモートリポジトリの履歴を上書きします！
   ```bash
   git push origin main --force
   ```

5. 全てのコラボレーターに通知
   全てのコラボレーターは以下の手順を実行する必要があります：
   ```bash
   git fetch origin
   git reset --hard origin/main
   git clean -fd
   ```

6. `.env.safe`を削除し、`.env.example`から新しい`.env`を作成
   ```bash
   rm .env.safe
   cp .env.example .env
   # .envファイルを編集して実際の値を設定
   ```

## その他の対策

- APIキーを更新する: 公開されたAPIキーは再生成することをお勧めします
- GitHub Secretsを使用する: GitHub Actionsで使用するシークレットはリポジトリのSecretsとして設定
- 定期的なセキュリティレビュー: コード内にハードコードされた秘密情報がないか定期的に確認
