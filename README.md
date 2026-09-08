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
 
•	Serving job seekers worldwide, with confirmed usage across 10+ countries demonstrating genuine international market reach for the product

•	A dedicated Global plan (£4.99/month), deliberately priced below the standard Pro tier to make AI-powered job tools commercially accessible to users in Africa and other underserved regions evidence of product design driven by market need, not just technical capability

•	A free tier available to all users, supporting adoption and organic growth ahead of monetization

•	Independently designed, built, secured, and monitored end-to-end, from AI-driven CV/cover-letter generation and multi-source job aggregation (Reed, Adzuna, Jooble) to a production-grade security audit and full observability stack (Prometheus, Grafana, Zipkin), reflecting sole ownership of the full technical and commercial lifecycle



Tech Stack

| Layer          | Technology |
|-------|-----------|
| Frontend       | Next.js 14, React, TypeScript |
| Backend        | Next.js API Routes, Node.js |
| AI Engine      | Anthropic Claude (Sonnet + Haiku) |
| Database       | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (Google OAuth + Email) |
| Payments       | Stripe (subscription billing) |
| Deployment     | Vercel |
| Monitoring     | Google Analytics, UptimeRobot |prometheus, Grafana, Zipkin|


Key Features

For Job Seekers

	AI-Powered CV Tailoring: Job seekers upload a CV once; the platform uses the Anthropic API (Claude) to dynamically rewrite and re-optimize it for each individual job posting, rather than relying on a static template

	AI-Generated Cover Letters: Personalized, context-aware cover letters generated in seconds, tailored to the specific role and employer

	AI Interview Preparation: Generates likely interview questions, suggested talking points, and questions for the candidate to ask, based on the job description and CV

	ATS Analysis: Automated keyword matching and scoring against Applicant Tracking Systems, improving candidates' visibility to employers. Application History Tracking: Persistent storage (Through Supabase) of all past applications, enabling users to manage and revisit their job search over time


Technical Innovation 

JobApp AI is an independently designed and built AI-powered job application platform that goes beyond simple automation, integrating a multi-step AI pipeline to solve a genuine problem in the job search process. Rather than offering a static CV template or a single-prompt wrapper around a language model, the platform combines CV parsing, contextual tailoring, ATS-style scoring, and automated application submission into a cohesive end-to-end product. At its core, JobApp AI leverages the Anthropic API (Claude) to dynamically generate tailored CVs, cover letters, and interview preparation content specific to each job posting, demonstrating applied, production-grade use of large language models rather than superficial integration. The following features illustrate the technical depth and innovation embedded in the platform:

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
| Pro | £12.99/month | 100/month | International job seekers |
| Global | £4.99/month | 30/month | African job seekers |

---

Built By

Juliet Chinenye Duru**


 Links

- 🌐 **Live Product:** [https://www.jobapp.best](https://www.jobapp.best)






