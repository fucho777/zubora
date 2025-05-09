import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChefHat, Clock } from 'lucide-react';
import KeywordSelector from '../components/recipe/KeywordSelector';
import PopularVideosList from '../components/recipe/PopularVideosList';
import Button from '../components/ui/Button';

const HomePage = () => {
  const navigate = useNavigate();

  const handleSearch = (keyword: string) => {
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-50 to-white -mx-4 -mt-8 px-4 pt-12 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <ChefHat className="h-16 w-16 text-orange-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">今日は何を作る？</h1>
          <p className="text-lg text-gray-600 mb-8">
            キーワードを入力するだけで、AIがあなたにぴったりのレシピ動画を見つけます。
          </p>
          <div className="max-w-2xl mx-auto">
            <KeywordSelector onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Clock className="h-6 w-6 text-orange-500" />}
            title="時短レシピ"
            description="忙しい日でも10分で作れる簡単レシピ"
            onClick={() => handleSearch("時短")}
          />
          <FeatureCard
            icon={<ChefHat className="h-6 w-6 text-orange-500" />}
            title="初心者向け"
            description="料理初心者でも失敗しない基本レシピ"
            onClick={() => handleSearch("初心者")}
          />
          <FeatureCard
            icon={<Search className="h-6 w-6 text-orange-500" />}
            title="節約レシピ"
            description="コスパ良く栄養バランスの取れた料理"
            onClick={() => handleSearch("節約")}
          />
        </div>
      </section>

      {/* Popular Recipes Section */}
      <section>
        <PopularVideosList />
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  onClick,
}) => {
  return (
    <Button
      variant="ghost"
      className="h-auto p-6 bg-white hover:bg-orange-50 border border-gray-100 rounded-xl text-left"
      onClick={onClick}
    >
      <div className="flex flex-col items-start">
        <div className="p-2 bg-orange-100 rounded-lg mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Button>
  );
};

export default HomePage;