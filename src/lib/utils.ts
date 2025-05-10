import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from './supabase';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function getRemainingSearches(dailyCount: number): number {
  return Math.max(0, 5 - dailyCount);
}

export function getRemainingRecipes(savedCount: number): number {
  return Math.max(0, 5 - savedCount);
}

export async function logEdgeFunctionError(
  functionName: string,
  errorMessage: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    await supabase
      .from('edge_function_logs')
      .insert({
        function_name: functionName,
        status: 'error',
        error_message: errorMessage,
        metadata
      });
  } catch (error) {
    console.error('Failed to log edge function error:', error);
  }
}

export async function cleanupExpiredTokens(): Promise<void> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration is missing');
    }

    // Log cleanup attempt
    console.log('Token cleanup: Starting...', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      timestamp: new Date().toISOString()
    });

    const response = await fetch(
      `${supabaseUrl}/functions/v1/cleanup-tokens`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Token cleanup failed:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        timestamp: new Date().toISOString()
      });
      throw new Error(
        `Failed to cleanup expired tokens: ${
          errorData?.error || response.statusText
        }`
      );
    }

    const data = await response.json();
    console.log('Token cleanup: Completed successfully', {
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Enhanced error logging
    const errorDetails = {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };

    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        console.warn('Token cleanup: Network error (Edge Function may not be deployed)', errorDetails);
        return; // Silently handle network errors in development
      }
      console.error('Token cleanup: Error occurred', errorDetails);
    }
    
    // Only throw error if it's not a network error
    if (!(error instanceof Error) || !error.message.includes('Failed to fetch')) {
      throw error;
    }
  }
}

export function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 環境変数が正しく設定されているかを確認する関数
 * @returns 環境変数のステータス情報
 */
export function checkEnvironmentVariables(): { 
  isSupabaseConfigured: boolean;
  isYoutubeApiConfigured: boolean;
  isGeminiApiConfigured: boolean;
  isGeminiModelConfigured: boolean;
  geminiModel: string | null;
} {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const geminiModel = import.meta.env.VITE_GEMINI_MODEL;
  
  return {
    isSupabaseConfigured: 
      !!supabaseUrl && 
      !!supabaseAnonKey && 
      supabaseUrl !== 'あなたのSupabase_URLをここに入力してください' &&
      supabaseAnonKey !== 'あなたのSupabase_ANON_KEYをここに入力してください',
    
    isYoutubeApiConfigured: 
      !!youtubeApiKey && 
      youtubeApiKey !== 'あなたのYouTube_API_KEYをここに入力してください',
    
    isGeminiApiConfigured: 
      !!geminiApiKey && 
      geminiApiKey !== 'あなたのGemini_API_KEYをここに入力してください',
      
    isGeminiModelConfigured: !!geminiModel,
    
    geminiModel: geminiModel || null
  };
}

export function batchVideoIds(ids: string[]): string[][] {
  const batchSize = 50; // YouTube APIの1回のリクエストで最大50件
  const batches: string[][] = [];
  
  for (let i = 0; i < ids.length; i += batchSize) {
    batches.push(ids.slice(i, i + batchSize));
  }
  
  return batches;
}