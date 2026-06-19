'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  FileText, Search, Zap, Bell, Copy, CheckCircle,
  LogOut, Crown, Loader, ChevronDown, ChevronUp,
  BarChart2, Briefcase, AlertCircle, ArrowRight,
  Mail, Settings, Send, Eye, EyeOff, Lock, MessageSquare, Star
} from 'lucide-react'

type Step = 'idle' | 'profile' | 'jobs' | 'tailor' | 'done' | 'error'
type Tab = 'run' | 'applications' | 'account' | 'reviews'

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [tab, setTab] = useState<Tab>('run')
  // Form state
  const [cv, setCv] = useState('')
  const [role, setRole] = useState('')
  const [location, setLocation] = useState('Scotland, UK')
  const [salary, setSalary] = useState('')
  const [level, setLevel] = useState('')
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [reviewStatus, setReviewStatus] = useState('')
  // Agent state
  const [step, setStep] = useState<Step>('idle')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string|null>(null)
  const [expandedSection, setExpandedSection] = useState<string|null>('cv')
  // Email settings
  const [emailProvider, setEmailProvider] = useState('gmail')
  const [emailAddress, setEmailAddress] = useState('')
  const [appPassword, setAppPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailTesting, setEmailTesting] = useState(false)
  const [emailStatus, setEmailStatus] = useState<string|null>(null)
  // Submitting
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<any>(null)

  useEffect(() => {
    async function load() {
      await new Promise(resolve => setTimeout(resolve, 500))
      const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
      if (!user) { router.push('/auth'); return }
      setUser(user)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      if (p?.email_address) setEmailAddress(p.email_address)
      if (p?.email_provider) setEmailProvider(p.email_provider)
      const { data: apps } = await supabase.from('applications').select('*').eq('user_id', user.id).order('submitted_at', { ascending: false }).limit(20)
      setApplications(apps || [])
    }
    load()
  }, [])

  const freeRemaining = profile ? Math.max(0, 5 - (profile.applications_used_month || 0)) : 5

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadStatus("Uploading...")
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/parse-cv", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        setUploadStatus("")
        setError(data.error || "Failed to parse file")
        return
      }

      setCv(data.text)
      setUploadStatus("CV uploaded: " + file.name)
    } catch (err: any) {
      setUploadStatus("")
      setError("Upload failed: " + err.message)
    }
  }

  const runAgent = async () => {
    if (!cv.trim()) { setError('Please paste your CV first.'); return }
    if (!role.trim()) { setError('Please enter a target role.'); return }
    setError(''); setResult(null); setSubmitResult(null)
    setStep('profile')
    const t1 = setTimeout(() => setStep('jobs'), 3000)
    const t2 = setTimeout(() => setStep('tailor'), 6500)
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, role, location, salary, level }),
      })
      clearTimeout(t1); clearTimeout(t2)
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'monthly_limit_reached') { setStep('error'); setError('limit'); return }
        throw new Error(data.message || data.error)
      }
      setStep('done'); setResult(data)
      const { data: apps } = await supabase.from('applications').select('*').eq('user_id', user.id).order('submitted_at', { ascending: false }).limit(20)
      setApplications(apps || [])
      setProfile((p: any) => p ? { ...p, applications_used_month: (p.applications_used_month || 0) + 1 } : p)
    } catch (err: any) {
      clearTimeout(t1); clearTimeout(t2)
      setStep('error'); setError(err.message)
    }
  }

  const submitViaEmail = async () => {
    if (!result?.applicationId) return
    if (!profile?.email_address) { setTab('account'); setEmailStatus('Please set up your email first.'); return }
    setSubmitting(true); setSubmitResult(null)
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: result.applicationId }),
      })
      const data = await res.json()
      setSubmitResult(data)
    } catch (err: any) {
      setSubmitResult({ success: false, message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const saveEmailSettings = async () => {
    if (!emailAddress || !appPassword) { setEmailStatus('Please fill in all fields.'); return }
    setEmailSaving(true)
    const res = await fetch('/api/email-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailProvider, emailAddress, appPassword }),
    })
    const data = await res.json()
    if (res.ok) {
      setProfile((p: any) => ({ ...p, email_address: emailAddress, email_provider: emailProvider, auto_apply_enabled: true }))
      setEmailStatus('✅ Email settings saved successfully.')
    } else {
      setEmailStatus(`❌ ${data.error || 'Failed to save settings.'}`)
    }
    setEmailSaving(false)
  }

  const testEmailConnection = async () => {
    if (!emailAddress || !appPassword) { setEmailStatus('Please fill in all fields first.'); return }
    setEmailTesting(true); setEmailStatus('Testing connection...')
    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'test' }),
    })
    const data = await res.json()
    setEmailStatus(data.success ? '✅ Connection successful! Your email is ready.' : `❌ Failed: ${data.error}`)
    setEmailTesting(false)
  }

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const downloadFile = async (title: string, content: string, format: "docx" | "pdf") => {
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, format }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Download failed")
        return
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = title + "." + format
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setError("Download failed: " + err.message)
  }
  }

  const submitReview = async () => {
    if (reviewRating < 1) {
      setReviewStatus("Please select a rating.")
      return
    }
    setReviewStatus("Submitting...")
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      })
      const data = await res.json()
      if (!res.ok) {
        setReviewStatus(data.error || "Failed to submit review")
        return
      }
      setReviewStatus("Thank you for your feedback!")
      setReviewRating(0)
      setReviewComment("")
      setShowCommentBox(false)
    } catch (err: any) {
      setReviewStatus("Failed to submit review: " + err.message)
    }
  }

  const signOut = async () => { await supabase.auth.signOut(); router.push('/') }

  const upgradeNow = async () => {
    let country = 'GB'
    try { const g = await (await fetch('https://ipapi.co/json/')).json(); country = g.country_code } catch {}
    const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ country }) })
    const { url } = await res.json()
    window.location.href = url
  }

  const lbl: any = { fontSize: 16, fontWeight: 500, color: '#5F5E5A', display: 'block', marginBottom: 6 }
  const inp: any = { width: '100%', padding: '10px 12px', border: '1px solid #E2E0D8', borderRadius: 8, fontSize: 18, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#FAFAF8' }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F4', fontFamily: "'DM Sans', sans-serif" }}>
      {/* NAV */}
      <nav style={{ background: '#0F172A', height: 54, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ color: '#fff', fontWeight: 500, fontSize: 20 }}>Apply<span style={{ color: '#1D9E75' }}>AI</span></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {profile?.plan === 'free' && <button onClick={upgradeNow} style={{ background: '#1D9E75', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 7, fontSize: 16, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}><Crown size={12}/>Upgrade Pro</button>}
          {profile?.plan !== 'free' && <span style={{ fontSize: 16, color: '#1D9E75', display: 'flex', alignItems: 'center', gap: 4 }}><Crown size={12}/>{profile?.plan === 'africa' ? 'Global' : 'Pro'}</span>}
          <button onClick={signOut} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, fontSize: 17, fontFamily: 'inherit' }}><LogOut size={13}/>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 20px' }}>
        {/* Usage bar */}
        {profile?.plan === 'free' && (
          <div style={{ background: '#fff', border: '1px solid #E2E0D8', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <BarChart2 size={16} color="#1D9E75" style={{ flexShrink: 0 }}/>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 17, fontWeight: 500 }}>Free plan — {freeRemaining} applications remaining this month</span>
                <span style={{ fontSize: 16, color: '#888780' }}>5 per month</span>
              </div>
              <div style={{ height: 4, background: '#E2E0D8', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: freeRemaining > 2 ? '#1D9E75' : '#BA7517', borderRadius: 2, width: `${((5 - freeRemaining) / 5) * 100}%` }}/>
              </div>
            </div>
            <button onClick={upgradeNow} style={{ fontSize: 16, fontWeight: 500, color: '#1D9E75', background: '#E1F5EE', border: 'none', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>Go Pro</button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E0D8', marginBottom: 24, gap: 4 }}>
          {[{ key: 'run', label: 'Apply now', icon: Zap }, { key: 'applications', label: `Applications (${applications.length})`, icon: Briefcase }, { key: 'account', label: 'Account', icon: Settings }, { key: 'reviews', label: 'Reviews', icon: Star }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as Tab)} style={{ padding: '10px 16px', fontSize: 17, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', color: tab === t.key ? '#1D9E75' : '#888780', borderBottom: `2px solid ${tab === t.key ? '#1D9E75' : 'transparent'}`, marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
              <t.icon size={13}/>{t.label}
            </button>
          ))}
        </div>

        {/* RUN TAB */}
        {tab === 'run' && (
          <div>
            {(step === 'idle' || step === 'error') && (
              <div style={{ background: '#fff', border: '1px solid #E2E0D8', borderRadius: 12, padding: 24, marginBottom: 16 }}>
                <h2 style={{ fontSize: 20, fontWeight: 500, margin: '0 0 20px' }}>Your job application details</h2>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Your CV (paste full text)</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <label htmlFor="cv-upload" style={{ ...inp, display: "inline-block", width: "auto", cursor: "pointer", padding: "6px 12px", fontSize: 15 }}>
                    Upload CV (.docx or .pdf)
                  </label>
                  <input id="cv-upload" type="file" accept=".docx,.pdf" onChange={handleCvUpload} style={{ display: "none" }} />
                  {uploadStatus && <span style={{ fontSize: 14, color: "#1D9E75" }}>{uploadStatus}</span>}
                </div>
                  <textarea value={cv} onChange={e => setCv(e.target.value)} rows={8} placeholder="Paste your full CV — work history, skills, education, achievements..." style={{ ...inp, resize: 'vertical' }}/>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label style={lbl}>Target role</label><input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. DevOps Engineer" style={inp}/></div>
                  <div><label style={lbl}>Location</label><input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Scotland, UK" style={inp}/></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                  <div><label style={lbl}>Salary range (optional)</label><input value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. £45,000–£65,000" style={inp}/></div>
                  <div><label style={lbl}>Experience level (optional)</label><input value={level} onChange={e => setLevel(e.target.value)} placeholder="e.g. Senior" style={inp}/></div>
                </div>
                {error === 'limit' && (
                  <div style={{ background: '#FAEEDA', border: '1px solid #FAC775', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
                    <div style={{ fontWeight: 500, fontSize: 18, color: '#633806', marginBottom: 4 }}>Monthly limit reached</div>
                    <p style={{ fontSize: 17, color: '#854F0B', margin: '0 0 12px' }}>Upgrade to Pro for 100 applications/month.</p>
                    <button onClick={upgradeNow} style={{ background: '#1D9E75', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 7, fontSize: 17, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Upgrade to Pro →</button>
                  </div>
                )}
                {error && error !== 'limit' && <div style={{ display: 'flex', gap: 8, background: '#fff5f5', border: '1px solid #F09595', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}><AlertCircle size={14} color="#A32D2D"/><span style={{ fontSize: 17, color: '#A32D2D' }}>{error}</span></div>}
                <button onClick={runAgent} style={{ background: '#1D9E75', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 9, fontSize: 18, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' }}>
                  <Zap size={14}/>Run ApplyAI agent
                </button>
              </div>
            )}

            {/* Progress */}
            {['profile','jobs','tailor'].includes(step) && (
              <div style={{ background: '#fff', border: '1px solid #E2E0D8', borderRadius: 12, padding: 32, textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, background: '#E1F5EE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Loader size={22} color="#1D9E75" style={{ animation: 'spin 1s linear infinite' }}/>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 500, margin: '0 0 8px' }}>
                  {step === 'profile' ? 'Analysing your CV...' : step === 'jobs' ? 'Finding matching jobs...' : 'Tailoring your CV...'}
                </h3>
                <p style={{ fontSize: 17, color: '#888780', margin: 0 }}>This usually takes under a minute</p>
              </div>
            )}

            {/* Results */}
            {step === 'done' && result && (
              <div>
                {/* Top job */}
                <div style={{ background: '#fff', border: '2px solid #1D9E75', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 16, color: '#1D9E75', fontWeight: 500, marginBottom: 4 }}>BEST MATCH — {result.topJob.matchScore}%</div>
                      <h3 style={{ fontSize: 21, fontWeight: 500, margin: '0 0 4px' }}>{result.topJob.title}</h3>
                      <div style={{ fontSize: 18, color: '#5F5E5A' }}>{result.topJob.company} · {result.topJob.location} · {result.topJob.salary}</div>
                <a href={result.topJob.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 18, color: '#1D9E75', fontWeight: 500, textDecoration: 'underline' }}>View posting →</a>
                    </div>
                    <div style={{ background: '#E1F5EE', color: '#085041', fontWeight: 500, fontSize: 22, padding: '8px 14px', borderRadius: 8 }}>{result.topJob.matchScore}%</div>
                  </div>
                  {result.recruiterEmail && (
                    <div style={{ fontSize: 16, color: '#5F5E5A', marginBottom: 12 }}>
                      📧 Recruiter email found: <strong>{result.recruiterEmail}</strong>
                    </div>
                  )}

                  {/* Auto-apply button */}
                  {profile?.auto_apply_enabled ? (
                    <div>
                      <button onClick={submitViaEmail} disabled={submitting} style={{ background: submitting ? '#9FE1CB' : '#0F172A', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 17, fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'inherit' }}>
                        {submitting ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }}/> : <Send size={13}/>}
                        {submitting ? 'Sending application...' : `Send from ${profile?.email_address}`}
                      </button>
                      {submitResult && (
                        <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: submitResult.success ? '#E1F5EE' : '#fff5f5', border: `1px solid ${submitResult.success ? '#9FE1CB' : '#F09595'}` }}>
                          <span style={{ fontSize: 17, color: submitResult.success ? '#085041' : '#A32D2D' }}>{submitResult.message || submitResult.error}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ background: '#FAEEDA', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Mail size={14} color="#854F0B"/>
                      <span style={{ fontSize: 16, color: '#854F0B', flex: 1 }}>Set up auto-apply to send this from your email automatically</span>
                      <button onClick={() => setTab('account')} style={{ fontSize: 15, color: '#854F0B', background: '#FAEEDA', border: '1px solid #FAC775', padding: '3px 10px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>Set up →</button>
                    </div>
                  )}
                </div>

                {/* Result sections */}
                {[
                  { key: 'cv', title: 'Tailored CV', content: result.tailoredCv },
                  { key: 'cl', title: 'Cover letter', content: result.coverLetter },
                  { key: 'kw', title: 'ATS keywords', content: null },
                  { key: 'changes', title: `Changes made (${result.changesMade?.length || 0})`, content: null },
                  { key: 'interview', title: 'Interview preparation', content: null },
                ].map(s => (
                  <div key={s.key} style={{ background: '#fff', border: '1px solid #E2E0D8', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
                    <button onClick={() => setExpandedSection(expandedSection === s.key ? null : s.key)} style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'inherit' }}>
                      <span style={{ fontSize: 18, fontWeight: 500 }}>{s.title}</span>
                      {expandedSection === s.key ? <ChevronUp size={15} color="#888780"/> : <ChevronDown size={15} color="#888780"/>}
                    </button>
                    {expandedSection === s.key && (
                      <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F1EFE8' }}>
                        {s.content ? (
                          <>
                            <pre style={{ fontSize: 17, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: '12px 0 8px', fontFamily: 'inherit' }}>{s.content}</pre>
                            <button onClick={() => copyText(s.content!, s.key)} style={{ fontSize: 15, color: '#888780', background: '#F8F7F4', border: '1px solid #E2E0D8', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                              {copied === s.key ? <><CheckCircle size={11} color="#1D9E75"/>Copied!</> : <><Copy size={11}/>Copy</>}
                            </button>
                          <button onClick={() => downloadFile(s.title, s.content!, "docx")} style={{ fontSize: 15, color: "#888780", background: "#F8F7F4", border: "1px solid #E2E0D8", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontFamily: "inherit", marginLeft: 6 }}>Download Word</button>
                          <button onClick={() => downloadFile(s.title, s.content!, "pdf")} style={{ fontSize: 15, color: "#888780", background: "#F8F7F4", border: "1px solid #E2E0D8", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontFamily: "inherit", marginLeft: 6 }}>Download PDF</button>
                          </>
                        ) : s.key === 'kw' ? (
                          <div style={{ paddingTop: 10 }}>
                            {result.atsKeywords && Object.entries({ 'Must-have': result.atsKeywords.mustHave, 'Technical': result.atsKeywords.technicalSkills, 'Soft skills': result.atsKeywords.softSkills, 'Already in CV': result.atsKeywords.alreadyInCv }).map(([lbl, words]: any) => words?.length ? (
                              <div key={lbl} style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 15, fontWeight: 500, color: '#888780', marginBottom: 5 }}>{lbl.toUpperCase()}</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                  {words.map((w: string) => <span key={w} style={{ fontSize: 15, padding: '2px 8px', borderRadius: 8, background: lbl === 'Already in CV' ? '#E1F5EE' : '#F1EFE8', color: lbl === 'Already in CV' ? '#085041' : '#444441' }}>{w}</span>)}
                                </div>
                              </div>
                            ) : null)}
                          </div>
                        ) : s.key === 'interview' ? (
                          <div style={{ paddingTop: 10 }}>
                            {profile?.plan === 'free' ? (
                              <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                                <Lock size={22} color="#888780" style={{ marginBottom: 10 }}/>
                                <p style={{ fontSize: 17, color: '#5F5E5A', margin: '0 0 14px', lineHeight: 1.6 }}>
                                  Interview preparation — likely questions, key talking points, and questions to ask — is a Pro feature.
                                </p>
                                <button onClick={upgradeNow} style={{ background: '#1D9E75', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 7, fontSize: 17, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                  <Crown size={13}/>Upgrade to Pro
                                </button>
                              </div>
                            ) : (
                              <>
                                {result.interviewPrep?.likelyQuestions?.length > 0 && (
                                  <div style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: 15, fontWeight: 500, color: '#888780', marginBottom: 8 }}>LIKELY QUESTIONS</div>
                                    {result.interviewPrep.likelyQuestions.map((q: string, i: number) => (
                                      <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 7 }}>
                                        <MessageSquare size={13} color="#1D9E75" style={{ flexShrink: 0, marginTop: 1 }}/>
                                        <span style={{ fontSize: 17 }}>{q}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {result.interviewPrep?.talkingPoints?.length > 0 && (
                                  <div style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: 15, fontWeight: 500, color: '#888780', marginBottom: 8 }}>KEY TALKING POINTS</div>
                                    {result.interviewPrep.talkingPoints.map((p: string, i: number) => (
                                      <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 7 }}>
                                        <CheckCircle size={13} color="#1D9E75" style={{ flexShrink: 0, marginTop: 1 }}/>
                                        <span style={{ fontSize: 17 }}>{p}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {result.interviewPrep?.questionsToAsk?.length > 0 && (
                                  <div>
                                    <div style={{ fontSize: 15, fontWeight: 500, color: '#888780', marginBottom: 8 }}>QUESTIONS TO ASK THEM</div>
                                    {result.interviewPrep.questionsToAsk.map((q: string, i: number) => (
                                      <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 7 }}>
                                        <ArrowRight size={13} color="#1D9E75" style={{ flexShrink: 0, marginTop: 1 }}/>
                                        <span style={{ fontSize: 17 }}>{q}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <div style={{ paddingTop: 10 }}>
                            {result.changesMade?.map((c: string, i: number) => (
                              <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 7 }}>
                                <CheckCircle size={13} color="#1D9E75" style={{ flexShrink: 0, marginTop: 1 }}/>
                                <span style={{ fontSize: 17 }}>{c}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={() => { setStep('idle'); setResult(null); setSubmitResult(null) }} style={{ marginTop: 6, background: 'transparent', border: '1px solid #E2E0D8', padding: '10px 20px', borderRadius: 8, fontSize: 17, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Apply to another role</button>
              </div>
            )}
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {tab === 'applications' && (
          <div>
            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888780' }}>
                <Briefcase size={32} style={{ marginBottom: 12, opacity: 0.4 }}/>
                <p style={{ fontSize: 19 }}>No applications yet.</p>
                <button onClick={() => setTab('run')} style={{ background: '#1D9E75', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 17, fontWeight: 500, cursor: 'pointer', marginTop: 12, fontFamily: 'inherit' }}>Apply now</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {applications.map(app => (
                  <div key={app.id} style={{ background: '#fff', border: '1px solid #E2E0D8', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 18, fontWeight: 500 }}>{app.job_title}</div>
                      <div style={{ fontSize: 16, color: '#888780', marginTop: 2 }}>{app.company} · {app.location} · {new Date(app.submitted_at).toLocaleDateString()}</div>
                      {app.submission_method === 'email' && <div style={{ fontSize: 15, color: '#1D9E75', marginTop: 3 }}>📧 Sent via email</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {app.match_score && <span style={{ fontSize: 17, fontWeight: 500, color: '#1D9E75' }}>{app.match_score}%</span>}
                      <span style={{ fontSize: 14, padding: '3px 10px', borderRadius: 10, fontWeight: 500, background: app.status === 'submitted' ? '#E6F1FB' : app.status === 'interview' ? '#E1F5EE' : '#F1EFE8', color: app.status === 'submitted' ? '#0C447C' : app.status === 'interview' ? '#085041' : '#5F5E5A' }}>{app.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACCOUNT TAB */}
        {tab === 'account' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Plan info */}
            <div style={{ background: '#fff', border: '1px solid #E2E0D8', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 19, fontWeight: 500, margin: '0 0 16px' }}>Account details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ background: '#F8F7F4', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 15, color: '#888780', marginBottom: 3 }}>Email</div>
                  <div style={{ fontSize: 17, fontWeight: 500 }}>{user?.email}</div>
                </div>
                <div style={{ background: '#F8F7F4', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 15, color: '#888780', marginBottom: 3 }}>Plan</div>
                  <div style={{ fontSize: 17, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                    {profile?.plan !== 'free' && <Crown size={13} color="#1D9E75"/>}
                    {profile?.plan === 'pro' ? 'Pro' : profile?.plan === 'africa' ? 'Global' : 'Free'}
                  </div>
                </div>
                <div style={{ background: '#F8F7F4', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 15, color: '#888780', marginBottom: 3 }}>Applications this month</div>
                  <div style={{ fontSize: 17, fontWeight: 500 }}>{profile?.applications_used_month || 0}{profile?.plan === 'free' ? ' / 5' : profile?.plan === 'africa' ? ' / 30' : ' / 100'}</div>
                </div>
              </div>
              {profile?.plan === 'free' && (
                <button onClick={upgradeNow} style={{ background: '#1D9E75', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 17, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
                  <Crown size={13}/>Upgrade to Pro — £12.99/month
                </button>
              )}
            </div>

            {/* Auto-apply email setup */}
            <div style={{ background: '#fff', border: '1px solid #E2E0D8', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 19, fontWeight: 500, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={16} color="#1D9E75"/>Auto-apply email setup
              </h2>
              <p style={{ fontSize: 17, color: '#5F5E5A', margin: '0 0 20px', lineHeight: 1.6 }}>
                ApplyAI sends job applications from YOUR email address. Recruiters see a real human email — not a bulk tool. You receive a copy of every email sent.
              </p>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Email provider</label>
                <select value={emailProvider} onChange={e => setEmailProvider(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook / Hotmail</option>
                  <option value="yahoo">Yahoo Mail</option>
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Your email address</label>
                <input type="email" value={emailAddress} onChange={e => setEmailAddress(e.target.value)} placeholder="your@gmail.com" style={inp}/>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>App password (NOT your regular password)</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={appPassword} onChange={e => setAppPassword(e.target.value)} placeholder="16-character app password" style={{ ...inp, paddingRight: 40 }}/>
                  <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888780', padding: 2 }}>
                    {showPassword ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
              </div>

              {/* How to get app password */}
              <div style={{ background: '#E1F5EE', border: '1px solid #9FE1CB', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#085041', marginBottom: 6 }}>
                  How to get a {emailProvider === 'gmail' ? 'Gmail' : emailProvider === 'outlook' ? 'Outlook' : 'Yahoo'} app password:
                </div>
                {emailProvider === 'gmail' && (
                  <ol style={{ margin: 0, paddingLeft: 16, fontSize: 16, color: '#0F6E56', lineHeight: 1.8 }}>
                    <li>Go to <strong>myaccount.google.com</strong></li>
                    <li>Security → 2-Step Verification (must be enabled)</li>
                    <li>Scroll down → App passwords</li>
                    <li>Select app: <strong>Mail</strong> → Device: <strong>Other</strong> → type "ApplyAI"</li>
                    <li>Copy the 16-character password shown</li>
                  </ol>
                )}
                {emailProvider === 'outlook' && (
                  <ol style={{ margin: 0, paddingLeft: 16, fontSize: 16, color: '#0F6E56', lineHeight: 1.8 }}>
                    <li>Go to <strong>account.microsoft.com</strong></li>
                    <li>Security → Advanced security options</li>
                    <li>App passwords → Create new app password</li>
                    <li>Copy the password shown</li>
                  </ol>
                )}
                {emailProvider === 'yahoo' && (
                  <ol style={{ margin: 0, paddingLeft: 16, fontSize: 16, color: '#0F6E56', lineHeight: 1.8 }}>
                    <li>Go to <strong>login.yahoo.com</strong> → Account Security</li>
                    <li>Generate app password → Other app → type "ApplyAI"</li>
                    <li>Copy the password shown</li>
                  </ol>
                )}
              </div>

              {emailStatus && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: emailStatus.startsWith('✅') ? '#E1F5EE' : emailStatus.startsWith('❌') ? '#fff5f5' : '#F8F7F4', border: `1px solid ${emailStatus.startsWith('✅') ? '#9FE1CB' : emailStatus.startsWith('❌') ? '#F09595' : '#E2E0D8'}`, marginBottom: 14 }}>
                  <span style={{ fontSize: 17 }}>{emailStatus}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={saveEmailSettings} disabled={emailSaving} style={{ background: '#1D9E75', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 17, fontWeight: 500, cursor: emailSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
                  {emailSaving ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }}/> : <CheckCircle size={13}/>}
                  Save email settings
                </button>
                <button onClick={testEmailConnection} disabled={emailTesting} style={{ background: 'transparent', border: '1px solid #E2E0D8', padding: '10px 16px', borderRadius: 8, fontSize: 17, fontWeight: 500, cursor: emailTesting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
                  {emailTesting ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }}/> : <Send size={13}/>}
                  Test connection
                </button>
              </div>
            </div>
          </div>
        )}

          {/* Leave a review */}
        {tab === 'reviews' && (
          <div style={{ background: "#fff", border: "1px solid #E2E0D8", borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 19, fontWeight: 500, margin: "0 0 12px" }}>Leave a review</h2>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setReviewRating(n)} style={{ fontSize: 24, background: "none", border: "none", cursor: "pointer", color: n <= reviewRating ? "#1D9E75" : "#E2E0D8", fontFamily: "inherit", padding: 0 }}>
                  ★
                </button>
              ))}
            </div>
            {!showCommentBox ? (
              <button onClick={() => setShowCommentBox(true)} style={{ fontSize: 14, color: "#1D9E75", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, textDecoration: "underline" }}>
                Add a comment
              </button>
            ) : (
              <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={4} placeholder="Tell us what you think..." style={{ width: "100%", padding: 10, border: "1px solid #E2E0D8", borderRadius: 8, fontFamily: "inherit", fontSize: 15, resize: "vertical", marginBottom: 10 }} />
            )}
            <div style={{ marginTop: 12 }}>
              <button onClick={submitReview} style={{ background: "#1D9E75", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                Submit review
              </button>
              {reviewStatus && <span style={{ marginLeft: 10, fontSize: 14, color: "#5F5E5A" }}>{reviewStatus}</span>}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
