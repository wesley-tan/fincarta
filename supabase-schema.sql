-- Supabase Database Schema for Fincarta Authentication & User Profiles

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER,
  income_range TEXT,
  employment_status TEXT DEFAULT 'employed',
  current_savings DECIMAL(15, 2) DEFAULT 0,
  current_debt DECIMAL(15, 2) DEFAULT 0,
  monthly_expenses DECIMAL(15, 2) DEFAULT 0,
  has_emergency_fund BOOLEAN DEFAULT false,
  has_401k BOOLEAN DEFAULT false,
  has_ira BOOLEAN DEFAULT false,
  primary_goal TEXT,
  risk_tolerance TEXT DEFAULT 'moderate',
  time_horizon TEXT DEFAULT 'medium',
  learning_style TEXT DEFAULT 'mixed',
  difficulty_level TEXT DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Track Preference Table
CREATE TABLE IF NOT EXISTS user_track_preference (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_track TEXT DEFAULT 'personal_finance',
  last_switched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Activity Log Table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_track_preference ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 6. Create RLS Policies for user_track_preference
CREATE POLICY "Users can view their own track preference"
  ON user_track_preference FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own track preference"
  ON user_track_preference FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own track preference"
  ON user_track_preference FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. Create RLS Policies for user_activity_log
CREATE POLICY "Users can view their own activity log"
  ON user_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity log"
  ON user_activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_track_preference_user_id ON user_track_preference(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at DESC);

-- 9. Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- INSTRUCTIONS:
-- ========================================
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor (left sidebar)
-- 3. Click "New query"
-- 4. Copy and paste this entire SQL script
-- 5. Click "Run" to execute
--
-- This will create all necessary tables for user profiles,
-- track preferences, and activity logging with proper
-- security policies enabled.
-- ========================================
