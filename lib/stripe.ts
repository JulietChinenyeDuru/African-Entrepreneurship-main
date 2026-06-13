// lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export const PLANS = {
  free:   { name: 'Free',           price: 0,      limit: 5   },
  pro:    { name: 'Pro',            price: 12.99,  limit: 50 },
  africa: { name: 'ApplyAI Global', price: 4.99,   limit: 30  },
}

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  priceId: string,
  customerId?: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: customerId || undefined,
    customer_email: customerId ? undefined : userEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
    tax_id_collection: { enabled: true },
  })
  return session.url!
}

export async function createPortalSession(customerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })
  return session.url
}
