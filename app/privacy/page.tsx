import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — ApplyAI' }

export default function PrivacyPage() {
  const s: Record<string, any> = {
    page: { fontFamily: "'DM Sans', sans-serif", background: '#FBFBF9', minHeight: '100vh' },
    nav: { background: '#0F172A', padding: '0 5vw', height: 56, display: 'flex', alignItems: 'center' },
    wrap: { maxWidth: 700, margin: '0 auto', padding: '48px 20px' },
    h1: { fontSize: 28, fontWeight: 500, marginBottom: 8, letterSpacing: -0.5 },
    updated: { fontSize: 13, color: '#888780', marginBottom: 32 },
    h2: { fontSize: 17, fontWeight: 500, marginTop: 32, marginBottom: 10 },
    p: { fontSize: 14, color: '#444441', lineHeight: 1.7, marginBottom: 12 },
    ul: { fontSize: 14, color: '#444441', lineHeight: 1.7, paddingLeft: 20, marginBottom: 12 },
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Link href="/" style={{ color: '#fff', fontWeight: 500, fontSize: 16, textDecoration: 'none' }}>
          Apply<span style={{ color: '#1D9E75' }}>AI</span>
        </Link>
      </nav>
      <div style={s.wrap}>
        <h1 style={s.h1}>Privacy Policy</h1>
        <p style={s.updated}>Last updated: June 2026</p>

        <p style={s.p}>
          ApplyAI ("we", "us", "our") provides an AI-powered job application
          assistant at jobapp.best. This policy explains what information we
          collect, how we use it, and how we protect it.
        </p>

        <h2 style={s.h2}>1. Information we collect</h2>
        <ul style={s.ul}>
          <li>Account details: name, email address, and authentication data (via Supabase)</li>
          <li>Your CV content and career preferences that you submit to the agent</li>
          <li>Job application records: tailored CVs, cover letters, and the jobs you apply to</li>
          <li>Payment information processed by Stripe (we never see or store your card details)</li>
          <li>If you enable auto-apply: your email address and an app-specific password, stored encrypted</li>
        </ul>

        <h2 style={s.h2}>2. How we use your information</h2>
        <ul style={s.ul}>
          <li>To run the AI agent that analyses your CV, finds jobs, and tailors applications</li>
          <li>To send job applications on your behalf, from your own email address, only when you explicitly trigger it</li>
          <li>To track your applications and notify you of submissions</li>
          <li>To manage your subscription and billing via Stripe</li>
          <li>To improve ApplyAI's matching and tailoring quality</li>
        </ul>

        <h2 style={s.h2}>3. Third-party processors</h2>
        <p style={s.p}>
          We share data with the following processors strictly to provide the
          service:
        </p>
        <ul style={s.ul}>
          <li><strong>Anthropic (Claude API)</strong> — processes your CV and job data to generate tailored content. Data sent to Claude is not used to train Anthropic's models.</li>
          <li><strong>Supabase</strong> — hosts our database and handles authentication</li>
          <li><strong>Stripe</strong> — processes payments and subscriptions</li>
          <li><strong>Reed, Adzuna, Jooble</strong> — job search APIs used to find live vacancies; we send only search keywords and location, never your personal data</li>
          <li><strong>Your email provider</strong> (Gmail, Outlook, Yahoo) — used only if you enable auto-apply, via an app-specific password you control and can revoke at any time</li>
        </ul>

        <h2 style={s.h2}>4. How we protect your data</h2>
        <ul style={s.ul}>
          <li>Email app passwords are encrypted before storage and decrypted only at the moment an email is sent</li>
          <li>All data is protected by row-level security — you can only access your own records</li>
          <li>All traffic to jobapp.best is encrypted via HTTPS</li>
          <li>We never sell your data to advertisers or third parties</li>
        </ul>

        <h2 style={s.h2}>5. Your rights</h2>
        <p style={s.p}>
          You can access, update, or delete your account data at any time from
          your account settings. To fully delete your account and all
          associated data, email us at the address below. If you are in the
          UK or EU, you have rights under UK GDPR / GDPR including access,
          rectification, erasure, and data portability.
        </p>

        <h2 style={s.h2}>6. Data retention</h2>
        <p style={s.p}>
          We retain your account data for as long as your account is active.
          If you delete your account, your CV data, application history, and
          email credentials are permanently deleted within 30 days.
        </p>

        <h2 style={s.h2}>7. Children</h2>
        <p style={s.p}>
          ApplyAI is intended for users aged 16 and over. We do not knowingly
          collect data from anyone under 16.
        </p>

        <h2 style={s.h2}>8. Changes to this policy</h2>
        <p style={s.p}>
          We may update this policy from time to time. Material changes will
          be notified via email or an in-app notice.
        </p>

        <h2 style={s.h2}>9. Contact</h2>
        <p style={s.p}>
          Questions about this policy or your data? Email us at{' '}
          <a href="mailto:support@jobapp.best" style={{ color: '#1D9E75' }}>support@jobapp.best</a>.
        </p>
      </div>
    </div>
  )
}
