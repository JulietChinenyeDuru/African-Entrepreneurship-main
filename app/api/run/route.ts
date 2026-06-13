// app/api/run/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { runAgentPipeline } from '@/lib/agent'

const PLAN_LIMITS: Record<string, number> = {
  free:   5,
  pro:    100,
  africa: 30,
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Get profile + plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, applications_used_month')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Check plan limit
  const limit = PLAN_LIMITS[profile.plan] || 5
  if (profile.applications_used_month >= limit) {
    return NextResponse.json({
      error: 'monthly_limit_reached',
      plan: profile.plan,
      limit,
      used: profile.applications_used_month,
      message: `You have used all ${limit} applications this month. Upgrade to Pro for more.`,
    }, { status: 403 })
  }

  // Parse request
  const body = await req.json()
  const { cv, role, location, salary, level } = body

  if (!cv?.trim()) return NextResponse.json({ error: 'CV text required' }, { status: 400 })
  if (!role?.trim()) return NextResponse.json({ error: 'Target role required' }, { status: 400 })

  try {
    // Run agent pipeline
    const result = await runAgentPipeline({ cv, role, location, salary, level })

    // Save to Supabase
    const { data: app } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        job_title: result.topJob.title,
        company: result.topJob.company,
        location: result.topJob.location,
        salary: result.topJob.salary,
        job_url: result.topJob.url,
        job_description: result.topJob.description,
        recruiter_email: result.recruiterEmail,
        match_score: result.topJob.matchScore,
        tailored_cv: result.tailoredCv,
        cover_letter: result.coverLetter,
        ats_keywords: result.atsKeywords,
        changes_made: result.changesMade,
        interview_prep: result.interviewPrep,
        status: 'ready',
        submission_method: 'manual',
      })
      .select()
      .single()

    // Increment usage counter
    await supabase
      .from('profiles')
      .update({
        applications_used_month: profile.applications_used_month + 1,
        applications_used: profile.applications_used_month + 1,
      })
      .eq('id', user.id)

    return NextResponse.json({
      ...result,
      applicationId: app?.id,
      remaining: limit - profile.applications_used_month - 1,
    })

  } catch (err: any) {
    console.error('Agent error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
