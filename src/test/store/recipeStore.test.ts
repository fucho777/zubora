import { describe, it, expect, beforeEach } from 'vitest';
import { useRecipeStore } from '../../store/recipeStore';
import { supabase } from '../../lib/supabase';
import { videoCache } from '../../lib/cache';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(),
        })),
      })),
      insert: vi.fn(),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
      upsert: vi.fn(),
    })),
    rpc: vi.fn(),
  },
}));

vi.mock('../../lib/cache', () => ({
  videoCache: {
    get: vi.fn(),
    set: vi.fn(),
    getSearchResults: vi.fn(),
    setSearchResults: vi.fn(),
  },
}));

describe('recipeStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRecipeStore.setState({
      savedRecipes: [],
      searchResults: [],
      popularVideos: [],
      currentRecipe: null,
      isLoading: false,
      searchError: null,
    });
  });

  describe('fetchSavedRecipes', () => {
    it('fetches saved recipes successfully', async () => {
      const mockRecipes = [
        {
          video_id: 'test-1',
          video_title: 'Test Recipe 1',
          video_url: 'https://youtube.com/watch?v=test-1',
          thumbnail_url: 'https://img.youtube.com/test-1',
          ingredients: ['ingredient 1', 'ingredient 2'],
          steps: ['step 1', 'step 2'],
          tags: ['tag1', 'tag2'],
        },
      ];

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockResolvedValueOnce({
          data: mockRecipes,
          error: null,
        }),
      } as any);

      const { fetchSavedRecipes } = useRecipeStore.getState();
      await fetchSavedRecipes();

      const state = useRecipeStore.getState();
      expect(state.savedRecipes).toHaveLength(1);
      expect(state.savedRecipes[0].videoId).toBe('test-1');
    });
  });

  describe('saveRecipe', () => {
    it('saves a recipe successfully', async () => {
      const mockRecipe = {
        videoId: 'test-1',
        videoTitle: 'Test Recipe',
        videoUrl: 'https://youtube.com/watch?v=test-1',
        thumbnailUrl: 'https://img.youtube.com/test-1',
        ingredients: ['ingredient 1'],
        steps: ['step 1'],
        tags: ['tag1'],
      };

      vi.mocked(supabase.from).mockReturnValueOnce({
        insert: vi.fn().mockResolvedValueOnce({ error: null }),
      } as any);

      vi.mocked(supabase.rpc).mockResolvedValueOnce({ error: null });

      const { saveRecipe } = useRecipeStore.getState();
      const result = await saveRecipe(mockRecipe);

      expect(result.success).toBe(true);
    });

    it('prevents saving more than 5 recipes', async () => {
      useRecipeStore.setState({
        savedRecipes: Array(5).fill({}),
      });

      const { saveRecipe } = useRecipeStore.getState();
      const result = await saveRecipe({} as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe('保存可能なレシピは最大5つまでです。');
    });
  });

  describe('searchVideos', () => {
    it('returns cached results if available', async () => {
      const mockResults = [
        {
          id: 'cached-1',
          title: 'Cached Recipe',
          description: 'A cached recipe',
          thumbnailUrl: 'https://img.youtube.com/cached-1',
          videoUrl: 'https://youtube.com/watch?v=cached-1',
          channelTitle: 'Test Channel',
        },
      ];

      vi.mocked(videoCache.getSearchResults).mockReturnValueOnce(mockResults);

      const { searchVideos } = useRecipeStore.getState();
      const result = await searchVideos('test query');

      expect(result.success).toBe(true);
      expect(useRecipeStore.getState().searchResults).toEqual(mockResults);
    });

    it('fetches new results when not cached', async () => {
      vi.mocked(videoCache.getSearchResults).mockReturnValueOnce(null);

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          items: [
            {
              id: { videoId: 'new-1' },
              snippet: {
                title: 'New Recipe',
                description: 'A new recipe',
                thumbnails: { high: { url: 'https://img.youtube.com/new-1' } },
                channelTitle: 'Test Channel',
              },
            },
          ],
        }),
      });

      const { searchVideos } = useRecipeStore.getState();
      const result = await searchVideos('test query');

      expect(result.success).toBe(true);
      expect(useRecipeStore.getState().searchResults).toHaveLength(1);
      expect(videoCache.setSearchResults).toHaveBeenCalled();
    });
  });
});