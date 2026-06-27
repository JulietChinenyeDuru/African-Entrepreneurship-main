'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Mail, Lock, User, AlertCircle, Loader, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin'|'signup'|'forgot'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/dashboard` },
        })
        if (error) throw error
        setSuccess('Check your email to confirm your account, then sign in.')
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        })
        if (error) throw error
        setSuccess('Password reset link sent! Check your email.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        const planQ = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('plan') : null
          router.push(planQ === 'africa' ? '/dashboard?plan=global' : '/dashboard')
          router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    Object.keys(localStorage).forEach(k => { if (k.includes('supabase')) localStorage.removeItem(k) })
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://jobapp.best/auth/callback' },
    })
  }

  const s = {
    label: { fontSize: 13, fontWeight: 500, color: '#3A3A36', marginBottom: 6, display: 'block' } as React.CSSProperties,
    input: { width: '100%', padding: '11px 12px 11px 40px', border: '1px solid #BFDBFE', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' as const, outline: 'none' },
    btn: { width: '100%', padding: 13, background: '#1E40AF', color: '#0F172A', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EFF6FF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Link href="/" style={{ fontSize: 22, fontWeight: 600, color: '#1A1A1A', textDecoration: 'none', marginBottom: 24 }}>
        Apply<span style={{ color: '#1E40AF' }}>AI</span>
      </Link>
      <div style={{ background: '#EFF6FF', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 420, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>

        {mode === 'forgot' ? (
          <>
            <button onClick={() => { setMode('signin'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 20, padding: 0, fontFamily: 'inherit' }}>
              <ArrowLeft size={14} /> Back to sign in
            </button>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 6px' }}>Reset password</h1>
            <p style={{ fontSize: 14, color: '#475569', margin: '0 0 24px' }}>Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={s.label}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}/>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required style={s.input}/>
                </div>
              </div>
              {error && <div style={{ display: 'flex', gap: 8, background: '#fff5f5', border: '1px solid #F09595', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}><AlertCircle size={14} color="#A32D2D"/><span style={{ fontSize: 13, color: '#A32D2D' }}>{error}</span></div>}
              {success && <div style={{ background: '#DBEAFE', border: '1px solid #93C5FD', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}><span style={{ fontSize: 13, color: '#1E3A8A' }}>{success}</span></div>}
              <button type="submit" disabled={loading} style={s.btn}>
                {loading && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }}/>}
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 6px' }}>{mode === 'signin' ? 'Welcome back' : 'Create account'}</h1>
          {mode === 'signup' && <p style={{ fontSize: 13, color: '#e67e22', background: '#fef9f0', border: '1px solid #f5cba7', borderRadius: 8, padding: '8px 12px', margin: '0 0 12px' }}>📱 Mobile users: please sign up with email below. Google login works best on desktop.</p>}
            <p style={{ fontSize: 14, color: '#475569', margin: '0 0 24px' }}>{mode === 'signin' ? 'Sign in to your ApplyAI account' : 'Start landing more interviews'}</p>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            </div>
            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>Full name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}/>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" required style={s.input}/>
                  </div>
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}/>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required style={s.input}/>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={s.label}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}/>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} style={s.input}/>
                </div>
              </div>
              {mode === 'signin' && (
                <div style={{ textAlign: 'right', marginBottom: 16 }}>
                  <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1E40AF', fontSize: 13, fontFamily: 'inherit', padding: 0 }}>
                    Forgot password?
                  </button>
                </div>
              )}
              {error && <div style={{ display: 'flex', gap: 8, background: '#fff5f5', border: '1px solid #F09595', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}><AlertCircle size={14} color="#A32D2D"/><span style={{ fontSize: 13, color: '#A32D2D' }}>{error}</span></div>}
              {success && <div style={{ background: '#DBEAFE', border: '1px solid #93C5FD', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}><span style={{ fontSize: 13, color: '#1E3A8A' }}>{success}</span></div>}
              <button type="submit" disabled={loading} style={s.btn}>
                {loading && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }}/>}
                {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>
            <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 20 }}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess('') }} style={{ color: '#1E40AF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 13, fontFamily: 'inherit' }}>
                {mode === 'signin' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
