import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KeywordSelector from '../../../components/recipe/KeywordSelector';

describe('KeywordSelector', () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders suggested keywords', () => {
    render(<KeywordSelector onSearch={mockOnSearch} />);
    expect(screen.getByText('時短')).toBeInTheDocument();
    expect(screen.getByText('簡単')).toBeInTheDocument();
    expect(screen.getByText('ズボラ飯')).toBeInTheDocument();
  });

  it('handles keyword selection', async () => {
    render(<KeywordSelector onSearch={mockOnSearch} />);
    
    const keyword = screen.getByText('時短');
    await userEvent.click(keyword);
    
    const input = screen.getByPlaceholderText(/キーワードを入力/);
    expect(input).toHaveValue('時短');
  });

  it('handles custom keyword input', async () => {
    render(<KeywordSelector onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/キーワードを入力/);
    await userEvent.type(input, 'カレー');
    
    const searchButton = screen.getByText('検索');
    await userEvent.click(searchButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith('カレー');
  });

  it('handles Enter key press', async () => {
    render(<KeywordSelector onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/キーワードを入力/);
    await userEvent.type(input, 'パスタ{enter}');
    
    expect(mockOnSearch).toHaveBeenCalledWith('パスタ');
  });

  it('disables search button when input is empty', () => {
    render(<KeywordSelector onSearch={mockOnSearch} />);
    
    const searchButton = screen.getByText('検索');
    expect(searchButton).toBeDisabled();
  });

  it('trims whitespace from input', async () => {
    render(<KeywordSelector onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/キーワードを入力/);
    await userEvent.type(input, '  カレー  ');
    
    const searchButton = screen.getByText('検索');
    await userEvent.click(searchButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith('カレー');
  });
});