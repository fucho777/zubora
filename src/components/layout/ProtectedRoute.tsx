import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div 
          data-testid="loading-spinner"
          role="status"
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;