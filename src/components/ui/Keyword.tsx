import React from 'react';
import { cn } from '../../lib/utils';

interface KeywordProps {
  text: string;
  isSelected?: boolean;
  onClick: () => void;
}

const Keyword: React.FC<KeywordProps> = ({ text, isSelected = false, onClick }) => {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-full text-sm font-medium transition-colors',
        isSelected
          ? 'bg-orange-500 text-white'
          : 'bg-white text-gray-700 hover:bg-orange-100 border border-gray-200'
      )}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Keyword;