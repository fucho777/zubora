import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Search, BookOpen, User, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/home" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-orange-500" aria-label="ズボラシェフAI" />
            <span className="text-xl font-bold text-gray-800">ズボラシェフAI</span>
          </Link>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/home" className="text-gray-600 hover:text-orange-500 flex items-center space-x-1">
              <Search className="h-5 w-5" aria-hidden="true" />
              <span>検索</span>
            </Link>
            <Link to="/saved-recipes" className="text-gray-600 hover:text-orange-500 flex items-center space-x-1">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              <span>保存済みレシピ</span>
            </Link>
            <Link to="/profile" className="text-gray-600 hover:text-orange-500 flex items-center space-x-1">
              <User className="h-5 w-5" aria-hidden="true" />
              <span>マイページ</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              ログアウト
            </button>
          </div>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden focus:outline-none"
            aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={isMenuOpen}
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white px-4 py-2 shadow-md">
          <div className="flex flex-col space-y-3 pb-3">
            <Link
              to="/home"
              className="text-gray-600 hover:text-orange-500 py-2 flex items-center space-x-1"
              onClick={() => setIsMenuOpen(false)}
            >
              <Search className="h-5 w-5" aria-hidden="true" />
              <span>検索</span>
            </Link>
            <Link
              to="/saved-recipes"
              className="text-gray-600 hover:text-orange-500 py-2 flex items-center space-x-1"
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              <span>保存済みレシピ</span>
            </Link>
            <Link
              to="/profile"
              className="text-gray-600 hover:text-orange-500 py-2 flex items-center space-x-1"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="h-5 w-5" aria-hidden="true" />
              <span>マイページ</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;