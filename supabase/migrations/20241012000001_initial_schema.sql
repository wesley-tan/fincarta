-- FinCarta Database Schema
-- Initial migration for Supabase integration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Extends auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- ROADMAP PROGRESS TABLE
-- ============================================================================
-- Tracks user progress through the financial roadmap
CREATE TABLE IF NOT EXISTS public.roadmap_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  stars INTEGER DEFAULT 0,
  articles_read TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, step_id)
);

-- Enable Row Level Security
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roadmap_progress
CREATE POLICY "Users can view their own progress"
  ON public.roadmap_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.roadmap_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.roadmap_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON public.roadmap_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_roadmap_progress_user_id 
  ON public.roadmap_progress(user_id);

-- ============================================================================
-- CHAT HISTORY TABLE
-- ============================================================================
-- Stores AI agent conversation history
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_title TEXT NOT NULL,
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'agent')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_history
CREATE POLICY "Users can view their own chat history"
  ON public.chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
  ON public.chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat history"
  ON public.chat_history FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id 
  ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_article_title 
  ON public.chat_history(article_title);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at 
  ON public.chat_history(created_at DESC);

-- ============================================================================
-- UPLOADED FILES TABLE
-- ============================================================================
-- Tracks user-uploaded PDFs and images
CREATE TABLE IF NOT EXISTS public.uploaded_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'image')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  extracted_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for uploaded_files
CREATE POLICY "Users can view their own files"
  ON public.uploaded_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own files"
  ON public.uploaded_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
  ON public.uploaded_files FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id 
  ON public.uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_file_type 
  ON public.uploaded_files(file_type);

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
-- Note: These need to be created in the Supabase dashboard or via the CLI
-- 
-- Buckets to create:
-- 1. 'pdfs' - For user-uploaded PDF documents
-- 2. 'images' - For user-uploaded images
-- 3. 'avatars' - For user profile pictures
--
-- Bucket policies should allow:
-- - Authenticated users to upload to their own folder
-- - Users to read their own files
-- - Files should be private (not publicly accessible)

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for roadmap_progress
CREATE TRIGGER set_updated_at_roadmap_progress
  BEFORE UPDATE ON public.roadmap_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users';
COMMENT ON TABLE public.roadmap_progress IS 'Tracks user progress through the financial roadmap';
COMMENT ON TABLE public.chat_history IS 'Stores AI agent conversation history';
COMMENT ON TABLE public.uploaded_files IS 'Metadata for user-uploaded files';

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

