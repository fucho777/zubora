#!/bin/bash

# 検索回数リセット機能のテストスクリプト
# このスクリプトは、REST APIを使用して検索回数をリセットします

# .envファイルから環境変数を読み込む
if [ -f ../.env ]; then
  source ../.env
  ANON_KEY=$VITE_SUPABASE_ANON_KEY
else
  echo "エラー: .envファイルが見つかりません。スクリプトを実行する前に.envファイルを作成してください。"
  echo "例: VITE_SUPABASE_ANON_KEY=your_anon_key_here"
  exit 1
fi

# キーが設定されているか確認
if [ -z "$ANON_KEY" ]; then
  echo "エラー: VITE_SUPABASE_ANON_KEYが.envファイルに設定されていません"
  exit 1
fi

echo "Attempting to reset daily search count via REST API..."

# Supabase REST API を直接呼び出す
response=$(curl -s -X POST "https://pmjdyztlqovnqjwavbpb.supabase.co/rest/v1/rpc/reset_daily_search_count" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json")

echo "Response: $response"

# レスポンスにエラーがないか確認
if [[ "$response" =~ ^[0-9]+$ ]] || ! echo "$response" | grep -q "error"; then
  echo "✅ Successfully reset daily search count. Count: $response"
  exit 0
else
  echo "❌ Failed to reset daily search count: $response"
  exit 1
fi
