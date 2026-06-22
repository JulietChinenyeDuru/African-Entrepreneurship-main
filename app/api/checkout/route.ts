// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const AFRICAN_COUNTRIES = ['NG','GH','KE','ZA','UG','TZ','RW','SN','CM','ET']

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { country, plan: requestedPlan } = await req.json()

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  // Use Africa price for African users
  const isAfrican = AFRICAN_COUNTRIES.includes(country?.toUpperCase())
  const priceId = isAfrican
    ? process.env.STRIPE_AFRICA_PRICE_ID!
    : process.env.STRIPE_PRO_PRICE_ID!

  const url = await createCheckoutSession(
    user.id, user.email!, priceId, profile?.stripe_customer_id
  )
  return NextResponse.json({ url, plan: isAfrican ? 'global' : 'pro' })
}
