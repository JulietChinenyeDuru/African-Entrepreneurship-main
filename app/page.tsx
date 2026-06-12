'use client'
import Link from 'next/link'
import { CheckCircle, Zap, Bell, Search, FileText, ArrowRight, Star, Mail } from 'lucide-react'

const FEATURES = [
  { icon: FileText, title: 'Smart CV analysis', desc: 'AI reads your CV, extracts your skills, scores ATS readiness, and tells you exactly what to improve.' },
  { icon: Search, title: 'Job matching agent', desc: 'Finds roles that genuinely match your profile across Reed, Careerjet, and more — ranked by fit.' },
  { icon: Zap, title: 'Per-role CV tailoring', desc: 'Rewrites your CV for each specific job — mirroring the employer\'s language to pass ATS filters.' },
  { icon: Mail, title: 'Auto-apply via email', desc: 'Sends your application from YOUR email address — recruiter sees a real human email, not a bulk tool.' },
  { icon: Bell, title: 'Real-time tracking', desc: 'Get notified the moment a recruiter opens your CV, replies, or schedules an interview.' },
]

const PLANS = [
  {
    name: 'Free', price: '£0', period: 'forever',
    features: ['5 applications per month', 'CV tailoring per role', 'ATS keyword analysis', 'Application tracker'],
    cta: 'Get started free', href: '/auth', highlight: false,
  },
  {
    name: 'Pro', price: '£12.99', period: 'per month',
    features: ['100 applications per month', 'CV tailoring per role', 'Cover letter generation', 'ATS keyword analysis', 'Auto-apply via your email', 'Email + SMS notifications', 'Interview prep tips'],
    cta: 'Start Pro — £12.99/mo', href: '/auth?plan=pro', highlight: true,
  },
  {
    name: 'Global', price: '£4.99', period: 'per month',
    features: ['30 applications per month', 'CV tailoring per role', 'Cover letter generation', 'ATS keyword analysis', 'Auto-apply via your email'],
    cta: 'Start Global — £4.99/mo', href: '/auth?plan=africa', highlight: false,
    note: 'For African job seekers',
  },
]

export default function HomePage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F8F7F4', color: '#0F172A', minHeight: '100vh' }}>
      {/* NAV */}
      <nav style={{ background: '#0F172A', padding: '0 5vw', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="6" width="26" height="34" rx="4" fill="#085041" stroke="#1D9E75" strokeWidth="1.5"/>
            <line x1="14" y1="16" x2="28" y2="16" stroke="#5DCAA5" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="14" y1="22" x2="24" y2="22" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="14" y1="28" x2="26" y2="28" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="35" cy="33" r="10" fill="#1D9E75"/>
            <path d="M35 38V28M31 32l4-4 4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span style={{ color: '#fff', fontWeight: 500, fontSize: 17 }}>Apply<span style={{ color: '#1D9E75' }}>AI</span></span>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <a href="#features" style={{ color: '#94A3B8', fontSize: 13, textDecoration: 'none' }}>Features</a>
          <a href="#pricing" style={{ color: '#94A3B8', fontSize: 13, textDecoration: 'none' }}>Pricing</a>
          <Link href="/auth" style={{ background: '#1D9E75', color: '#fff', padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '80px 5vw 60px', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#E1F5EE', color: '#085041', fontSize: 12, fontWeight: 500, padding: '4px 14px', borderRadius: 20, marginBottom: 20, letterSpacing: '0.06em' }}>
          AI-POWERED JOB AGENT
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 500, lineHeight: 1.1, margin: '0 0 20px', letterSpacing: -1.5 }}>
          Upload your CV.<br/><span style={{ color: '#1D9E75' }}>Land your next role.</span>
        </h1>
        <p style={{ fontSize: 17, color: '#5F5E5A', margin: '0 auto 36px', lineHeight: 1.7, maxWidth: 540 }}>
          ApplyAI tailors your CV for every job, sends applications from your own email, and notifies you when recruiters respond.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth" style={{ background: '#1D9E75', color: '#fff', padding: '14px 32px', borderRadius: 10, fontSize: 15, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Get started free <ArrowRight size={16}/>
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
          {[['94%','ATS pass rate'],['3.2×','more interviews'],['Free','to start']].map(([n,l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 500 }}>{n}</div>
              <div style={{ fontSize: 13, color: '#888780', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '60px 5vw', background: '#fff' }} id="features">
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 500, marginBottom: 48, letterSpacing: -0.5 }}>Five steps. Zero manual effort.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ padding: 20, background: '#F8F7F4', borderRadius: 12, border: '1px solid #E2E0D8' }}>
                <div style={{ width: 36, height: 36, background: '#E1F5EE', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <f.icon size={18} color="#1D9E75"/>
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 500, margin: '0 0 6px' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#5F5E5A', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '80px 5vw' }} id="pricing">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 500, marginBottom: 48 }}>Start free. Upgrade when ready.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
            {PLANS.map(plan => (
              <div key={plan.name} style={{ background: '#fff', borderRadius: 14, border: plan.highlight ? '2px solid #1D9E75' : '1px solid #E2E0D8', padding: '28px', position: 'relative' }}>
                {plan.highlight && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#1D9E75', color: '#fff', fontSize: 11, fontWeight: 500, padding: '3px 14px', borderRadius: 10, whiteSpace: 'nowrap' }}>Most popular</div>}
                {plan.note && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#534AB7', color: '#fff', fontSize: 11, fontWeight: 500, padding: '3px 14px', borderRadius: 10, whiteSpace: 'nowrap' }}>{plan.note}</div>}
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: -1 }}>{plan.price}</div>
                <div style={{ fontSize: 12, color: '#888780', marginBottom: 20 }}>{plan.period}</div>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <CheckCircle size={14} color="#1D9E75" style={{ flexShrink: 0 }}/>
                    <span style={{ fontSize: 13, color: '#444441' }}>{f}</span>
                  </div>
                ))}
                <Link href={plan.href} style={{ display: 'block', marginTop: 20, padding: '12px', textAlign: 'center', background: plan.highlight ? '#1D9E75' : 'transparent', color: plan.highlight ? '#fff' : '#0F172A', border: plan.highlight ? 'none' : '1px solid #E2E0D8', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0F172A', padding: '20px 5vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ color: '#334155', fontSize: 13 }}>© 2025 ApplyAI · jobapp.best</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="/privacy" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none' }}>Terms</a>
        </div>
      </footer>
    </div>
  )
}
