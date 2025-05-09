import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import SearchResultsPage from '../../pages/SearchResultsPage';
import { useRecipeStore } from '../../store/recipeStore';

// Mock components
vi.mock('../../components/recipe/KeywordSelector', () => ({
  default: ({ onSearch }: { onSearch: (keyword: string) => void }) => (
    <div data-testid="keyword-selector">
      <input
        data-testid="search-input"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  ),
}));

vi.mock('../../components/ui/VideoCard', () => ({
  default: ({ video }: any) => (
    <div data-testid="video-card">
      {video.title}
    </div>
  ),
}));

describe('SearchResultsPage', () => {
  const mockSearchResults = [
    {
      id: '1',
      title: 'Test Recipe 1',
      description: 'Test Description 1',
      thumbnailUrl: 'https://example.com/1.jpg',
      videoUrl: 'https://youtube.com/watch?v=1',
      channelTitle: 'Test Channel',
    },
    {
      id: '2',
      title: 'Test Recipe 2',
      description: 'Test Description 2',
      thumbnailUrl: 'https://example.com/2.jpg',
      videoUrl: 'https://youtube.com/watch?v=2',
      channelTitle: 'Test Channel',
    },
  ];

  beforeEach(() => {
    useRecipeStore.setState({
      searchResults: [],
      isLoading: false,
      searchError: null,
      searchVideos: vi.fn().mockResolvedValue({ success: true }),
    });
  });

  const renderSearchResults = () => {
    return render(
      <BrowserRouter>
        <SearchResultsPage />
      </BrowserRouter>
    );
  };

  it('renders search interface', () => {
    renderSearchResults();
    expect(screen.getByTestId('keyword-selector')).toBeInTheDocument();
  });

  it('displays loading state', async () => {
    useRecipeStore.setState({ isLoading: true });
    renderSearchResults();
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays search results', async () => {
    useRecipeStore.setState({ searchResults: mockSearchResults });
    renderSearchResults();
    
    await waitFor(() => {
      expect(screen.getByText('検索結果')).toBeInTheDocument();
      expect(screen.getAllByTestId('video-card')).toHaveLength(2);
    });
  });

  it('displays error message', async () => {
    useRecipeStore.setState({ searchError: '検索中にエラーが発生しました。' });
    renderSearchResults();
    
    expect(screen.getByText('検索中にエラーが発生しました。')).toBeInTheDocument();
  });

  it('displays no results message', async () => {
    // Set URL with search query but no results
    window.history.pushState({}, '', '/search?q=test');
    renderSearchResults();
    
    expect(screen.getByText('検索結果が見つかりませんでした。')).toBeInTheDocument();
  });

  it('handles new search', async () => {
    const searchVideos = vi.fn().mockResolvedValue({ success: true });
    useRecipeStore.setState({ searchVideos });
    
    renderSearchResults();
    
    const searchInput = screen.getByTestId('search-input');
    await userEvent.type(searchInput, 'pasta');
    
    expect(searchVideos).toHaveBeenCalledWith('pasta');
  });
});