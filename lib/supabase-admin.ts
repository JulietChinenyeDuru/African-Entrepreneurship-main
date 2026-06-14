// lib/supabase-admin.ts
// Admin Supabase client using the service role key — bypasses Row Level Security.
// ONLY use this in trusted server-side contexts (e.g. webhooks) where there is
// no authenticated user session, but the operation is verified by other means
// (e.g. a valid Stripe webhook signature).
// NEVER expose this client or the service role key to the browser.

import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
