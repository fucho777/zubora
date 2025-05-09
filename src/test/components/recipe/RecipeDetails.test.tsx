import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecipeDetails from '../../../components/recipe/RecipeDetails';

describe('RecipeDetails', () => {
  const mockRecipe = {
    videoId: 'test-123',
    videoTitle: 'Test Recipe',
    videoUrl: 'https://youtube.com/watch?v=test-123',
    thumbnailUrl: 'https://img.youtube.com/test-123',
    ingredients: ['ingredient 1', 'ingredient 2'],
    steps: ['step 1', 'step 2'],
    tags: ['簡単', '時短'],
  };

  const defaultProps = {
    recipe: mockRecipe,
    onSaveRecipe: vi.fn(),
    isSaving: false,
    isAlreadySaved: false,
    remainingRecipes: 3,
  };

  it('renders recipe details correctly', () => {
    render(<RecipeDetails {...defaultProps} />);
    
    expect(screen.getByText(mockRecipe.videoTitle)).toBeInTheDocument();
    expect(screen.getByText('ingredient 1')).toBeInTheDocument();
    expect(screen.getByText('step 1')).toBeInTheDocument();
    expect(screen.getByText('簡単')).toBeInTheDocument();
  });

  it('shows save button when recipe is not saved', () => {
    render(<RecipeDetails {...defaultProps} />);
    
    const saveButton = screen.getByText('レシピを保存する');
    expect(saveButton).toBeEnabled();
  });

  it('shows saved state when recipe is already saved', () => {
    render(<RecipeDetails {...defaultProps} isAlreadySaved={true} />);
    
    const saveButton = screen.getByText('レシピ保存済み');
    expect(saveButton).toBeDisabled();
  });

  it('disables save button when no remaining recipes', () => {
    render(<RecipeDetails {...defaultProps} remainingRecipes={0} />);
    
    const saveButton = screen.getByText('レシピを保存する');
    expect(saveButton).toBeDisabled();
  });

  it('shows loading state while saving', () => {
    render(<RecipeDetails {...defaultProps} isSaving={true} />);
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('displays remaining recipes count', () => {
    render(<RecipeDetails {...defaultProps} />);
    
    expect(screen.getByText('残り保存可能レシピ: 3/5')).toBeInTheDocument();
  });

  it('handles save recipe click', async () => {
    render(<RecipeDetails {...defaultProps} />);
    
    const saveButton = screen.getByText('レシピを保存する');
    await userEvent.click(saveButton);
    
    expect(defaultProps.onSaveRecipe).toHaveBeenCalled();
  });
});