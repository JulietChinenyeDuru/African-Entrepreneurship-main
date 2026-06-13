// app/api/jobs/route.ts
// Browse jobs — no CV needed, shows immediately on dashboard open
// Searches Reed + Adzuna + Jooble in parallel, merges results

import { NextRequest, NextResponse } from 'next/server'
import { searchAllJobBoards } from '@/lib/jobSources'

// ── Simple in-memory rate limiting ────────────────────────────
// Limits each IP to 20 requests per minute.
// Note: resets on server restart / cold start — fine for early stage.
// For production scale, swap for Redis/Upstash.

const requestLog = new Map<string, number[]>()
const LIMIT = 20
const WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (requestLog.get(ip) || []).filter(t => now - t < WINDOW_MS)
  if (timestamps.length >= LIMIT) {
    requestLog.set(ip, timestamps)
    return true
  }
  timestamps.push(now)
  requestLog.set(ip, timestamps)
  return false
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Too many requests. Please slow down.' },
      { status: 429 }
    )
  }

  const searchParams = req.nextUrl.searchParams
  const keywords = searchParams.get('keywords') || 'Software Engineer'
  const location = searchParams.get('location') || 'United Kingdom'

  try {
    const { jobs, sources } = await searchAllJobBoards(keywords, location, 15)
    return NextResponse.json({ jobs, total: jobs.length, sources })
  } catch (err: any) {
    return NextResponse.json({ jobs: [], error: err.message }, { status: 500 })
  }
}
