// app/api/email-settings/route.ts
// Saves the user's auto-apply email settings.
// The app password is ENCRYPTED before being stored in Supabase.

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { encrypt } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { emailProvider, emailAddress, appPassword } = await req.json()

  if (!emailProvider || !emailAddress || !appPassword) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const encryptedPassword = encrypt(appPassword)

  const { error } = await supabase
    .from('profiles')
    .update({
      email_provider: emailProvider,
      email_address: emailAddress,
      email_app_password: encryptedPassword,   // stored encrypted
      auto_apply_enabled: true,
    })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
