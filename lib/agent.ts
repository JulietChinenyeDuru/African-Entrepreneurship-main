// lib/agent.ts
// ============================================================
// JobApp AI complete agent pipeline
// Profile → Jobs → Tailor CV → Find recruiter → Submit email
// Uses cheap Haiku for 90% of tasks — see lib/models.ts
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import { TASK_MODELS, MAX_TOKENS } from './models'
import { searchAllJobBoards, NormalisedJob } from './jobSources'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Types ────────────────────────────────────────────────────

export interface AgentInput {
  cv: string
  role: string
  location: string
  salary?: string
  level?: string
  jobDesc?: string
}

export interface JobMatch {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  jobDesc?: string
  description: string
  url: string
  matchScore: number
  matchReason: string
}

export interface AgentResult {
  profile: {
    careerLevel: string
    topSkills: string[]
    suggestedRoles: string[]
    atsScore: number
    atsReason: string
    quickWins: string[]
    summary: string
  }
  topJob: JobMatch
  allJobs: JobMatch[]
  tailoredCv: string
  coverLetter: string
  atsKeywords: {
    mustHave: string[]
    technicalSkills: string[]
    softSkills: string[]
    powerPhrases: string[]
    alreadyInCv: string[]
  }
  changesMade: string[]
  recruiterEmail: string | null
  interviewPrep: {
    likelyQuestions: string[]
    talkingPoints: string[]
    questionsToAsk: string[]
  }
}

// ── Helper ───────────────────────────────────────────────────

function parseJson(text: string, fallback: any = {}) {
  try {
    // First try direct parse after stripping markdown
    const cleaned = text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    try {
      // Try extracting JSON object from text using regex
      const objMatch = text.match(/\{[\s\S]*\}/)
      if (objMatch) return JSON.parse(objMatch[0])
    } catch {}
    try {
      // Try extracting JSON array from text
      const arrMatch = text.match(/\[[\s\S]*\]/)
      if (arrMatch) return JSON.parse(arrMatch[0])
    } catch {}
    return fallback
  }
}

function getText(response: any): string {
  return response.content?.[0]?.type === 'text'
    ? response.content[0].text.replace(/```json|```/g, '').trim()
    : ''
}

// ── Step 1: Profile Analysis ─────────────────────────────────
// Uses Sonnet — needs real reasoning to understand career level

export async function analyseProfile(input: AgentInput) {
  const response = await claude.messages.create({
    model: TASK_MODELS.profileAnalysis,     // Sonnet
    max_tokens: MAX_TOKENS.profileAnalysis,
    system: `You are JobApp AI's profile analysis agent. Never use markdown, dashes, or asterisks in your response.
Return ONLY valid JSON — no markdown, no explanation.
{
  "career_level": "Junior|Mid|Senior|Principal",
  "years_experience": <int>,
  "top_skills": ["skill",...],
  "suggested_roles": ["role",...],
  "ats_score": <int 1-10>,
  "ats_reason": "one sentence",
  "quick_wins": ["tip1","tip2"],
  "summary": "2-3 sentence career summary"
}`,
    messages: [{
      role: 'user',
      content: `Target: ${input.role} in ${input.location}, ${input.level || 'any level'}, salary: ${input.salary || 'open'}\n\nCV:\n${input.cv}`,
    }],
  })
  return parseJson(getText(response))
}

// ── Step 2: Find Jobs ────────────────────────────────────────
// Searches Reed + Adzuna + Jooble for REAL jobs, then uses
// Haiku to score each against the candidate profile

export async function findJobs(profile: any, input: AgentInput): Promise<JobMatch[]> {
  // Search real job boards in parallel
  const { jobs: realJobs, sources } = await searchAllJobBoards(
    input.role || profile.suggested_roles?.[0] || 'Software Engineer',
    input.location || 'United Kingdom',
    10
  )

  // Fallback — if all 3 APIs returned nothing (e.g. no keys set yet),
  // generate realistic placeholder jobs so the app still works
  if (realJobs.length === 0) {
    return generateFallbackJobs(profile, input)
  }

  // Score each real job against the candidate profile using Haiku
  const jobsSummary = realJobs.map(j => ({
    id: j.id, title: j.title, company: j.company,
    description: j.description.slice(0, 200),
  }))

  const response = await claude.messages.create({
    model: TASK_MODELS.jobMatching,         // Haiku
    max_tokens: MAX_TOKENS.jobMatching,
    system: `You are JobApp AI's job matching agent. Never use markdown, dashes, or asterisks.
Score how well each job matches the candidate profile.
Return ONLY valid JSON array — no markdown.
[{ "id": "<job_id>", "match_score": <int 0-100>, "match_reason": "one sentence" }]`,
    messages: [{
      role: 'user',
      content: `Candidate profile: ${JSON.stringify(profile)}\n\nJobs to score:\n${JSON.stringify(jobsSummary)}`,
    }],
  })

  const scores: any[] = parseJson(getText(response), [])
  const scoreMap = new Map(scores.map(s => [s.id, s]))

  const scored: JobMatch[] = realJobs.map(j => {
    const score = scoreMap.get(j.id)
    return {
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      salary: j.salary,
      description: j.description,
      url: j.url,
      matchScore: score?.match_score ?? 75,
      matchReason: score?.match_reason ?? `Found via ${j.source}`,
    }
  })

  // Sort by match score, best first
  scored.sort((a, b) => b.matchScore - a.matchScore)
  return scored
}

// ── Fallback — used only if Reed/Adzuna/Jooble keys are missing ──

async function generateFallbackJobs(profile: any, input: AgentInput): Promise<JobMatch[]> {
  const response = await claude.messages.create({
    model: TASK_MODELS.jobMatching,
    max_tokens: MAX_TOKENS.jobMatching,
    system: `You are JobApp AI's job discovery agent. Never use markdown, dashes, or asterisks.
Generate 5 realistic UK job listings matching this candidate.
Return ONLY valid JSON array — no markdown.
[{
  "id": "job-1", "title": "...", "company": "real UK company",
  "location": "...", "salary": "£XX,000–£XX,000",
  "description": "2-3 sentence description",
  "url": "https://reed.co.uk/jobs/example",
  "match_score": <int 70-99>, "match_reason": "one sentence"
}]`,
    messages: [{
      role: 'user',
      content: `Profile: ${JSON.stringify(profile)}\nRole: ${input.role}\nLocation: ${input.location}\nSalary: ${input.salary || 'open'}`,
    }],
  })
  const jobs = parseJson(getText(response), [])
  return jobs.map((j: any) => ({
    id: j.id, title: j.title, company: j.company, location: j.location,
    salary: j.salary, description: j.description, url: j.url,
    matchScore: j.match_score, matchReason: j.match_reason,
  }))
}

// ── Step 3: Tailor CV ────────────────────────────────────────
// Uses Haiku for all sub-tasks — cost saving is significant here

export async function tailorCV(cv: string, job: JobMatch) {
  const jobContext = `Role: ${job.title} at ${job.company}\nLocation: ${job.location}\nSalary: ${job.salary}\nDescription: ${job.description}`

  // Run all 4 sub-tasks in parallel — saves time
  const [cvRes, clRes, kwRes, chRes] = await Promise.all([

    // Tailored CV — Haiku
    claude.messages.create({
      model: TASK_MODELS.cvTailoring,       // Haiku
      max_tokens: MAX_TOKENS.cvTailoring,
      system: `You are an expert CV writer and ATS specialist.
Rewrite the CV for the target role. Mirror keywords from the job.
Lead with most relevant experience. Rewrite summary for this role.
Never invent facts. Use action verbs: Engineered, Deployed, Built, Led.
Format: PROFESSIONAL SUMMARY | EXPERIENCE | SKILLS | EDUCATION
Return ONLY the CV text — no preamble.`,
      messages: [{ role: 'user', content: `${jobContext}\n\nOriginal CV:\n${cv}` }],
    }),

    // Cover letter — Haiku
    claude.messages.create({
      model: TASK_MODELS.coverLetter,       // Haiku
      max_tokens: MAX_TOKENS.coverLetter,
      system: `Write a concise 3-paragraph cover letter.
Para 1: Why this role at this company excites you.
Para 2: Your 2 strongest relevant achievements with numbers.
Para 3: Forward-looking close — what you will bring.
Start with impact not "I am writing to apply".
Under 220 words. Sign: "Warm regards, [Your Name]"
Return ONLY the letter text.`,
      messages: [{ role: 'user', content: `${jobContext}\n\nBackground:\n${cv.slice(0, 600)}` }],
    }),

    // ATS keywords — Haiku
    claude.messages.create({
      model: TASK_MODELS.atsKeywords,       // Haiku
      max_tokens: MAX_TOKENS.atsKeywords,
      system: `Extract ATS keywords. Return ONLY JSON:
{"must_have":[],"technical_skills":[],"soft_skills":[],"power_phrases":[],"already_in_cv":[]}`,
      messages: [{ role: 'user', content: `Job: ${job.title} at ${job.company}\n${job.description}\nCV: ${cv.slice(0, 500)}` }],
    }),

    // Changes summary — Haiku
    claude.messages.create({
      model: TASK_MODELS.changesSummary,    // Haiku
      max_tokens: MAX_TOKENS.changesSummary,
      system: `List 4 key CV changes as a JSON string array. Max 10 words each. Return ONLY JSON array.`,
      messages: [{ role: 'user', content: `Role: ${job.title}\nCV snippet: ${cv.slice(0, 400)}` }],
    }),
  ])

  const kw = parseJson(getText(kwRes))
  const atsKeywords = {
    mustHave: kw.must_have || [],
    technicalSkills: kw.technical_skills || [],
    softSkills: kw.soft_skills || [],
    powerPhrases: kw.power_phrases || [],
    alreadyInCv: kw.already_in_cv || [],
  }

  let changesMade: string[] = []
  try { changesMade = JSON.parse(getText(chRes)) } catch {}

  return {
    tailoredCv: getText(cvRes),
    coverLetter: getText(clRes),
    atsKeywords,
    changesMade,
  }
}

// ── Step 4: Find Recruiter Email ─────────────────────────────
// Uses Haiku — simple lookup task

export async function findRecruiterEmail(
  jobTitle: string,
  company: string,
  jobUrl: string,
  jobDescription: string
): Promise<string | null> {

  // First — check if email is in job description
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g
  const emailsInDesc = jobDescription.match(emailRegex)
  if (emailsInDesc?.length) return emailsInDesc[0]

  // Second — ask Haiku to guess the careers email
  const response = await claude.messages.create({
    model: TASK_MODELS.recruiterFinder,     // Haiku
    max_tokens: MAX_TOKENS.recruiterFinder,
    system: `Given a company and job, return the most likely careers email address.
Return ONLY the email address. If unknown return "unknown".`,
    messages: [{
      role: 'user',
      content: `Company: ${company}\nJob: ${jobTitle}\nURL: ${jobUrl}`,
    }],
  })

  const email = getText(response)
  if (email && email !== 'unknown' && email.includes('@')) return email

  // Third — common pattern fallback
  const domain = company.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/(ltd|limited|plc|inc|uk)/g, '')
  return `careers@${domain}.co.uk`
}

// ── Step 5: Interview Preparation ─────────────────────────────
// Uses Haiku — generates likely questions, talking points,
// and questions to ask the interviewer for this specific job

export async function generateInterviewPrep(job: JobMatch, profile: any) {
  const response = await claude.messages.create({
    model: TASK_MODELS.interviewPrep,     // Haiku
    max_tokens: MAX_TOKENS.interviewPrep,
    system: `You are an interview coach preparing a candidate for a
specific job interview. Return ONLY valid JSON — no markdown.
{
  "likely_questions": ["q1","q2","q3","q4","q5","q6","q7","q8","q9","q10"],
  "talking_points": ["point1","point2","point3","point4"],
  "questions_to_ask": ["q1","q2","q3"]
}
likely_questions: 10 realistic interview questions for THIS role, covering technical, behavioral, and situational types.
talking_points: specific achievements from the candidate's
  background they should highlight, tailored to this job.
questions_to_ask: thoughtful questions the candidate could ask
  the interviewer about this role/company.`,
    messages: [{
      role: 'user',
      content: `Job: ${job.title} at ${job.company}\nLocation: ${job.location}\nDescription: ${job.description}\n\nCandidate summary: ${profile.summary}\nTop skills: ${(profile.topSkills || profile.top_skills || []).join(', ')}\nCareer level: ${profile.careerLevel || profile.career_level}`,
    }],
  })

  console.log('[interviewPrep] raw response:', getText(response))
  const data = parseJson(getText(response), {})
  return {
    likelyQuestions: data.likely_questions || data.likelyQuestions || [],
    talkingPoints: data.talking_points || data.talkingPoints || [],
    questionsToAsk: data.questions_to_ask || data.questionsToAsk || [],
  }
}

// ── Full Pipeline ─────────────────────────────────────────────

export async function runAgentPipeline(input: AgentInput): Promise<AgentResult> {
  // Step 1 — Profile (Sonnet)
  const profileRaw = await analyseProfile(input)
  const profile = {
    careerLevel: profileRaw.career_level || 'Mid',
    topSkills: profileRaw.top_skills || [],
    suggestedRoles: profileRaw.suggested_roles || [],
    atsScore: profileRaw.ats_score || 5,
    atsReason: profileRaw.ats_reason || '',
    quickWins: profileRaw.quick_wins || [],
    summary: profileRaw.summary || '',
  }

  // Step 2 – Jobs (Haiku) or use provided job description
  let allJobs: any[] = []
  let topJob: any
  if (input.jobDesc && input.jobDesc.trim()) {
    topJob = {
      title: input.role,
      company: 'Target Company',
      location: input.location || '',
      description: input.jobDesc,
      url: '',
      salary: input.salary || '',
      matchScore: 100,
      source: 'manual',
    }
    allJobs = [topJob]
  } else {
    allJobs = await findJobs(profileRaw, input)
    if (!allJobs.length) throw new Error('No jobs found for your profile.')
    topJob = allJobs[0]
  }

  // Step 3 — Tailor CV (Haiku x4 in parallel) + Interview Prep (Haiku) — run together
  const { tailoredCv, coverLetter, atsKeywords, changesMade } = await tailorCV(input.cv, topJob)
  const interviewPrep = await generateInterviewPrep(topJob, profile)

  // Step 4 — Find recruiter email (Haiku)
  const recruiterEmail = await findRecruiterEmail(
    topJob.title, topJob.company, topJob.url, topJob.description
  )

  return {
    profile,
    topJob,
    allJobs,
    tailoredCv,
    coverLetter,
    atsKeywords,
    changesMade,
    recruiterEmail,
    interviewPrep,
  }
}
