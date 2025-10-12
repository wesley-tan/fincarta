/**
 * Supabase Client
 * 
 * This file creates a Supabase client instance that can be used
 * throughout the application for database, auth, and storage operations.
 */

import { createClient } from '@supabase/supabase-js'

// Supabase configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key-for-build'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  if (typeof window !== 'undefined') {
    console.warn('⚠️  Supabase environment variables not configured. Some features may not work.')
    console.warn('   Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local')
  }
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Database types (auto-generated later with: npx supabase gen types typescript --local)
export type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
}

export type RoadmapProgress = {
  id: string
  user_id: string
  step_id: string
  completed: boolean
  stars: number
  articles_read: string[]
  updated_at: string
}

export type ChatHistory = {
  id: string
  user_id: string
  article_title: string
  message: string
  role: 'user' | 'agent'
  image_url: string | null
  created_at: string
}

export type UploadedFile = {
  id: string
  user_id: string
  filename: string
  file_type: string
  file_url: string
  extracted_text: string | null
  created_at: string
}

