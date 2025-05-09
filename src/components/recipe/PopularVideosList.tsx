import React, { useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { useRecipeStore } from '../../store/recipeStore';
import VideoCard from '../ui/VideoCard';

const PopularVideosList: React.FC = () => {
  const { popularVideos, fetchPopularVideos, isLoading } = useRecipeStore();
  
  useEffect(() => {
    fetchPopularVideos();
  }, [fetchPopularVideos]);
  
  if (isLoading && popularVideos.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  return (
    <div className="mt-8">
      <div className="flex items-center space-x-2 mb-4">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h2 className="text-xl font-bold text-gray-800">人気のレシピ</h2>
      </div>
      
      {popularVideos.length === 0 ? (
        <p className="text-gray-500 text-center py-8">まだ人気のレシピはありません。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularVideos.slice(0, 6).map((video) => (
            <VideoCard key={video.id} video={video} showDescription={false} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PopularVideosList;