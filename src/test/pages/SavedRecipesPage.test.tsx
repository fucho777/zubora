import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import SavedRecipesPage from '../../pages/SavedRecipesPage';
import { useRecipeStore } from '../../store/recipeStore';

// Mock components
vi.mock('../../components/ui/Card', () => ({
  default: ({ children, onClick }: any) => (
    <div data-testid="recipe-card" onClick={onClick}>
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

describe('SavedRecipesPage', () => {
  const mockRecipes = [
    {
      videoId: 'test-1',
      videoTitle: 'Test Recipe 1',
      videoUrl: 'https://youtube.com/watch?v=test-1',
      thumbnailUrl: 'https://img.youtube.com/test-1',
      ingredients: ['ingredient 1', 'ingredient 2'],
      steps: ['step 1', 'step 2'],
      tags: ['簡単', '時短'],
    },
    {
      videoId: 'test-2',
      videoTitle: 'Test Recipe 2',
      videoUrl: 'https://youtube.com/watch?v=test-2',
      thumbnailUrl: 'https://img.youtube.com/test-2',
      ingredients: ['ingredient 3', 'ingredient 4'],
      steps: ['step 3', 'step 4'],
      tags: ['節約', '一人暮らし'],
    },
  ];

  beforeEach(() => {
    useRecipeStore.setState({
      savedRecipes: [],
      isLoading: false,
      fetchSavedRecipes: vi.fn(),
      deleteRecipe: vi.fn().mockResolvedValue(true),
    });
  });

  const renderSavedRecipes = () => {
    return render(
      <BrowserRouter>
        <SavedRecipesPage />
      </BrowserRouter>
    );
  };

  it('displays loading state initially', () => {
    useRecipeStore.setState({ isLoading: true });
    renderSavedRecipes();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays empty state when no recipes are saved', () => {
    renderSavedRecipes();
    expect(screen.getByText('保存したレシピはありません。')).toBeInTheDocument();
  });

  it('displays saved recipes', () => {
    useRecipeStore.setState({ savedRecipes: mockRecipes });
    renderSavedRecipes();
    
    expect(screen.getByText('Test Recipe 1')).toBeInTheDocument();
    expect(screen.getByText('Test Recipe 2')).toBeInTheDocument();
  });

  it('navigates to recipe details when clicking a recipe', async () => {
    useRecipeStore.setState({ savedRecipes: mockRecipes });
    renderSavedRecipes();
    
    const recipeCard = screen.getAllByTestId('recipe-card')[0];
    await userEvent.click(recipeCard);
    
    expect(window.location.pathname).toBe('/video/test-1');
  });

  it('handles recipe deletion', async () => {
    const deleteRecipe = vi.fn().mockResolvedValue(true);
    useRecipeStore.setState({ 
      savedRecipes: mockRecipes,
      deleteRecipe,
    });
    
    renderSavedRecipes();
    
    const deleteButton = screen.getAllByRole('button')[0];
    await userEvent.click(deleteButton);
    
    expect(deleteRecipe).toHaveBeenCalledWith('test-1');
  });

  it('displays error when deletion fails', async () => {
    const deleteRecipe = vi.fn().mockResolvedValue(false);
    useRecipeStore.setState({ 
      savedRecipes: mockRecipes,
      deleteRecipe,
    });
    
    renderSavedRecipes();
    
    const deleteButton = screen.getAllByRole('button')[0];
    await userEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.getByText('レシピの削除中にエラーが発生しました。')).toBeInTheDocument();
    });
  });

  it('shows recipe count', () => {
    useRecipeStore.setState({ savedRecipes: mockRecipes });
    renderSavedRecipes();
    
    expect(screen.getByText('保存可能なレシピ: 2/5')).toBeInTheDocument();
  });

  it('fetches saved recipes on mount', () => {
    const fetchSavedRecipes = vi.fn();
    useRecipeStore.setState({ fetchSavedRecipes });
    
    renderSavedRecipes();
    expect(fetchSavedRecipes).toHaveBeenCalled();
  });
});