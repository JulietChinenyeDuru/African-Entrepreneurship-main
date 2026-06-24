'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! 👋 I\'m the ApplyAI assistant. I can help you with CV tips, explain how ApplyAI works, or help you choose the right plan. What can I help you with?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again!' }])
    }
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => { setOpen(!open); setShowTeaser(false) }} style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, height: 52, borderRadius: 30, background: '#1E40AF', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(30,64,175,0.4)', display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', fontFamily: '"DM Sans", sans-serif' }}>
        <span style={{ fontSize: 22 }}>{open ? '✕' : '🤖'}</span>
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{open ? 'Close' : 'Click to chat with us'}</span>
      </button>
        <div style={{ position: 'fixed', bottom: 90, right: 24, zIndex: 9998, width: 340, height: 480, borderRadius: 16, background: '#fff', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #BFDBFE', fontFamily: '"DM Sans", sans-serif' }}>
          <div style={{ background: '#1E40AF', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>ApplyAI Assistant</div>
              <div style={{ color: '#BFDBFE', fontSize: 12 }}>Always here to help</div>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: m.role === 'user' ? '#1E40AF' : '#EFF6FF', color: m.role === 'user' ? '#fff' : '#0F172A', fontSize: 13, lineHeight: 1.5 }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: '#EFF6FF', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: 13, color: '#6B7280' }}>Typing...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: '12px', borderTop: '1px solid #BFDBFE', display: 'flex', gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask me anything..." style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #BFDBFE', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={send} disabled={loading} style={{ background: '#1E40AF', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', fontSize: 16 }}>➤</button>
          </div>
        </div>
      )}
    </>
  )
}
