import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { sendVerificationEmail } from '../../lib/email';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      upsert: vi.fn(),
    })),
  },
}));

vi.mock('../../lib/email', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isLoading: false,
    });
  });

  describe('signUp', () => {
    it('creates a new user successfully', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValueOnce({
        upsert: vi.fn().mockResolvedValueOnce({ error: null }),
      } as any);

      const { signUp } = useAuthStore.getState();
      const result = await signUp('test@example.com', 'password123');

      expect(result.error).toBeNull();
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: expect.any(String),
        },
      });
      expect(sendVerificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String)
      );
    });

    it('handles signup errors', async () => {
      const mockError = {
        message: 'Email already registered',
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: null },
        error: mockError,
      });

      const { signUp } = useAuthStore.getState();
      const result = await signUp('test@example.com', 'password123');

      expect(result.error).toBe(mockError);
    });
  });

  describe('signIn', () => {
    it('signs in user successfully', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValueOnce({
              email_verified: true,
            }),
          }),
        }),
      } as any);

      const { signIn } = useAuthStore.getState();
      const result = await signIn('test@example.com', 'password123');

      expect(result.error).toBeNull();
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('handles unverified email', async () => {
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValueOnce({
              email_verified: false,
            }),
          }),
        }),
      } as any);

      const { signIn } = useAuthStore.getState();
      const result = await signIn('test@example.com', 'password123');

      expect(result.error?.message).toBe('メールアドレスが未確認です。メールをご確認ください。');
    });
  });

  describe('incrementSearchCount', () => {
    it('increments search count when under daily limit', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        dailySearchCount: 2,
        lastSearchDate: '2025-01-01',
      };

      useAuthStore.setState({ user: mockUser });

      vi.mocked(supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValueOnce({ error: null }),
        }),
      } as any);

      const { incrementSearchCount } = useAuthStore.getState();
      const result = await incrementSearchCount();

      expect(result).toBe(true);
    });

    it('prevents increment when at daily limit', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        dailySearchCount: 5,
        lastSearchDate: new Date().toISOString().split('T')[0],
      };

      useAuthStore.setState({ user: mockUser });

      const { incrementSearchCount } = useAuthStore.getState();
      const result = await incrementSearchCount();

      expect(result).toBe(false);
    });
  });
});