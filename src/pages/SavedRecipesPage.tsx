import React, { useEffect, useState } from 'react';
import { FolderHeart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecipeStore } from '../store/recipeStore';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

const SavedRecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const { savedRecipes, fetchSavedRecipes, deleteRecipe, isLoading } = useRecipeStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchSavedRecipes();
  }, [fetchSavedRecipes]);
  
  const handleDeleteRecipe = async (videoId: string) => {
    setDeletingId(videoId);
    setError(null);
    
    const success = await deleteRecipe(videoId);
    
    if (!success) {
      setError('レシピの削除中にエラーが発生しました。');
    }
    
    setDeletingId(null);
  };
  
  const handleCardClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <FolderHeart className="h-6 w-6 text-orange-500" />
        <h1 className="text-2xl font-bold text-gray-800">保存したレシピ</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {savedRecipes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FolderHeart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">保存したレシピはありません。</p>
          <p className="text-gray-500">気に入ったレシピを保存してみましょう！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedRecipes.map((recipe) => (
            <Card
              key={recipe.videoId}
              variant="outline"
              className="cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
              onClick={() => handleCardClick(recipe.videoId)}
            >
              <div className="aspect-video">
                <img
                  src={recipe.thumbnailUrl}
                  alt={recipe.videoTitle}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent>
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  {recipe.videoTitle}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">材料</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <li className="text-gray-400">...</li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRecipe(recipe.videoId);
                      }}
                      isLoading={deletingId === recipe.videoId}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="text-center text-sm text-gray-500">
        保存可能なレシピ: {savedRecipes.length}/5
      </div>
    </div>
  );
};

export default SavedRecipesPage;