import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecipeStore } from '../store/recipeStore';
import KeywordSelector from '../components/recipe/KeywordSelector';
import VideoCard from '../components/ui/VideoCard';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { searchVideos, searchResults, isLoading, searchError } = useRecipeStore();
  const [error, setError] = useState<string | null>(null);
  
  const handleSearch = async (keyword: string) => {
    setError(null);
    const { success, error } = await searchVideos(keyword);
    
    if (!success) {
      setError(error || '検索中にエラーが発生しました。');
      return;
    }
    
    // Update URL with search query
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };
  
  // Initial search if query parameter exists
  React.useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      handleSearch(query);
    }
  }, []);
  
  return (
    <div className="space-y-8">
      <KeywordSelector onSearch={handleSearch} />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : searchResults.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">検索結果</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      ) : !isLoading && !error && searchParams.get('q') && (
        <div className="text-center py-12">
          <p className="text-gray-500">検索結果が見つかりませんでした。</p>
          <p className="text-gray-500">別のキーワードで試してみてください。</p>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;