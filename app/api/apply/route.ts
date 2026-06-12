// app/api/apply/route.ts
// Sends the job application FROM the user's own email address
// Called after the agent has tailored the CV

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { sendApplicationEmail, testEmailConnection } from '@/lib/emailSender'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await req.json()
  const { applicationId, action } = body

  // Get user's email settings
  const { data: profile } = await supabase
    .from('profiles')
    .select('email_provider, email_address, email_app_password, full_name, auto_apply_enabled')
    .eq('id', user.id)
    .single()

  if (!profile?.email_address || !profile?.email_app_password) {
    return NextResponse.json({
      error: 'email_not_configured',
      message: 'Please set up your email in Account settings to use auto-apply.',
    }, { status: 400 })
  }

  // Test connection mode
  if (action === 'test') {
    const result = await testEmailConnection(
      profile.email_address,
      profile.email_app_password,
      profile.email_provider as 'gmail' | 'outlook' | 'yahoo'
    )
    return NextResponse.json(result)
  }

  // Get application details
  const { data: application } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .single()

  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  if (!application.recruiter_email) {
    return NextResponse.json({
      error: 'no_recruiter_email',
      message: 'Could not find recruiter email for this job. Please apply manually.',
    }, { status: 400 })
  }

  // Send the application email
  const result = await sendApplicationEmail({
    userEmail: profile.email_address,
    userAppPassword: profile.email_app_password,
    userEmailProvider: (profile.email_provider || 'gmail') as 'gmail' | 'outlook' | 'yahoo',
    userName: profile.full_name || user.email!.split('@')[0],
    jobTitle: application.job_title,
    company: application.company,
    recruiterEmail: application.recruiter_email,
    tailoredCv: application.tailored_cv,
    coverLetter: application.cover_letter,
  })

  if (result.success) {
    // Update application status
    await supabase
      .from('applications')
      .update({
        status: 'submitted',
        submission_method: 'email',
        email_message_id: result.messageId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)

    return NextResponse.json({
      success: true,
      sentTo: result.sentTo,
      sentFrom: result.sentFrom,
      message: `Application sent to ${application.company}. A copy was sent to your inbox.`,
    })
  } else {
    return NextResponse.json({
      success: false,
      error: result.error,
      message: 'Failed to send email. Check your app password and try again.',
    }, { status: 500 })
  }
}
