# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with these variables:

```bash
# ============================================================================
# GEMINI API (Required)
# ============================================================================
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# ============================================================================
# ELEVENLABS API (Optional - for voice features)
# ============================================================================
# Get your API key from: https://elevenlabs.io/
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# ============================================================================
# SUPABASE (Required for database, auth, and storage)
# ============================================================================
# Get these from your Supabase project settings
# Dashboard: https://app.supabase.com/project/_/settings/api

# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase anonymous key (safe to expose in browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Setup Instructions

1. **Get Gemini API Key**
   - Visit https://makersuite.google.com/app/apikey
   - Create a new API key
   - Add it to `.env.local`

2. **Get Supabase Credentials**
   - Create account at https://supabase.com
   - Create a new project
   - Go to Settings > API
   - Copy URL and anon key to `.env.local`

3. **Set Up Database**
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `supabase/migrations/20241012000001_initial_schema.sql`
   - Run the migration

4. **Create Storage Buckets**
   - Go to Storage in Supabase dashboard
   - Create three buckets:
     - `pdfs` (private)
     - `images` (private)
     - `avatars` (public)

5. **Configure OAuth (Optional)**
   - Go to Authentication > Providers
   - Enable Google OAuth
   - Add OAuth credentials

## Testing

Run the app:
```bash
npm run dev
```

Your app will be available at http://localhost:3000

