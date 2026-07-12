import { NextRequest, NextResponse } from 'next/server'
import { createPortalSession, stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const email = profile?.email ?? user.email
      const customers = await stripe.customers.list({ email: email!, limit: 1 })

      if (customers.data.length === 0) {
        return NextResponse.json({ error: 'No billing account found for this user' }, { status: 400 })
      }

      customerId = customers.data[0].id

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const url = await createPortalSession(customerId)
    return NextResponse.json({ url })
  } catch (err: any) {
    console.error('Portal error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
