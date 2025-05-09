import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecipeStore } from '../store/recipeStore';
import RecipeDetails from '../components/recipe/RecipeDetails';
import { getRemainingRecipes } from '../lib/utils';

const VideoDetailPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const {
    currentRecipe,
    savedRecipes,
    extractRecipe,
    saveRecipe,
    fetchSavedRecipes,
  } = useRecipeStore();
  
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
    fetchSavedRecipes();
  }, [videoId, extractRecipe, fetchSavedRecipes]);
  
  const handleSaveRecipe = async () => {
    if (!currentRecipe) return;
    
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
  
  const isAlreadySaved = savedRecipes.some(
    (recipe) => recipe.videoId === currentRecipe.videoId
  );
  
  const remainingRecipes = getRemainingRecipes(savedRecipes.length);
  
  return (
    <div className="space-y-6">
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