# 🗄️ Supabase Integration Guide

## Overview

FinCarta now uses **Supabase** for backend services including:
- 🔐 User authentication (Google OAuth + Magic Links)
- 💾 Database (user progress, chat history, file metadata)
- 📁 File storage (PDFs, images, avatars)
- ⚡ Real-time updates (optional)

This is a **hybrid architecture**: Next.js API routes handle AI logic, while Supabase provides data persistence.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Authentication](#authentication)
5. [File Storage](#file-storage)
6. [Usage Examples](#usage-examples)
7. [Migration Guide](#migration-guide)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Create a new project
5. Choose a **strong database password** (save it!)
6. Select a region close to your users
7. Wait for project to initialize (~2 minutes)

### Step 2: Get API Credentials

1. Go to **Settings** > **API**
2. Copy your **Project URL**
3. Copy your **anon/public key**
4. Add both to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 3: Run Database Migration

**Option A: Supabase Dashboard (Recommended)**
1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New query**
3. Copy entire contents of `supabase/migrations/20241012000001_initial_schema.sql`
4. Paste and click **Run**
5. Verify tables created in **Table Editor**

**Option B: Supabase CLI**
```bash
npm install -g supabase
npx supabase link --project-ref your-project-ref
npx supabase db push
```

### Step 4: Create Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Create three buckets:

**PDFs Bucket:**
- Name: `pdfs`
- Public: No (private)
- File size limit: 20MB
- Allowed MIME types: `application/pdf`

**Images Bucket:**
- Name: `images`
- Public: No (private)
- File size limit: 10MB
- Allowed MIME types: `image/*`

**Avatars Bucket:**
- Name: `avatars`
- Public: Yes
- File size limit: 2MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

### Step 5: Configure OAuth (Optional)

**For Google Sign-In:**
1. Go to **Authentication** > **Providers**
2. Enable **Google**
3. Get OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
4. Add Client ID and Client Secret
5. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

### Step 6: Test

```bash
npm run dev
```

Visit http://localhost:3000 and click "Sign In" button!

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         FinCarta (Next.js)                  │
│                                             │
│  ┌──────────────┐      ┌────────────────┐  │
│  │  Frontend    │      │  Backend       │  │
│  │  Components  │─────▶│  /api routes   │  │
│  │              │      │                │  │
│  │ • AgentChat  │      │ • Gemini AI    │  │
│  │ • Roadmap    │      │ • Image/PDF    │  │
│  │ • AuthButton │      │ • Calculators  │  │
│  └──────┬───────┘      └────────┬───────┘  │
│         │                       │          │
│         └───────────┬───────────┘          │
│                     ▼                       │
│              ┌─────────────┐                │
│              │  Supabase   │                │
│              │  Client     │                │
│              └──────┬──────┘                │
└─────────────────────┼────────────────────────┘
                      │
                      ▼
            ┌─────────────────┐
            │    Supabase     │
            │     Cloud       │
            │                 │
            │ • PostgreSQL    │
            │ • Storage       │
            │ • Auth          │
            │ • Realtime      │
            └─────────────────┘
```

**What Runs Where:**
- **Next.js API Routes**: AI processing, business logic
- **Supabase**: Data storage, auth, file uploads
- **Client**: UI, user interactions

---

## 💾 Database Schema

### Tables

**1. profiles**
- Extends `auth.users` with profile data
- Stores username, avatar URL
- Automatically created on signup

**2. roadmap_progress**
- Tracks user progress through roadmap
- Stores completed steps, stars earned
- Replaces `localStorage` implementation

**3. chat_history**
- Saves AI conversation history
- Persists across devices
- Allows conversation review

**4. uploaded_files**
- Metadata for PDFs and images
- Links to files in storage
- Stores extracted text (PDFs)

### Row Level Security (RLS)

All tables have RLS enabled. Users can only:
- ✅ View their own data
- ✅ Insert their own data
- ✅ Update their own data
- ✅ Delete their own data
- ❌ Access other users' data

---

## 🔐 Authentication

### Sign-In Methods

**1. Google OAuth** (Recommended)
- One-click sign-in
- No password needed
- Secure and fast

**2. Magic Link (Email)**
- Passwordless authentication
- Email-based login
- Good for users without Google

### Implementation

```typescript
import { supabase } from '@/lib/supabase'

// Sign in with Google
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
})

// Sign in with Email
await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

### Auth Button Component

Use the `<AuthButton />` component anywhere in your app:

```tsx
import AuthButton from '@/components/AuthButton'

export default function MyPage() {
  return (
    <div>
      <AuthButton />
    </div>
  )
}
```

---

## 📁 File Storage

### Upload Files

```typescript
import { supabase } from '@/lib/supabase'

async function uploadPDF(file: File) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Upload to storage
  const filePath = `${user.id}/${Date.now()}_${file.name}`
  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(filePath, file)

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('pdfs')
    .getPublicUrl(filePath)

  // Save metadata to database
  await supabase.from('uploaded_files').insert({
    user_id: user.id,
    filename: file.name,
    file_type: 'pdf',
    file_url: publicUrl,
    file_size: file.size
  })

  return publicUrl
}
```

### Download Files

```typescript
async function downloadFile(filePath: string) {
  const { data, error } = await supabase.storage
    .from('pdfs')
    .download(filePath)

  if (error) throw error
  return data
}
```

### Delete Files

```typescript
async function deleteFile(filePath: string, fileId: string) {
  // Delete from storage
  await supabase.storage.from('pdfs').remove([filePath])

  // Delete metadata from database
  await supabase.from('uploaded_files').delete().eq('id', fileId)
}
```

---

## 💡 Usage Examples

### Example 1: Save Roadmap Progress

```typescript
import { supabase } from '@/lib/supabase'

async function saveProgress(stepId: string, completed: boolean, stars: number) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('roadmap_progress')
    .upsert({
      user_id: user.id,
      step_id: stepId,
      completed,
      stars,
      updated_at: new Date().toISOString()
    })

  if (error) console.error('Failed to save progress:', error)
}
```

### Example 2: Load Roadmap Progress

```typescript
async function loadProgress() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  const { data, error } = await supabase
    .from('roadmap_progress')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to load progress:', error)
    return {}
  }

  // Convert array to object keyed by step_id
  const progressMap = {}
  data.forEach(item => {
    progressMap[item.step_id] = {
      completed: item.completed,
      stars: item.stars,
      articlesRead: item.articles_read
    }
  })

  return progressMap
}
```

### Example 3: Save Chat History

```typescript
async function saveChatMessage(articleTitle: string, message: string, role: 'user' | 'agent') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('chat_history').insert({
    user_id: user.id,
    article_title: articleTitle,
    message,
    role,
    created_at: new Date().toISOString()
  })
}
```

### Example 4: Real-time Updates (Optional)

```typescript
useEffect(() => {
  const channel = supabase
    .channel('roadmap_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'roadmap_progress'
      },
      (payload) => {
        console.log('Progress updated!', payload)
        // Update local state
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

---

## 🔄 Migration Guide

### From localStorage to Supabase

**Before (localStorage):**
```typescript
// Save
localStorage.setItem('finance-roadmap-progress', JSON.stringify(progress))

// Load
const saved = localStorage.getItem('finance-roadmap-progress')
const progress = saved ? JSON.parse(saved) : {}
```

**After (Supabase):**
```typescript
import { supabase } from '@/lib/supabase'

// Save
async function saveProgress(progress) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  for (const [stepId, data] of Object.entries(progress)) {
    await supabase.from('roadmap_progress').upsert({
      user_id: user.id,
      step_id: stepId,
      ...data
    })
  }
}

// Load
async function loadProgress() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  const { data } = await supabase
    .from('roadmap_progress')
    .select('*')
    .eq('user_id', user.id)

  return data.reduce((acc, item) => {
    acc[item.step_id] = item
    return acc
  }, {})
}
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "Failed to fetch" error**
- Check `.env.local` has correct Supabase URL
- Verify URL starts with `https://`
- Restart dev server after adding env vars

**2. "Invalid API key" error**
- Verify anon key is correct
- Check for extra spaces or quotes
- Regenerate key if needed

**3. "Row Level Security policy violation"**
- Ensure user is authenticated
- Check RLS policies in Supabase dashboard
- Verify `user_id` matches `auth.uid()`

**4. "Storage bucket not found"**
- Create buckets in Supabase dashboard
- Verify bucket names match code
- Check bucket permissions

**5. Auth redirect not working**
- Add callback URL to auth config
- Check OAuth provider settings
- Verify redirect URI format

### Debug Mode

Enable debug logging:

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(url, key, {
  auth: {
    debug: true,  // Enable auth debugging
  },
})
```

---

## 📊 Performance Tips

1. **Use indexes** - Already created in schema
2. **Batch operations** - Use `.insert()` with arrays
3. **Cache queries** - Use React Query or SWR
4. **Optimize RLS** - Keep policies simple
5. **Compress files** - Before uploading to storage

---

## 🔒 Security Best Practices

1. **Never expose service_role key** - Only use anon key in frontend
2. **Always use RLS** - Enabled on all tables
3. **Validate file uploads** - Check size and type
4. **Sanitize user input** - Before database queries
5. **Use HTTPS** - Always in production

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🎉 Next Steps

1. ✅ Set up authentication
2. ✅ Migrate roadmap progress
3. ⬜ Add chat history persistence
4. ⬜ Implement file uploads
5. ⬜ Enable real-time features

Happy coding! 🚀

