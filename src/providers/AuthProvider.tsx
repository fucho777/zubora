import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { cleanupExpiredTokens } from '../lib/utils';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, getUser } = useAuthStore();
  
  // Cleanup expired tokens every hour
  const runCleanup = useCallback(async () => {
    try {
      await cleanupExpiredTokens();
    } catch (error) {
      // Log non-network errors
      if (error instanceof Error && !error.message.includes('Failed to fetch')) {
        console.warn('AuthProvider: Token cleanup failed', {
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, []);
  
  useEffect(() => {
    getUser();
    
    // Run initial cleanup after a longer delay to ensure Edge Function is ready
    const initialCleanupTimeout = setTimeout(runCleanup, 5000);
    
    // Set up interval for cleanup
    const cleanupInterval = setInterval(runCleanup, 60 * 60 * 1000); // Run every hour
    
    return () => {
      clearInterval(cleanupInterval);
      clearTimeout(initialCleanupTimeout);
    };
  }, [getUser, runCleanup]);
  
  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};