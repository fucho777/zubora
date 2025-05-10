import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRecipeStore } from '../store/recipeStore';
import RecipeDetails from '../components/recipe/RecipeDetails';
import { getRemainingRecipes } from '../lib/utils';
import { useAuth } from '../providers/AuthProvider';

const VideoDetailPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const {
    currentRecipe,
    savedRecipes,
    extractRecipe,
    saveRecipe,
    fetchSavedRecipes,
  } = useRecipeStore();
  const { isAuthenticated } = useAuth();
  
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const loadRecipe = async () => {
      if (!videoId) return;
      
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const { success, recipe, error } = await extractRecipe(videoUrl);
      
      if (!success || error) {
        setError(error || 'レシピの読み込み中にエラーが発生しました。');
      }
    };
    
    loadRecipe();
    // 認証済みユーザーの場合のみ保存済みレシピを取得
    if (isAuthenticated) {
      fetchSavedRecipes();
    }
  }, [videoId, extractRecipe, fetchSavedRecipes, isAuthenticated]);
  
  const handleSaveRecipe = async () => {
    if (!currentRecipe) return;
    if (!isAuthenticated) {
      // ログインページにリダイレクト
      window.location.href = `/login?redirect=${encodeURIComponent(`/video/${videoId}`)}`;
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    const { success, error } = await saveRecipe(currentRecipe);
    
    if (!success) {
      setError(error || 'レシピの保存中にエラーが発生しました。');
    }
    
    setIsSaving(false);
  };
  
  if (!currentRecipe) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  // 未ログインユーザーの場合のデフォルト値を設定
  let isAlreadySaved = false;
  let remainingRecipes = 0;
  
  if (isAuthenticated) {
    isAlreadySaved = savedRecipes.some(
      (recipe) => recipe.videoId === currentRecipe.videoId
    );
    remainingRecipes = getRemainingRecipes(savedRecipes.length);
  }
  
  return (
    <div className="space-y-6">
      {!isAuthenticated && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <div>
            <p className="font-medium">ログインするとレシピを保存できます</p>
            <p className="text-sm">アカウントを作成して、お気に入りのレシピを保存しましょう</p>
          </div>
          <div>
            <a 
              href={`/login?redirect=${encodeURIComponent(`/video/${videoId}`)}`} 
              className="inline-block bg-orange-500 text-white px-4 py-2 rounded font-medium hover:bg-orange-600 transition-colors"
            >
              ログイン / 登録
            </a>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <RecipeDetails
        recipe={currentRecipe}
        onSaveRecipe={handleSaveRecipe}
        isSaving={isSaving}
        isAlreadySaved={isAlreadySaved}
        remainingRecipes={remainingRecipes}
      />
    </div>
  );
};

export default VideoDetailPage;