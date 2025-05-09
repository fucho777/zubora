import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Tag } from 'lucide-react';
import { VideoData } from '../../store/recipeStore';
import { truncateText } from '../../lib/utils';
import Card from './Card';

interface VideoCardProps {
  video: VideoData;
  showDescription?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, showDescription = true }) => {
  return (
    <Link to={`/video/${video.id}`}>
      <Card
        variant="elevated"
        className="transition-transform duration-200 hover:scale-[1.02] cursor-pointer h-full"
      >
        <div className="aspect-video relative overflow-hidden">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-white" />
              <span className="text-white text-sm">約10分</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-800 mb-1">{truncateText(video.title, 60)}</h3>
          <p className="text-sm text-gray-500 mb-2">{video.channelTitle}</p>
          
          {showDescription && (
            <p className="text-sm text-gray-600 mb-3">{truncateText(video.description, 100)}</p>
          )}
          
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-orange-500" />
            <div className="flex flex-wrap gap-1">
              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">簡単</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">10分以内</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">初心者向け</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default VideoCard;