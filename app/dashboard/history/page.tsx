'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { FileText, Mail, MessageSquare, ChevronDown, ChevronUp, Calendar, MapPin, DollarSign } from 'lucide-react'

export default function HistoryPage() {
  const supabase = createClient()
  const router = useRouter()
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'cv' | 'cover' | 'interview'>('cv')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      const { data } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(50)
      setApps(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const toggle = (id: string) => {
    setExpanded(expanded === id ? null : id)
    setActiveTab('cv')
  }

  const cardStyle: any = {
    background: '#FFFFFF',
    border: '1px solid #BFDBFE',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
  }

  const tabBtn = (active: boolean) => ({
    padding: '8px 18px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 13,
    background: active ? '#1E40AF' : '#EFF6FF',
    color: active ? '#FFFFFF' : '#1E40AF',
  })

  const preStyle: any = {
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 1.7,
    margin: 0,
    padding: '16px',
    background: '#F8FAFC',
    borderRadius: 8,
    maxHeight: 400,
    overflowY: 'auto'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EFF6FF', padding: '40px 5vw', fontFamily: '"DM Sans", sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0F172A', margin: 0 }}>Application History</h1>
            <p style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>All your saved tailored CVs, cover letters and interview prep</p>
          </div>
          <button onClick={() => router.push('/dashboard')} style={{ background: '#1E40AF', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 500, fontSize: 14 }}>
            ← Back to Dashboard
          </button>
        </div>

        {loading && <p style={{ color: '#6B7280', textAlign: 'center' }}>Loading your applications...</p>}
        {!loading && apps.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, border: '1px solid #BFDBFE' }}>
            <p style={{ color: '#6B7280', fontSize: 16 }}>No applications yet. Run your first application from the dashboard!</p>
            <button onClick={() => router.push('/dashboard')} style={{ marginTop: 16, background: '#1E40AF', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 500 }}>Go to Dashboard</button>
          </div>
        )}

        {apps.map(app => (
          <div key={app.id} style={cardStyle}>
            {/* Header */}
            <div onClick={() => toggle(app.id)} style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, color: '#0F172A' }}>{app.job_title || 'Untitled Role'}</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {app.company && <span>🏢 {app.company}</span>}
                  {app.location && <span>📍 {app.location}</span>}
                  {app.salary && <span>💰 {app.salary}</span>}
                  {app.submitted_at && <span>📅 {new Date(app.submitted_at).toLocaleDateString()}</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  {app.tailored_cv && <span style={{ fontSize: 11, background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: 20 }}>CV ✓</span>}
                  {app.cover_letter && <span style={{ fontSize: 11, background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: 20 }}>Cover Letter ✓</span>}
                  {app.interview_prep && <span style={{ fontSize: 11, background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 20 }}>Interview Prep ✓</span>}
                </div>
              </div>
              {expanded === app.id ? <ChevronUp size={20} color="#6B7280" /> : <ChevronDown size={20} color="#6B7280" />}
            </div>

            {/* Expanded content */}
            {expanded === app.id && (
              <div style={{ borderTop: '1px solid #BFDBFE', padding: '20px' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <button style={tabBtn(activeTab === 'cv')} onClick={() => setActiveTab('cv')}>
                    <FileText size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />Tailored CV
                  </button>
                  <button style={tabBtn(activeTab === 'cover')} onClick={() => setActiveTab('cover')}>
                    <Mail size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />Cover Letter
                  </button>
                  <button style={tabBtn(activeTab === 'interview')} onClick={() => setActiveTab('interview')}>
                    <MessageSquare size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />Interview Prep
                  </button>
                </div>

                {/* Content */}
                {activeTab === 'cv' && (
                  <pre style={preStyle}>{app.tailored_cv || 'No tailored CV saved for this application.'}</pre>
                )}
                {activeTab === 'cover' && (
                  <pre style={preStyle}>{app.cover_letter || 'No cover letter saved for this application.'}</pre>
                )}
                {activeTab === 'interview' && (
                  <div style={preStyle}>
                    {app.interview_prep ? (
                      <>
                        {app.interview_prep.likelyQuestions?.length > 0 && (
                          <>
                            <strong>Likely Questions:</strong>
                            {app.interview_prep.likelyQuestions.map((q: string, i: number) => (
                              <div key={i} style={{ marginTop: 6 }}>• {q}</div>
                            ))}
                          </>
                        )}
                        {app.interview_prep.talkingPoints?.length > 0 && (
                          <>
                            <strong style={{ display: 'block', marginTop: 16 }}>Talking Points:</strong>
                            {app.interview_prep.talkingPoints.map((t: string, i: number) => (
                              <div key={i} style={{ marginTop: 6 }}>• {t}</div>
                            ))}
                          </>
                        )}
                        {app.interview_prep.questionsToAsk?.length > 0 && (
                          <>
                            <strong style={{ display: 'block', marginTop: 16 }}>Questions to Ask:</strong>
                            {app.interview_prep.questionsToAsk.map((q: string, i: number) => (
                              <div key={i} style={{ marginTop: 6 }}>• {q}</div>
                            ))}
                          </>
                        )}
                      </>
                    ) : 'No interview prep saved for this application.'}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
