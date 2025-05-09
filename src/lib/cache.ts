import { VideoData } from '../store/recipeStore';

const CACHE_DURATION = 1000 * 60 * 60; // 1時間
const SEARCH_CACHE_DURATION = 1000 * 60 * 5; // 5分

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface SearchCacheItem {
  videos: VideoData[];
  timestamp: number;
}

class VideoCache {
  private cache: Map<string, CacheItem<VideoData>>;
  private searchCache: Map<string, SearchCacheItem>;
  
  constructor() {
    this.cache = new Map();
    this.searchCache = new Map();
  }
  
  set(key: string, data: VideoData): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  get(key: string): VideoData | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  setSearchResults(keyword: string, videos: VideoData[]): void {
    this.searchCache.set(keyword, {
      videos,
      timestamp: Date.now()
    });
  }
  
  getSearchResults(keyword: string): VideoData[] | null {
    const item = this.searchCache.get(keyword);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > SEARCH_CACHE_DURATION) {
      this.searchCache.delete(keyword);
      return null;
    }
    
    return item.videos;
  }
  
  clearSearchCache(): void {
    this.searchCache.clear();
  }
}

export const videoCache = new VideoCache();