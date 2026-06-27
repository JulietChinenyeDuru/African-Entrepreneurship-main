'use client'
import { useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthCallback() {
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check for errors in URL params
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    if (error) {
      window.location.replace('/auth?error=' + error)
      return
    }

    let redirected = false
    const redirect = (path: string) => {
      if (!redirected) {
        redirected = true
        window.location.replace(path)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        redirect('/dashboard')
        return
      }

      supabase.auth.onAuthStateChange((event, session) => {
        if (session) redirect('/dashboard')
      })

      setTimeout(() => redirect('/auth'), 15000)
    })
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      <p>Signing you in, please wait...</p>
      <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>This may take a few seconds...</p>
    </div>
  )
}
