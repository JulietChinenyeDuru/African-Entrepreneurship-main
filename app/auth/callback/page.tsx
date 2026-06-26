'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

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
  }, [router])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      <p>Signing you in, please wait...</p>
      <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>This may take a few seconds...</p>
    </div>
  )
}
