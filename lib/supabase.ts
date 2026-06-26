// lib/supabase.ts
// Browser-only Supabase client – safe to import in 'use client' components.
// For server-side (API routes), use lib/supabase-server.ts instead.

import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON, {
    cookieOptions: {
      name: 'sb',
      lifetime: 60 * 60 * 8,
      domain: 'jobapp.best',
      sameSite: 'lax',
      secure: true,
    },
  })
}
