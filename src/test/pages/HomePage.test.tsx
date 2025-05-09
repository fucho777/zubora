import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import HomePage from '../../pages/HomePage';

// Mock components
vi.mock('../../components/recipe/KeywordSelector', () => ({
  default: ({ onSearch }: { onSearch: (keyword: string) => void }) => (
    <div data-testid="keyword-selector">
      <button onClick={() => onSearch('test')}>Search</button>
    </div>
  ),
}));

vi.mock('../../components/recipe/PopularVideosList', () => ({
  default: () => <div data-testid="popular-videos">Popular Videos</div>,
}));

describe('HomePage', () => {
  const renderHomePage = () => {
    return render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
  };

  it('renders main sections', () => {
    renderHomePage();
    
    expect(screen.getByText('今日は何を作る？')).toBeInTheDocument();
    expect(screen.getByTestId('keyword-selector')).toBeInTheDocument();
    expect(screen.getByTestId('popular-videos')).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    renderHomePage();
    
    expect(screen.getByText('時短レシピ')).toBeInTheDocument();
    expect(screen.getByText('初心者向け')).toBeInTheDocument();
    expect(screen.getByText('節約レシピ')).toBeInTheDocument();
  });

  it('handles search navigation', async () => {
    renderHomePage();
    
    const searchButton = screen.getByText('Search');
    await userEvent.click(searchButton);
    
    // Check if navigation occurred
    expect(window.location.pathname).toBe('/search');
    expect(window.location.search).toBe('?q=test');
  });

  it('handles feature card clicks', async () => {
    renderHomePage();
    
    const timeShortCard = screen.getByText('時短レシピ').closest('button');
    await userEvent.click(timeShortCard!);
    
    const encodedQuery = encodeURIComponent('時短');
    expect(window.location.search).toBe(`?q=${encodedQuery}`);
  });
});