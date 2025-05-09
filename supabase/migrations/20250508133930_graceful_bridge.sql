/*
  # Create tables for video tracking and recipes

  1. New Tables
    - `popular_videos`
      - `video_id` (text, primary key) - YouTube video ID
      - `save_count` (integer) - Number of times the video has been saved
      - `last_updated` (timestamptz) - Last update timestamp
    
    - `search_keywords`
      - `id` (uuid, primary key) - Unique identifier
      - `keyword` (text, unique) - Search keyword
      - `search_count` (integer) - Number of times the keyword was searched
      - `category` (text) - Optional category for the keyword
      - `last_updated` (timestamptz) - Last update timestamp
    
    - `saved_recipes`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid) - Reference to users table
      - `video_id` (text) - YouTube video ID
      - `video_url` (text) - Full YouTube video URL
      - `video_title` (text) - Video title
      - `thumbnail_url` (text) - Video thumbnail URL
      - `ingredients` (jsonb) - List of ingredients
      - `steps` (jsonb) - List of cooking steps
      - `tags` (jsonb) - List of recipe tags
      - `created_at` (timestamptz) - When the recipe was saved

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Anyone can read popular videos
      - Anyone can read search keywords
      - Users can only read and delete their own saved recipes
      - System functions can update popular videos and search keywords

  3. Functions
    - `increment_video_save_count`: Increment save count for a video
    - `increment_keyword_search_count`: Increment search count for a keyword
*/

-- Create popular_videos table
CREATE TABLE IF NOT EXISTS public.popular_videos (
  video_id text PRIMARY KEY,
  save_count integer DEFAULT 1,
  last_updated timestamptz DEFAULT now()
);

-- Create search_keywords table
CREATE TABLE IF NOT EXISTS public.search_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text UNIQUE NOT NULL,
  search_count integer DEFAULT 1,
  category text,
  last_updated timestamptz DEFAULT now()
);

-- Create saved_recipes table
CREATE TABLE IF NOT EXISTS public.saved_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  video_id text NOT NULL,
  video_url text NOT NULL,
  video_title text NOT NULL,
  thumbnail_url text NOT NULL,
  ingredients jsonb NOT NULL,
  steps jsonb NOT NULL,
  tags jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Enable Row Level Security
ALTER TABLE public.popular_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

-- Create policies for popular_videos
CREATE POLICY "Anyone can read popular videos"
  ON public.popular_videos
  FOR SELECT
  TO public
  USING (true);

-- Create policies for search_keywords
CREATE POLICY "Anyone can read search keywords"
  ON public.search_keywords
  FOR SELECT
  TO public
  USING (true);

-- Create policies for saved_recipes
CREATE POLICY "Users can read own saved recipes"
  ON public.saved_recipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved recipes"
  ON public.saved_recipes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved recipes"
  ON public.saved_recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to increment video save count
CREATE OR REPLACE FUNCTION public.increment_video_save_count(vid_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.popular_videos (video_id, save_count, last_updated)
  VALUES (vid_id, 1, now())
  ON CONFLICT (video_id)
  DO UPDATE SET
    save_count = popular_videos.save_count + 1,
    last_updated = now();
END;
$$;

-- Create function to increment keyword search count
CREATE OR REPLACE FUNCTION public.increment_keyword_search_count(kw text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.search_keywords (keyword, search_count, last_updated)
  VALUES (kw, 1, now())
  ON CONFLICT (keyword)
  DO UPDATE SET
    search_count = search_keywords.search_count + 1,
    last_updated = now();
END;
$$;