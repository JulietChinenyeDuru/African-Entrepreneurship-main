// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase-admin'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const isActive = ['active', 'trialing'].includes(sub.status)
      const priceId = sub.items.data[0]?.price.id
      const plan = priceId === process.env.STRIPE_AFRICA_PRICE_ID ? 'global'
                 : isActive ? 'pro' : 'free'

      const { data, error } = await supabase.from('profiles')
        .update({ plan, stripe_subscription_id: sub.id })
        .eq('stripe_customer_id', customerId)
        .select()

      if (error) {
        console.error('[webhook] Supabase update failed:', error.message)
      } else if (!data || data.length === 0) {
        console.error(
          `[webhook] No profile found for stripe_customer_id=${customerId}. ` +
          `sub=${sub.id} plan=${plan}. This subscriber needs manual review.`
        )
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const { error } = await supabase.from('profiles')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('stripe_customer_id', customerId)
      if (error) console.error('[webhook] Supabase update failed:', error.message)
      break
    }
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      if (!userId || !session.customer) break
      const { error } = await supabase.from('profiles')
        .update({ stripe_customer_id: session.customer as string })
        .eq('id', userId)
      if (error) console.error('[webhook] Supabase update failed:', error.message)
      break
    }
  }

  return NextResponse.json({ received: true })
}
