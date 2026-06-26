'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (session) {
        router.push('/dashboard')
        return
      }

      // Wait for auth state change
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          subscription.unsubscribe()
          router.push('/dashboard')
        }
      })

      // Timeout fallback
      setTimeout(() => {
        subscription.unsubscribe()
        router.push('/auth')
      }, 5000)
    }

    handleCallback()
  }, [router])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p>Signing you in...</p>
    </div>
  )
}
