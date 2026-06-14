import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ApplyAI — Your career, on autopilot',
  description: 'AI tailors your CV for every job, applies automatically, and notifies you when recruiters respond.',
  metadataBase: new URL('https://jobapp.best'),
  openGraph: {
    title: 'ApplyAI — Your career, on autopilot',
    description: 'Upload your CV once. Land your next role.',
    url: 'https://jobapp.best',
    siteName: 'ApplyAI',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      </head>
      <body style={{ margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
        {children}
          <footer style={{ textAlign: "center", padding: "16px", fontSize: 12, color: "#999" }}>
            Built by Juliet Chinenye Duru
          </footer>
      </body>
    </html>
  )
}
