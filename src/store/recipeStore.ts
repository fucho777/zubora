import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import { videoCache } from '../lib/cache';
import { batchVideoIds } from '../lib/utils';

// YouTube API関連の型定義
interface YouTubeSearchResult {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    channelTitle: string;
  };
}

export interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  channelTitle: string;
}

export interface RecipeData {
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  thumbnailUrl: string;
  ingredients: string[];
  steps: string[];
  tags: string[];
}

interface RecipeState {
  savedRecipes: RecipeData[];
  searchResults: VideoData[];
  popularVideos: VideoData[];
  currentRecipe: RecipeData | null;
  isLoading: boolean;
  searchError: string | null;
  
  fetchSavedRecipes: () => Promise<void>;
  fetchPopularVideos: () => Promise<void>;
  saveRecipe: (recipe: RecipeData) => Promise<{ success: boolean; error?: string }>;
  deleteRecipe: (videoId: string) => Promise<boolean>;
  searchVideos: (keyword: string) => Promise<{ success: boolean; error?: string }>;
  extractRecipe: (videoUrl: string) => Promise<{ success: boolean; recipe?: RecipeData; error?: string }>;
  setCurrentRecipe: (recipe: RecipeData | null) => void;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  savedRecipes: [],
  searchResults: [],
  popularVideos: [],
  currentRecipe: null,
  isLoading: false,
  searchError: null,
  
  fetchSavedRecipes: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    set({ isLoading: true });
    
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', user.id);
    
    if (!error && data) {
      const recipes: RecipeData[] = data.map(item => ({
        videoId: item.video_id,
        videoTitle: item.video_title,
        videoUrl: item.video_url,
        thumbnailUrl: item.thumbnail_url,
        ingredients: item.ingredients as string[],
        steps: item.steps as string[],
        tags: item.tags as string[] || [],
      }));
      
      set({ savedRecipes: recipes });
    }
    
    set({ isLoading: false });
  },
  
  fetchPopularVideos: async () => {
    set({ isLoading: true });
    
    try {
      // YouTube APIキーを環境変数から取得
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey) {
        throw new Error('YouTube API Keyが設定されていません');
      }
      
      // 1. データベースから人気の動画IDを取得
      const { data, error } = await supabase
        .from('popular_videos')
        .select('*')
        .order('save_count', { ascending: false })
        .limit(10);
      
      if (error) {
        throw new Error('人気動画の取得に失敗しました');
      }
      
      if (!data || data.length === 0) {
        // 人気動画がない場合は、デフォルトで料理カテゴリの人気動画を取得
        const response = await fetch(
          `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=26&regionCode=jp&maxResults=10&key=${apiKey}`
        );
        
        if (!response.ok) {
          throw new Error(`YouTube API Error: ${response.status}`);
        }
        
        const youtubeData = await response.json();
        
        const popularVideos: VideoData[] = youtubeData.items.map((item: any) => ({
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          videoUrl: `https://www.youtube.com/watch?v=${item.id}`,
          channelTitle: item.snippet.channelTitle,
        }));
        
        set({ popularVideos, isLoading: false });
        return;
      }
      
      // 2. 人気動画のIDを抽出
      const videoIds = data.map(item => item.video_id);
      const cachedVideos: VideoData[] = [];
      const uncachedIds: string[] = [];
      
      // キャッシュをチェック
      videoIds.forEach(id => {
        const cachedVideo = videoCache.get(id);
        if (cachedVideo) {
          cachedVideos.push(cachedVideo);
        } else {
          uncachedIds.push(id);
        }
      });
      
      let fetchedVideos: VideoData[] = [];
      
      // キャッシュにないビデオのみを取得
      if (uncachedIds.length > 0) {
        const batches = batchVideoIds(uncachedIds);
        
        for (const batch of batches) {
          const response = await fetch(
            `https://youtube.googleapis.com/youtube/v3/videos?` +
            `part=snippet&id=${batch.join(',')}&` +
            `fields=items(id,snippet(title,description,thumbnails/high,channelTitle))&` +
            `key=${apiKey}`
          );
          
          if (!response.ok) continue;
          
          const data = await response.json();
          const videos = data.items.map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails.high?.url,
            videoUrl: `https://www.youtube.com/watch?v=${item.id}`,
            channelTitle: item.snippet.channelTitle,
          }));
          
          // 新しく取得したビデオをキャッシュに追加
          videos.forEach(video => videoCache.set(video.id, video));
          fetchedVideos.push(...videos);
        }
      }
      
      // キャッシュされたビデオと新しく取得したビデオを結合
      const allVideos = [...cachedVideos, ...fetchedVideos];
      
      // 元のビデオIDの順序を維持
      const orderedVideos = videoIds
        .map(id => allVideos.find(video => video.id === id))
        .filter((video): video is VideoData => video !== undefined);

      set({ popularVideos: orderedVideos });
    } catch (error) {
      console.error('Popular videos error:', error);
      // エラー時は空の配列をセット
      set({ popularVideos: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  
  saveRecipe: async (recipe) => {
    const user = useAuthStore.getState().user;
    if (!user) return { success: false, error: 'User not authenticated' };
    
    // Check if the user has already saved 5 recipes
    if (get().savedRecipes.length >= 5) {
      return { success: false, error: '保存可能なレシピは最大5つまでです。' };
    }
    
    // Check if the recipe is already saved
    const isAlreadySaved = get().savedRecipes.some(r => r.videoId === recipe.videoId);
    if (isAlreadySaved) {
      return { success: false, error: 'このレシピは既に保存されています。' };
    }
    
    set({ isLoading: true });
    
    // Save the recipe
    const { error } = await supabase
      .from('saved_recipes')
      .insert({
        user_id: user.id,
        video_id: recipe.videoId,
        video_url: recipe.videoUrl,
        video_title: recipe.videoTitle,
        thumbnail_url: recipe.thumbnailUrl,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        tags: recipe.tags,
      });
    
    if (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
    
    // Update the popular videos count
    const { error: rpcError } = await supabase.rpc('increment_video_save_count', {
      vid_id: recipe.videoId,
    });
    
    // RPCがエラーの場合はフォールバック処理を実行
    if (rpcError) {
      await supabase
        .from('popular_videos')
        .upsert({
          video_id: recipe.videoId,
          save_count: 1,
          last_updated: new Date().toISOString(),
        }, {
          onConflict: 'video_id',
          ignoreDuplicates: false,
        });
    }
    
    // Refresh the saved recipes
    await get().fetchSavedRecipes();
    
    set({ isLoading: false });
    return { success: true };
  },
  
  deleteRecipe: async (videoId) => {
    const user = useAuthStore.getState().user;
    if (!user) return false;
    
    set({ isLoading: true });
    
    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('user_id', user.id)
      .eq('video_id', videoId);
    
    if (error) {
      set({ isLoading: false });
      return false;
    }
    
    // Refresh the saved recipes
    await get().fetchSavedRecipes();
    
    set({ isLoading: false });
    return true;
  },
  
  searchVideos: async (keyword) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      return { success: false, error: 'ログインが必要です。' };
    }

    // 検索回数の制限をチェック
    const today = new Date().toISOString().split('T')[0];
    if (user.lastSearchDate === today && user.dailySearchCount >= 5) {
      return { success: false, error: '1日の検索回数上限（5回）に達しました。明日また試してください。' };
    }
    
    set({ isLoading: true, searchError: null });
    
    try {
      // 検索回数をインクリメント
      const canSearch = await useAuthStore.getState().incrementSearchCount();
      if (!canSearch) {
        throw new Error('1日の検索回数上限（5回）に達しました。明日また試してください。');
      }

      // YouTube APIキーを環境変数から取得
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey) {
        throw new Error('YouTube API Keyが設定されていません');
      }
      
      // キャッシュをチェック
      const cachedResults = videoCache.getSearchResults(keyword);
      if (cachedResults) {
        set({ searchResults: cachedResults, isLoading: false });
        return { success: true };
      }
      
      // YouTube Data APIを呼び出し
      const searchQuery = `${keyword} レシピ 料理`;
      const response = await fetch(
        `https://youtube.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `maxResults=10&` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `type=video&` +
        `videoCategoryId=26&` +
        `relevanceLanguage=ja&` +
        `regionCode=jp&` +
        `fields=items(id/videoId,snippet(title,description,thumbnails/high,channelTitle))&` +
        `key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`YouTube API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 検索結果を変換
      const videos: VideoData[] = data.items.map((item: YouTubeSearchResult) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        channelTitle: item.snippet.channelTitle,
      }));
      
      // 検索結果を保存
      set({ searchResults: videos });
      videoCache.setSearchResults(keyword, videos);
      
      // 検索キーワードの使用回数を更新
      const { error: rpcError } = await supabase.rpc('increment_keyword_search_count', {
        kw: keyword,
      });
      
      // RPCがエラーの場合はフォールバック処理を実行
      if (rpcError) {
        await supabase
          .from('search_keywords')
          .upsert({
            keyword,
            search_count: 1,
            last_updated: new Date().toISOString(),
          }, {
            onConflict: 'keyword',
            ignoreDuplicates: false,
          });
      }
      
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      console.error('Search error:', error);
      set({
        isLoading: false,
        searchResults: [], // エラー時は検索結果をクリア
        searchError: error instanceof Error ? error.message : '検索中にエラーが発生しました。もう一度お試しください。',
      });
      return { 
        success: false, 
        error: error instanceof Error 
          ? error.message 
          : '検索中にエラーが発生しました。もう一度お試しください。' 
      };
    }
  },
  
  extractRecipe: async (videoUrl) => {
    set({ isLoading: true });
    
    // キャッシュをチェック
    const videoId = videoUrl.includes('v=')
      ? videoUrl.split('v=')[1].split('&')[0]
      : videoUrl.split('/').pop();
    
    if (!videoId) {
      set({ isLoading: false });
      return { success: false, error: '動画URLから動画IDを抽出できませんでした。' };
    }
    
    // キャッシュから動画情報を取得
    const cachedVideo = videoCache.get(videoId);
    if (cachedVideo) {
      const recipe: RecipeData = {
        videoId,
        videoTitle: cachedVideo.title,
        videoUrl,
        thumbnailUrl: cachedVideo.thumbnailUrl,
        ingredients: [],  // AIで再生成
        steps: [],       // AIで再生成
        tags: [],        // AIで再生成
      };
      
      // Gemini APIを使用してレシピを抽出
      const { success, recipeData, error } = await extractRecipeFromData(
        recipe.videoTitle,
        cachedVideo.description,
        cachedVideo.channelTitle
      );
      
      if (!success || error) {
        set({ isLoading: false });
        return { success: false, error };
      }
      
      recipe.ingredients = recipeData.ingredients;
      recipe.steps = recipeData.steps;
      recipe.tags = recipeData.tags;
      
      set({
        currentRecipe: recipe,
        isLoading: false,
      });
      
      return { success: true, recipe };
    }
    
    try {
      // YouTube APIキーを環境変数から取得
      const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!youtubeApiKey) {
        throw new Error('YouTube API Keyが設定されていません');
      }
      
      // 1. 動画の詳細情報を取得
      const videoDetailsResponse = await fetch(
        `https://youtube.googleapis.com/youtube/v3/videos?` +
        `part=snippet&` +
        `id=${videoId}&` +
        `fields=items(id,snippet(title,description,thumbnails/high,channelTitle))&` +
        `key=${youtubeApiKey}`
      );
      
      if (!videoDetailsResponse.ok) {
        throw new Error(`YouTube API Error: ${videoDetailsResponse.status}`);
      }
      
      const videoData = await videoDetailsResponse.json();
      
      if (!videoData.items || videoData.items.length === 0) {
        throw new Error('動画情報が見つかりませんでした。');
      }
      
      const videoItem = videoData.items[0];
      const videoTitle = videoItem.snippet.title;
      const videoDescription = videoItem.snippet.description;
      const thumbnailUrl = videoItem.snippet.thumbnails.high?.url || videoItem.snippet.thumbnails.default?.url;
      const channelTitle = videoItem.snippet.channelTitle;
      
      // 2. 動画のコメントを取得（任意）
      let comments = '';
      try {
        const commentsResponse = await fetch(
          `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=10&key=${youtubeApiKey}`
        );
        
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          if (commentsData.items && commentsData.items.length > 0) {
            comments = commentsData.items
              .map((item: any) => item.snippet.topLevelComment.snippet.textDisplay)
              .join('\n\n');
          }
        }
      } catch (error) {
        console.warn('コメント取得中にエラーが発生しました:', error);
        // コメント取得に失敗してもレシピ抽出は続行
      }
      
      // 動画情報をキャッシュに保存
      const videoInfo: VideoData = {
        id: videoId,
        title: videoTitle,
        description: videoDescription,
        thumbnailUrl,
        videoUrl,
        channelTitle,
      };
      videoCache.set(videoId, videoInfo);
      
      // Gemini APIを使用してレシピを抽出
      const { success, recipeData, error } = await extractRecipeFromData(
        videoTitle,
        videoDescription,
        channelTitle,
        comments
      );
      
      if (!success || error) {
        set({ isLoading: false });
        return { success: false, error };
      }
      
      // レシピ情報を整形して返却
      const recipe: RecipeData = {
        videoId,
        videoTitle,
        videoUrl,
        thumbnailUrl,
        ingredients: recipeData.ingredients || [],
        steps: recipeData.steps || [],
        tags: recipeData.tags || [],
      };
      
      set({
        currentRecipe: recipe,
        isLoading: false,
      });
      
      return { success: true, recipe };
    } catch (error) {
      console.error('Recipe extraction error:', error);
      set({ isLoading: false });
      return { 
        success: false, 
        error: error instanceof Error 
          ? error.message 
          : 'レシピの抽出中にエラーが発生しました。もう一度お試しください。' 
      };
    }
  },
  
  setCurrentRecipe: (recipe) => {
    set({ currentRecipe: recipe });
  },
}));

// レシピ抽出のヘルパー関数
async function extractRecipeFromData(
  title: string,
  description: string,
  channelTitle: string,
  comments: string = ''
): Promise<{
  success: boolean;
  recipeData?: {
    ingredients: string[];
    steps: string[];
    tags: string[];
  };
  error?: string;
}> {
  try {
    // Gemini APIキーを環境変数から取得
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('Gemini API Keyが設定されていません');
    }
    
    // Geminiモデルを環境変数から取得
    const geminiModel = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.0-pro';
    
    // Gemini AIにレシピの抽出を依頼
    const prompt = `
あなたは料理動画からレシピを抽出する専門家です。以下の料理動画情報から、材料リスト、調理手順、タグを抽出してください。
料理の情報が不足している場合は、一般的な調理方法や材料を推測して補完してください。

【動画タイトル】
${title}

【動画説明】
${description}

【チャンネル名】
${channelTitle}

${comments ? `【コメント】\n${comments}` : ''}

以下の形式でJSON形式で回答してください：
{
  "ingredients": ["材料1 数量", "材料2 数量", ...],
  "steps": ["手順1", "手順2", ...],
  "tags": ["タグ1", "タグ2", ...]
}
`;
    
    // Gemini APIを呼び出し
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiApiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );
    
    if (!geminiResponse.ok) {
      throw new Error(`Gemini API Error: ${geminiResponse.status}`);
    }
    
    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates[0]?.content?.parts[0]?.text;
    
    if (!responseText) {
      throw new Error('AIからの応答を取得できませんでした。');
    }
    
    // JSON部分を抽出
    const jsonMatch = responseText.match(/```(?:json)?([\s\S]*?)```/) || 
                       responseText.match(/{[\s\S]*}/);
    
    if (!jsonMatch) {
      throw new Error('レシピデータの形式が不正です。');
    }
    
    // バッククォートが存在する場合は取り除く
    const jsonStr = jsonMatch[0].replace(/```json|```/g, '').trim();
    const recipeData = JSON.parse(jsonStr);
    
    return { success: true, recipeData };
  } catch (error) {
    console.error('Recipe extraction error:', error);
    return { 
      success: false, 
      error: error instanceof Error 
        ? error.message 
        : 'レシピの抽出中にエラーが発生しました。もう一度お試しください。' 
    };
  }
}