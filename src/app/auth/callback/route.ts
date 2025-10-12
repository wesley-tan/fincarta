import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Log incoming request for debugging
  console.log('Auth callback received:', {
    code: code ? 'present' : 'missing',
    error,
    errorDescription,
    next,
    origin: requestUrl.origin
  })

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=${encodeURIComponent(errorDescription || error)}`)
  }

  // Exchange code for session
  if (code) {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=${encodeURIComponent('Failed to complete sign in')}`)
    }

    if (data?.session) {
      console.log('Session created successfully for user:', data.user?.email)
      // Force a clean redirect
      const redirectUrl = `${requestUrl.origin}${next}`
      return NextResponse.redirect(redirectUrl)
    }
  }

  // No code or session - redirect to signin
  console.log('No code present, redirecting to signin')
  return NextResponse.redirect(`${requestUrl.origin}/auth/signin`)
}

