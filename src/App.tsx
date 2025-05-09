import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import VideoDetailPage from './pages/VideoDetailPage';
import SavedRecipesPage from './pages/SavedRecipesPage';
import ProfilePage from './pages/ProfilePage';

// Layout components
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';

// Providers
import { AuthProvider } from './providers/AuthProvider';
import { BatchProvider } from './providers/BatchProvider';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <BatchProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/video/:videoId" element={<VideoDetailPage />} />
                <Route path="/saved-recipes" element={<SavedRecipesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>
          </Routes>
          </BatchProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;