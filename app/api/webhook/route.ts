// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'
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

  const supabase = createServerSupabaseClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata.userId
      if (!userId) break
      const isActive = ['active', 'trialing'].includes(sub.status)
      // Determine plan based on price ID
      const priceId = sub.items.data[0]?.price.id
      const plan = priceId === process.env.STRIPE_AFRICA_PRICE_ID ? 'africa'
                 : isActive ? 'pro' : 'free'
      await supabase.from('profiles')
        .update({ plan, stripe_subscription_id: sub.id })
        .eq('id', userId)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata.userId
      if (!userId) break
      await supabase.from('profiles')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('id', userId)
      break
    }
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.CheckoutSession
      const userId = session.metadata?.userId
      if (!userId || !session.customer) break
      await supabase.from('profiles')
        .update({ stripe_customer_id: session.customer as string })
        .eq('id', userId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
