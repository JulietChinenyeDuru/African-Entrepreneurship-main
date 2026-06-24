import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { message, history } = await req.json()

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system: `You are the ApplyAI assistant on jobapp.best. You help job seekers understand and use ApplyAI.

About ApplyAI:
- AI-powered job application platform that tailors CVs and cover letters to every job in seconds
- Uses Claude AI to tailor CVs, generate cover letters, and prepare users for interviews
- Free plan: 5 applications to get started
- Pro plan: £12.99/month — 100 applications, CV tailoring, cover letter, ATS analysis, auto-apply via email, interview prep
- Global plan: £4.99/month — 30 applications, same features as Pro (designed for African job seekers)
- Users upload their CV, paste a job description, and AI does the rest
- Website: jobapp.best

Be friendly, concise, and helpful. If asked about pricing, explain all three plans clearly. If asked how to get started, tell them to go to jobapp.best and sign up free. Keep responses under 100 words.`,
    messages: [
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ]
  })

  const reply = response.content[0].type === 'text' ? response.content[0].text : 'Sorry, I could not process that.'
  return NextResponse.json({ reply })
}
