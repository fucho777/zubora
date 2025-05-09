import React from 'react';
import { BookOpen, Clock, ChefHat, FolderHeart, Tag } from 'lucide-react';
import { RecipeData } from '../../store/recipeStore';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader } from '../ui/Card';

interface RecipeDetailsProps {
  recipe: RecipeData;
  onSaveRecipe: () => void;
  isSaving: boolean;
  isAlreadySaved: boolean;
  remainingRecipes: number;
}

const RecipeDetails: React.FC<RecipeDetailsProps> = ({
  recipe,
  onSaveRecipe,
  isSaving,
  isAlreadySaved,
  remainingRecipes,
}) => {
  return (
    <div className="space-y-6">
      <div className="aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${recipe.videoId}`}
          title={recipe.videoTitle}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{recipe.videoTitle}</h1>
        
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-orange-500" />
            <span>調理時間: 約15分</span>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <ChefHat className="h-4 w-4 text-orange-500" />
            <span>難易度: 簡単</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Tag className="h-4 w-4 text-orange-500" />
            <div className="flex flex-wrap gap-1">
              {recipe.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            残り保存可能レシピ: {remainingRecipes}/5
          </p>
          <Button
            onClick={onSaveRecipe}
            disabled={isAlreadySaved || remainingRecipes === 0}
            isLoading={isSaving}
            className="flex items-center space-x-1"
          >
            <FolderHeart className="h-5 w-5" />
            <span>
              {isAlreadySaved ? 'レシピ保存済み' : 'レシピを保存する'}
            </span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="outline">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-800">材料</h2>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mt-2 mr-2"></span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card variant="outline">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ChefHat className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-800">調理手順</h2>
            </div>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center mr-2">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecipeDetails;