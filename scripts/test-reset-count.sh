#!/bin/bash

# 検索回数リセット機能のテストスクリプト
# このスクリプトは、REST APIを使用して検索回数をリセットします

# ANON KEYを環境変数から読み取る
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtamR5enRscW92bnFqd2F2YnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MTg2MDUsImV4cCI6MjA2MjE5NDYwNX0.gAXbydA6xLBHUepiXER_97BGRHk6sT56Q-qOzCMmMp8"

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
