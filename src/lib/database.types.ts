export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          daily_search_count: number
          last_search_date: string | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          daily_search_count?: number
          last_search_date?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          daily_search_count?: number
          last_search_date?: string | null
        }
      }
      saved_recipes: {
        Row: {
          id: string
          user_id: string
          video_id: string
          video_url: string
          video_title: string
          thumbnail_url: string
          ingredients: Json
          steps: Json
          created_at: string
          tags: Json
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          video_url: string
          video_title: string
          thumbnail_url: string
          ingredients: Json
          steps: Json
          created_at?: string
          tags?: Json
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          video_url?: string
          video_title?: string
          thumbnail_url?: string
          ingredients?: Json
          steps?: Json
          created_at?: string
          tags?: Json
        }
      }
      popular_videos: {
        Row: {
          video_id: string
          save_count: number
          last_updated: string
        }
        Insert: {
          video_id: string
          save_count?: number
          last_updated?: string
        }
        Update: {
          video_id?: string
          save_count?: number
          last_updated?: string
        }
      }
      search_keywords: {
        Row: {
          id: string
          keyword: string
          search_count: number
          category: string | null
        }
        Insert: {
          id?: string
          keyword: string
          search_count?: number
          category?: string | null
        }
        Update: {
          id?: string
          keyword?: string
          search_count?: number
          category?: string | null
        }
      }
    }
  }
}