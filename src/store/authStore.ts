import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { sendVerificationEmail } from '../lib/email';
import { generateToken } from '../lib/utils';

interface User {
  id: string;
  email: string;
  dailySearchCount: number;
  lastSearchDate: string | null;
  createdAt: string | null; // 作成日時を追加
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  getUser: () => Promise<void>;
  incrementSearchCount: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  
  signUp: async (email, password) => {
    console.log('Attempting to sign up with email:', email);
    
    // Get the base URL from the current location
    const baseUrl = window.location.origin;
    
    // Generate verification token
    const verificationToken = generateToken();
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24); // Token expires in 24 hours
    
    try {
      // Register user with Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${baseUrl}/verify-email`
        }
      });
      
      console.log('Supabase auth signup response:', { data, error });
      
      if (error) {
        console.error('Signup auth error:', error);
        return { error };
      }
      
      if (!data.user) {
        console.error('No user data returned after signup');
        return { error: { message: 'ユーザーデータが取得できませんでした。' } };
      }
      
      console.log('Creating user profile for:', data.user.id);
      
      // ユーザープロフィールの作成（upsertを使用）
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          email: data.user.email || '',
          daily_search_count: 0,
          verification_token: verificationToken,
          verification_token_expires: tokenExpires.toISOString(),
          last_search_date: null,
        }, {
          onConflict: 'id',
          ignoreDuplicates: false // 重複した場合は更新する
        });
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { error: profileError };
      }
      
      // Send verification email
      try {
        await sendVerificationEmail(email, verificationToken, baseUrl);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        return { error: { message: 'メール送信に失敗しました。' } };
      }
      
      console.log('User profile created successfully');
      
      // ユーザー情報を取得
      await get().getUser();
      
      return { error: null };
    } catch (err) {
      console.error('Unexpected error during signup:', err);
      return { error: err };
    }
  },
  
  signIn: async (email, password) => {
    // First check if the user's email is verified
    const { data: userData } = await supabase
      .from('users')
      .select('email_verified')
      .eq('email', email)
      .maybeSingle();
    
    if (userData && !userData.email_verified) {
      return { error: { message: 'メールアドレスが未確認です。メールをご確認ください。' } };
    }
    
    // Proceed with sign in if email is verified
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error) {
      await get().getUser();
    }
    
    return { error };
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
  
  getUser: async () => {
    set({ isLoading: true });
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data?.session?.user) {
      set({ user: null, isLoading: false });
      return;
    }
    
    const { user: sessionUser } = data.session;
    
    if (sessionUser) {
      // カスタムユーザーデータを取得
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();
      
      if (data && data.email_verified) {
        // ユーザーのメタデータからcreated_atを取得
        // Supabaseではセッションのユーザーオブジェクトに作成日時が含まれている
        set({
          user: {
            id: data.id,
            email: data.email,
            dailySearchCount: data.daily_search_count,
            lastSearchDate: data.last_search_date,
            createdAt: sessionUser.created_at || null,
          },
        });
      }
    }
    
    set({ isLoading: false });
  },
  
  incrementSearchCount: async () => {
    const user = get().user;
    if (!user) return false;
    
    const today = new Date().toISOString().split('T')[0];
    let newCount = 1;
    
    // 日付が変わっている場合はカウントをリセットする
    // lastSearchDateがnull、または今日と異なる場合はリセット
    if (user.lastSearchDate === today) {
      newCount = user.dailySearchCount + 1;
      
      // 上限チェック
      if (newCount > 5) {
        return false;
      }
    } else {
      // 日付が変わった場合は検索回数を1にリセット
      console.log('日付変更を検出:', user.lastSearchDate, '->', today, '- 検索回数をリセット');
      newCount = 1;
    }
    
    // データベース更新
    const { error } = await supabase
      .from('users')
      .update({
        daily_search_count: newCount,
        last_search_date: today,
      })
      .eq('id', user.id);
    
    if (!error) {
      set({
        user: {
          ...user,
          dailySearchCount: newCount,
          lastSearchDate: today,
        },
      });
      return true;
    }
    
    return false;
  },
}));