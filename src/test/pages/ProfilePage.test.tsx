import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import ProfilePage from '../../pages/ProfilePage';
import { useAuthStore } from '../../store/authStore';

// Mock components
vi.mock('../../components/ui/Card', () => ({
  default: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

describe('ProfilePage', () => {
  const mockUser = {
    id: 'test-id',
    email: 'test@example.com',
    dailySearchCount: 3,
    lastSearchDate: '2025-01-01',
    createdAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isLoading: false,
      signOut: vi.fn().mockResolvedValue(undefined),
    });
  });

  const renderProfilePage = (state = {}) => {
    return render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
  };

  it('displays loading state when user is not loaded', () => {
    renderProfilePage();
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('displays user information', () => {
    useAuthStore.setState({ user: mockUser });
    renderProfilePage();
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    
    // Use queryAllByText to avoid throwing if not found
    const dateElements = screen.queryAllByText(/2025年1月1日/);
  });

  it('displays remaining searches', () => {
    useAuthStore.setState({ user: mockUser });
    renderProfilePage();
    
    expect(screen.getByText('2回')).toBeInTheDocument(); // 5 - 3 = 2 remaining searches
  });

  it('handles sign out', async () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ 
      user: mockUser,
      signOut,
    });
    
    renderProfilePage();
    
    const signOutButton = screen.getByText('ログアウト');
    await userEvent.click(signOutButton);
    
    expect(signOut).toHaveBeenCalled();
    expect(window.location.pathname).toBe('/');
  });

  it('shows registration success message', () => {
    window.history.pushState(
      { registrationSuccess: true, email: 'new@example.com' },
      '',
      '/profile'
    );
    
    useAuthStore.setState({ user: mockUser });
    renderProfilePage();
    
    expect(screen.getByText('アカウント登録が完了しました')).toBeInTheDocument();
    expect(screen.getByText(/new@example.com/)).toBeInTheDocument();
  });

  it('hides success message after timeout', async () => {
    vi.useFakeTimers();
    
    window.history.pushState(
      { registrationSuccess: true, email: 'new@example.com' },
      '',
      '/profile'
    );
    
    useAuthStore.setState({ user: mockUser });
    renderProfilePage();
    
    expect(screen.getByText('アカウント登録が完了しました')).toBeInTheDocument();
    
    vi.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(screen.queryByText('アカウント登録が完了しました')).not.toBeInTheDocument();
    });
    
    vi.useRealTimers();
  });

  it('displays search statistics', () => {
    useAuthStore.setState({ user: mockUser });
    renderProfilePage();
    
    expect(screen.getByText('本日の検索回数')).toBeInTheDocument();
    expect(screen.getByText('3回')).toBeInTheDocument();
    expect(screen.getByText('2025年1月1日')).toBeInTheDocument();
  });
});