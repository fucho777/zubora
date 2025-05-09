import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import VideoDetailPage from '../../pages/VideoDetailPage';
import { useRecipeStore } from '../../store/recipeStore';

// Mock components
vi.mock('../../components/recipe/RecipeDetails', () => ({
  default: ({ recipe, onSaveRecipe }: any) => (
    <div data-testid="recipe-details">
      <h1>{recipe.videoTitle}</h1>
      <button onClick={onSaveRecipe}>Save Recipe</button>
    </div>
  ),
}));

describe('VideoDetailPage', () => {
  const mockRecipe = {
    videoId: 'test-123',
    videoTitle: 'Test Recipe',
    videoUrl: 'https://youtube.com/watch?v=test-123',
    thumbnailUrl: 'https://img.youtube.com/test-123',
    ingredients: ['ingredient 1', 'ingredient 2'],
    steps: ['step 1', 'step 2'],
    tags: ['簡単', '時短'],
  };

  beforeEach(() => {
    useRecipeStore.setState({
      currentRecipe: null,
      savedRecipes: [],
      isLoading: false,
      extractRecipe: vi.fn().mockResolvedValue({ 
        success: true, 
        recipe: mockRecipe 
      }),
      saveRecipe: vi.fn().mockResolvedValue({ success: true }),
      fetchSavedRecipes: vi.fn(),
    });
  });

  const renderVideoDetail = (videoId = 'test-123') => {
    return render(
      <BrowserRouter>
        <Routes>
          <Route path="/video/:videoId" element={<VideoDetailPage />} />
        </Routes>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    window.history.pushState({}, '', '/video/test-123');
  });

  it('displays loading state initially', () => {
    renderVideoDetail();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('loads and displays recipe details', async () => {
    useRecipeStore.setState({ currentRecipe: mockRecipe });
    renderVideoDetail();
    
    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });
  });

  it('handles recipe saving', async () => {
    const saveRecipe = vi.fn().mockResolvedValue({ success: true });
    useRecipeStore.setState({ 
      currentRecipe: mockRecipe,
      saveRecipe,
    });
    
    renderVideoDetail();
    
    const saveButton = await screen.findByText('Save Recipe');
    await userEvent.click(saveButton);
    
    expect(saveRecipe).toHaveBeenCalledWith(mockRecipe);
  });

  it('displays error message when recipe saving fails', async () => {
    const saveRecipe = vi.fn().mockResolvedValue({ 
      success: false, 
      error: 'レシピの保存中にエラーが発生しました。' 
    });
    
    useRecipeStore.setState({ 
      currentRecipe: mockRecipe,
      saveRecipe,
    });
    
    renderVideoDetail();
    
    const saveButton = await screen.findByText('Save Recipe');
    await userEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('レシピの保存中にエラーが発生しました。')).toBeInTheDocument();
    });
  });

  it('handles recipe extraction failure', async () => {
    const extractRecipe = vi.fn().mockResolvedValue({ 
      success: false, 
      error: 'レシピの読み込み中にエラーが発生しました。' 
    });
    
    useRecipeStore.setState({ extractRecipe });
    renderVideoDetail();
    
    await waitFor(() => {
      expect(screen.getByText('レシピの読み込み中にエラーが発生しました。')).toBeInTheDocument();
    });
  });
});