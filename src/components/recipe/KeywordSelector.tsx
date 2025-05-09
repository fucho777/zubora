import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Keyword from '../ui/Keyword';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface KeywordSelectorProps {
  onSearch: (keyword: string) => void;
}

const KeywordSelector: React.FC<KeywordSelectorProps> = ({ onSearch }) => {
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [customKeyword, setCustomKeyword] = useState('');
  
  const suggestedKeywords = [
    '時短', '簡単', 'ズボラ飯', 'リュウジ', '一人暮らし', 
    '3分料理', '朝食', '夜食', 'お弁当', 
    '残り物アレンジ', '冷蔵庫整理', '節約', '丼もの'
  ];
  
  const handleKeywordClick = (keyword: string) => {
    setSelectedKeyword(keyword);
    setCustomKeyword(keyword);
  };
  
  const handleSearch = () => {
    if (customKeyword.trim()) {
      onSearch(customKeyword.trim());
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className="bg-orange-50 rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-4">何を作りたいですか？</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-3">人気のキーワード</p>
        <div className="flex flex-wrap gap-2">
          {suggestedKeywords.map((keyword) => (
            <Keyword
              key={keyword}
              text={keyword}
              isSelected={selectedKeyword === keyword}
              onClick={() => handleKeywordClick(keyword)}
            />
          ))}
        </div>
      </div>
      
      <div className="relative">
        <Input
          value={customKeyword}
          onChange={(e) => setCustomKeyword(e.target.value)}
          placeholder="キーワードを入力 (例: 10分パスタ)"
          onKeyDown={handleKeyDown}
          className="pr-24"
        />
        <Button
          className="absolute right-1 top-1 rounded-md"
          onClick={handleSearch}
          disabled={!customKeyword.trim()}
          size="sm"
        >
          <div className="flex items-center space-x-1">
            <Search className="h-4 w-4" />
            <span>検索</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default KeywordSelector;