ApplyAI: AI-Powered Job Application Platform

> Live at: [https://www.jobapp.best](https://www.jobapp.best)

ApplyAI is a full-stack SaaS platform that uses Claude AI to tailor CVs and cover letters to every job in seconds, generate interview preparation, and help job seekers land more interviews.

---

Product Overview

Job seekers waste hours manually tailoring CVs for every application. ApplyAI solves this by:
Tailoring CVs to match job descriptions using AI
Generating cover letters customised for each role
Preparing interview questions based on the job and candidate profile
ATS keyword optimisation to pass automated screening systems
Auto-apply via email to recruiters directly from the platform

---

 Impact

- Serving job seekers in the **UK and Africa**
- Special **Global plan at £4.99/month** making AI job tools accessible to African job seekers
- Free plan available for everyone to get started

---

Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript |
| Backend | Next.js API Routes, Node.js |
| AI Engine | Anthropic Claude (Sonnet + Haiku) |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (Google OAuth + Email) |
| Payments | Stripe (subscription billing) |
| Deployment | Vercel |
| Monitoring | Google Analytics, UptimeRobot |

---

Key Features

For Job Seekers
CV Tailoring: Upload CV once, AI rewrites it for every job
Cover Letter Generation: Personalised cover letters in seconds
Interview Preparation Likely questions, talking points, questions to ask
ATS Analysis: Keyword matching and scoring
Application History: Save and revisit all past applications
Auto-Apply: Send applications via email automatically

Platform
Google OAuth + Email authentication
Stripe subscription payments (Free / Pro £12.99 / Global £4.99)
Real-time application tracking
AI chatbot assistant on every page
Fully responsive design

---

Architecture
User → Next.js Frontend

↓

Next.js API Routes

↓

Claude AI (Anthropic)

├── Profile Analysis (Sonnet)

├── CV Tailoring (Haiku x4 parallel)

├── Cover Letter (Haiku)

├── Interview Prep (Haiku)

└── Recruiter Email Finder (Haiku)

↓

Supabase (PostgreSQL)

├── User profiles

├── Applications history

└── Subscription data

↓

Stripe (Payments)
---

Pricing Plans

| Plan | Price | Applications | Target Market |
|------|-------|-------------|---------------|
| Free | £0 | 5 to get started | Everyone |
| Pro | £12.99/month | 100/month | UK job seekers |
| Global | £4.99/month | 30/month | African job seekers |

---

Built By

Juliet Chinenye Duru**


 Links

- 🌐 **Live Product:** [https://www.jobapp.best](https://www.jobapp.best)






