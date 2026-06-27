import type { Metadata } from 'next'
import ChatBot from '@/components/ChatBot'

export const metadata: Metadata = {
  title: 'JobApp AI — Your career, on autopilot',
  description: 'AI tailors your CV for every job, applies automatically, and notifies you when recruiters respond.',
  metadataBase: new URL('https://jobapp.best'),
  openGraph: {
    title: 'JobApp AI — Your career, on autopilot',
    description: 'Upload your CV once. Land your next role.',
    url: 'https://jobapp.best',
    siteName: 'JobApp AI',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-1F2710E11C"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-1F2710E11C');
        ` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      </head>
      <body style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", background: '#0F172A', minHeight: '100vh' }}>
        {children}
          <footer style={{ textAlign: "left", padding: "16px 24px", fontSize: 12, color: "#999" }}>
            Built by Juliet Chinenye Duru
          </footer>
        <ChatBot />
      </body>
    </html>
  )
}
