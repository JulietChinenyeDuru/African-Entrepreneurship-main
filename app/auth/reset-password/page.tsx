'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Lock, AlertCircle, Loader, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const s = {
    label: { fontSize: 13, fontWeight: 500, color: '#3A3A36', marginBottom: 6, display: 'block' } as React.CSSProperties,
    input: { width: '100%', padding: '11px 12px 11px 40px', border: '1px solid #E2E0D8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' as const, outline: 'none' },
    btn: { width: '100%', padding: 13, background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Link href="/" style={{ fontSize: 22, fontWeight: 600, color: '#1A1A1A', textDecoration: 'none', marginBottom: 24 }}>
        Apply<span style={{ color: '#1D9E75' }}>AI</span>
      </Link>
      <div style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 420, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={48} color="#1D9E75" style={{ marginBottom: 16 }}/>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px' }}>Password updated!</h2>
            <p style={{ fontSize: 14, color: '#5F5E5A' }}>Redirecting you to the dashboard...</p>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 6px' }}>Set new password</h1>
            <p style={{ fontSize: 14, color: '#5F5E5A', margin: '0 0 24px' }}>Choose a strong password for your account.</p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>New password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888780' }}/>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} style={s.input}/>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={s.label}>Confirm password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888780' }}/>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your password" required minLength={8} style={s.input}/>
                </div>
              </div>
              {error && <div style={{ display: 'flex', gap: 8, background: '#fff5f5', border: '1px solid #F09595', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}><AlertCircle size={14} color="#A32D2D"/><span style={{ fontSize: 13, color: '#A32D2D' }}>{error}</span></div>}
              <button type="submit" disabled={loading} style={s.btn}>
                {loading && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }}/>}
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
