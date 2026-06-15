import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

const ADMIN_EMAIL = 'julietchinenyeduru@gmail.com'

export default async function AdminReviewsPage() {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, user_id, rating, comment, created_at')
    .order('created_at', { ascending: false })

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32, fontFamily: "'DM Sans', sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>All Reviews</h1>

      {error && (
        <div style={{ padding: 14, background: '#FFF5F5', border: '1px solid #F09595', borderRadius: 8, marginBottom: 16, color: '#5F5E5A' }}>
          Error loading reviews: {error.message}
        </div>
      )}

      {!error && (!reviews || reviews.length === 0) && (
        <div style={{ color: '#888780' }}>No reviews submitted yet.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {reviews?.map((review) => (
          <div
            key={review.id}
            style={{
              background: '#fff',
              border: '1px solid #E2E0D8',
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 13, color: '#888780', marginBottom: 4 }}>User ID</div>
                <div style={{ fontSize: 14, fontFamily: 'monospace' }}>{review.user_id}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, color: '#1D9E75', marginBottom: 4 }}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
                <div style={{ fontSize: 13, color: '#888780' }}>
                  {new Date(review.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            {review.comment && (
              <div style={{ fontSize: 15, color: '#3A3A36', marginTop: 8, lineHeight: 1.6 }}>
                {review.comment}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
