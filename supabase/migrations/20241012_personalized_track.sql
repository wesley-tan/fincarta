-- =====================================================
-- PERSONALIZED TRACK MIGRATION
-- Creates tables for AI-generated personalized roadmaps
-- =====================================================

-- 1. USER PROFILES TABLE
-- Stores user demographics and financial information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Demographics
  age INTEGER,
  income_range TEXT,
  employment_status TEXT DEFAULT 'employed',
  
  -- Financial Situation
  current_savings DECIMAL DEFAULT 0,
  current_debt DECIMAL DEFAULT 0,
  monthly_expenses DECIMAL DEFAULT 0,
  has_emergency_fund BOOLEAN DEFAULT FALSE,
  has_401k BOOLEAN DEFAULT FALSE,
  has_ira BOOLEAN DEFAULT FALSE,
  
  -- Goals & Preferences
  primary_goal TEXT,
  secondary_goals TEXT[],
  risk_tolerance TEXT DEFAULT 'moderate',
  time_horizon TEXT DEFAULT 'medium',
  
  -- Learning Preferences
  learning_style TEXT DEFAULT 'mixed',
  difficulty_level TEXT DEFAULT 'beginner',
  
  -- Engagement Metrics
  last_login TIMESTAMP DEFAULT NOW(),
  total_articles_read INTEGER DEFAULT 0,
  total_quizzes_completed INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  
  -- Constraints
  CONSTRAINT valid_income_range CHECK (income_range IN ('under_30k', '30k_50k', '50k_75k', '75k_100k', '100k_150k', '150k_plus')),
  CONSTRAINT valid_employment CHECK (employment_status IN ('employed', 'self_employed', 'student', 'retired', 'unemployed')),
  CONSTRAINT valid_primary_goal CHECK (primary_goal IN ('debt_payoff', 'retirement', 'home_purchase', 'wealth_building', 'financial_security', 'education')),
  CONSTRAINT valid_risk_tolerance CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  CONSTRAINT valid_time_horizon CHECK (time_horizon IN ('short', 'medium', 'long')),
  CONSTRAINT valid_learning_style CHECK (learning_style IN ('visual', 'reading', 'interactive', 'mixed')),
  CONSTRAINT valid_difficulty CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'))
);

-- 2. PERSONALIZED TRACK STEPS
-- Stores AI-generated custom roadmap steps for each user
CREATE TABLE IF NOT EXISTS personalized_track_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Step Details
  step_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL,
  estimated_duration TEXT,
  
  -- AI-Generated Content
  topics TEXT[] NOT NULL,
  custom_advice TEXT,
  why_this_matters TEXT, -- Personalized explanation
  ai_generated BOOLEAN DEFAULT TRUE,
  generation_context JSONB, -- Stores user profile snapshot used for generation
  
  -- Progress Tracking
  status TEXT DEFAULT 'pending',
  progress_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  stars INTEGER DEFAULT 0,
  articles_read TEXT[],
  
  -- Quiz
  has_quiz BOOLEAN DEFAULT TRUE,
  quiz_questions JSONB,
  quiz_completed BOOLEAN DEFAULT FALSE,
  quiz_score INTEGER,
  
  -- Constraints
  CONSTRAINT valid_priority CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  CONSTRAINT valid_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  CONSTRAINT valid_stars CHECK (stars >= 0 AND stars <= 3)
);

-- 3. USER TRACK PREFERENCE
-- Stores which track the user is currently viewing
CREATE TABLE IF NOT EXISTS user_track_preference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  active_track TEXT DEFAULT 'personal_finance',
  last_switched TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_track CHECK (active_track IN ('personal_finance', 'investment', 'crypto', 'personalized'))
);

-- 4. USER ACTIVITY LOG (Optional - for future analytics)
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  activity_type TEXT NOT NULL,
  related_topic TEXT,
  metadata JSONB,
  
  CONSTRAINT valid_activity_type CHECK (activity_type IN ('article_read', 'quiz_completed', 'goal_updated', 'step_completed', 'chat_interaction', 'login', 'track_switched'))
);

-- INDEXES
-- Optimize queries for common access patterns
CREATE INDEX IF NOT EXISTS idx_personalized_steps_user_order ON personalized_track_steps(user_id, step_order);
CREATE INDEX IF NOT EXISTS idx_personalized_steps_status ON personalized_track_steps(user_id, status);
CREATE INDEX IF NOT EXISTS idx_track_preference_user ON user_track_preference(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_user_type ON user_activity_log(user_id, activity_type, created_at DESC);

-- ROW LEVEL SECURITY (RLS)
-- Ensure users can only access their own data
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_track_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_track_preference ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR USER_PROFILES
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS POLICIES FOR PERSONALIZED_TRACK_STEPS
CREATE POLICY "Users can view own steps"
  ON personalized_track_steps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own steps"
  ON personalized_track_steps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own steps"
  ON personalized_track_steps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own steps"
  ON personalized_track_steps FOR DELETE
  USING (auth.uid() = user_id);

-- RLS POLICIES FOR USER_TRACK_PREFERENCE
CREATE POLICY "Users can manage own track preference"
  ON user_track_preference FOR ALL
  USING (auth.uid() = user_id);

-- RLS POLICIES FOR USER_ACTIVITY_LOG
CREATE POLICY "Users can view own activity"
  ON user_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON user_activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- TRIGGERS
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personalized_steps_updated_at
  BEFORE UPDATE ON personalized_track_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '✅ Personalized Track Migration Complete!';
  RAISE NOTICE 'Tables created: user_profiles, personalized_track_steps, user_track_preference, user_activity_log';
  RAISE NOTICE 'RLS policies applied for all tables';
  RAISE NOTICE 'Indexes created for optimized queries';
END $$;

