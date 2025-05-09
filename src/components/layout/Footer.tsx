import React from 'react';
import { ChefHat, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <ChefHat className="h-6 w-6 text-orange-400" />
            <span className="text-lg font-bold">ズボラシェフAI</span>
          </div>
          
          <div className="flex items-center space-x-1 text-sm">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>by ズボラ開発チーム</span>
          </div>
        </div>
        
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} ズボラシェフAI. All rights reserved.</p>
          <p className="mt-1">
            このサービスはYouTube APIを利用しています。YouTube及びすべての関連するロゴは、Google Inc.の商標です。
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;