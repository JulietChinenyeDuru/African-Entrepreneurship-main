# ApplyAI — jobapp.best

AI-powered job application agent. Finds jobs, tailors your CV, sends
applications from YOUR email address, and tracks everything.

## Live: https://jobapp.best

---

## Quick start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
# Fill in all values
```

### 3. Set up Supabase
- Create project at supabase.com
- SQL Editor → paste supabase-schema.sql → Run
- Authentication → Providers → enable Email + Google

### 4. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

### 5. Deploy to Vercel
```bash
npx vercel
# Add all env vars in Vercel dashboard
# Add custom domain: jobapp.best
```

---

## Claude model usage (cost-optimised)

| Task | Model | Cost |
|------|-------|------|
| Profile analysis | Sonnet 4.6 | ~£0.008/run |
| Job matching | Haiku 4.5 | ~£0.002/run |
| CV tailoring | Haiku 4.5 | ~£0.005/run |
| Cover letter | Haiku 4.5 | ~£0.002/run |
| ATS keywords | Haiku 4.5 | ~£0.002/run |
| **Total per run** | **Mixed** | **~£0.019–0.025** |

---

## Pricing tiers
- Free: 5 apps/month
- Pro: £12.99/month — 100 apps/month
- Global (Africa): £4.99/month — 30 apps/month

## Auto-apply feature
Uses user's own email (Gmail/Outlook/Yahoo) via app password.
Sends tailored CV + cover letter as PDF to recruiter email.
User receives a copy in their inbox.

## SDG alignment
- SDG 8: Decent work and economic growth
- SDG 10: Reduced inequalities

Built by Juliet Duru — DevOps/Cloud & Agentic AI Engineer
GitHub: JulietChinenyeDuru | ORCID: 0009-0002-0530-8082
