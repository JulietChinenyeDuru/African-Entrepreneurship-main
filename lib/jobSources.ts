// lib/jobSources.ts
// ============================================================
// Unified job search across multiple boards:
//   - Reed.co.uk    (UK, free API)
//   - Adzuna        (UK/US/CA/AU/DE/FR + more, free API)
//   - Jooble        (71 countries, free API)
//
// All results normalised to one shape, deduplicated, and
// merged. If one API fails, the others still return results.
// ============================================================

export interface NormalisedJob {
  id: string
  title: string
  company: string
  location: string
  salary: string
  description: string
  url: string
  source: 'reed' | 'adzuna' | 'jooble'
  postedDate?: string
}

// ── Reed ─────────────────────────────────────────────────────

async function searchReed(keywords: string, location: string): Promise<NormalisedJob[]> {
  const apiKey = process.env.REED_API_KEY
  if (!apiKey) return []

  try {
    const params = new URLSearchParams({
      keywords,
      locationName: location,
      resultsToTake: '10',
    })

    const res = await fetch(`https://www.reed.co.uk/api/1.0/search?${params}`, {
      headers: { 'Authorization': 'Basic ' + Buffer.from(apiKey + ':').toString('base64') },
    })

    if (!res.ok) return []
    const data = await res.json()

    return (data.results || []).map((j: any): NormalisedJob => ({
      id: `reed-${j.jobId}`,
      title: j.jobTitle,
      company: j.employerName || 'Confidential',
      location: j.locationName || location,
      salary: j.minimumSalary && j.maximumSalary
        ? `£${Math.round(j.minimumSalary).toLocaleString()} – £${Math.round(j.maximumSalary).toLocaleString()}`
        : 'Salary not specified',
      description: (j.jobDescription || '').replace(/<[^>]*>/g, '').slice(0, 400),
      url: j.jobUrl,
      source: 'reed',
      postedDate: j.date,
    }))
  } catch {
    return []
  }
}

// ── Adzuna ───────────────────────────────────────────────────

async function searchAdzuna(keywords: string, location: string, country: string = 'gb'): Promise<NormalisedJob[]> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) return []

  try {
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      what: keywords,
      where: location,
      results_per_page: '10',
      content_type: 'application/json',
    })

    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`
    )

    if (!res.ok) return []
    const data = await res.json()

    return (data.results || []).map((j: any): NormalisedJob => ({
      id: `adzuna-${j.id}`,
      title: j.title,
      company: j.company?.display_name || 'Confidential',
      location: j.location?.display_name || location,
      salary: j.salary_min && j.salary_max
        ? `£${Math.round(j.salary_min).toLocaleString()} – £${Math.round(j.salary_max).toLocaleString()}`
        : 'Salary not specified',
      description: (j.description || '').slice(0, 400),
      url: j.redirect_url,
      source: 'adzuna',
      postedDate: j.created,
    }))
  } catch {
    return []
  }
}

// ── Jooble ───────────────────────────────────────────────────

async function searchJooble(keywords: string, location: string): Promise<NormalisedJob[]> {
  const apiKey = process.env.JOOBLE_API_KEY
  if (!apiKey) return []

  try {
    const res = await fetch(`https://jooble.org/api/${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keywords,
        location,
        ResultOnPage: '10',
      }),
    })

    if (!res.ok) return []
    const data = await res.json()

    return (data.jobs || []).map((j: any, idx: number): NormalisedJob => ({
      id: `jooble-${j.id || idx}`,
      title: j.title,
      company: j.company || 'Confidential',
      location: j.location || location,
      salary: j.salary || 'Salary not specified',
      description: (j.snippet || '').replace(/<[^>]*>/g, '').slice(0, 400),
      url: j.link,
      source: 'jooble',
      postedDate: j.updated,
    }))
  } catch {
    return []
  }
}

// ── Country detection for Adzuna ────────────────────────────

const ADZUNA_COUNTRY_MAP: Record<string, string> = {
  'united kingdom': 'gb', 'uk': 'gb', 'scotland': 'gb', 'england': 'gb', 'wales': 'gb',
  'united states': 'us', 'usa': 'us', 'us': 'us',
  'canada': 'ca',
  'australia': 'au',
  'germany': 'de',
  'france': 'fr',
  'nigeria': 'gb',    // Adzuna doesn't cover Nigeria — fallback to UK results
  'ghana': 'gb',
  'kenya': 'gb',
  'south africa': 'za',
}

function detectAdzunaCountry(location: string): string {
  const loc = location.toLowerCase()
  for (const [key, code] of Object.entries(ADZUNA_COUNTRY_MAP)) {
    if (loc.includes(key)) return code
  }
  return 'gb'   // default to UK
}

// ── Deduplication ────────────────────────────────────────────
// Two jobs are duplicates if title + company match closely

function dedupe(jobs: NormalisedJob[]): NormalisedJob[] {
  const seen = new Set<string>()
  const result: NormalisedJob[] = []

  for (const job of jobs) {
    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`
    if (!seen.has(key)) {
      seen.add(key)
      result.push(job)
    }
  }
  return result
}

// ── Main search function ──────────────────────────────────────
// Queries all 3 sources in parallel, merges, deduplicates

export async function searchAllJobBoards(
  keywords: string,
  location: string,
  maxResults: number = 15
): Promise<{ jobs: NormalisedJob[]; sources: Record<string, number> }> {

  const adzunaCountry = detectAdzunaCountry(location)

  const [reedJobs, adzunaJobs, joobleJobs] = await Promise.all([
    searchReed(keywords, location),
    searchAdzuna(keywords, location, adzunaCountry),
    searchJooble(keywords, location),
  ])

  const sources = {
    reed: reedJobs.length,
    adzuna: adzunaJobs.length,
    jooble: joobleJobs.length,
  }

  // Merge — interleave so no single source dominates
  const merged: NormalisedJob[] = []
  const maxLen = Math.max(reedJobs.length, adzunaJobs.length, joobleJobs.length)
  for (let i = 0; i < maxLen; i++) {
    if (reedJobs[i]) merged.push(reedJobs[i])
    if (adzunaJobs[i]) merged.push(adzunaJobs[i])
    if (joobleJobs[i]) merged.push(joobleJobs[i])
  }

  const deduped = dedupe(merged)

  return {
    jobs: deduped.slice(0, maxResults),
    sources,
  }
}
