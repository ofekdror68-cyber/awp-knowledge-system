'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Camera, X } from 'lucide-react'
import FeedbackModal from '@/components/FeedbackModal'

type Msg = { id: string; role: 'user' | 'assistant'; content: string; imageUrl?: string; sources?: string[] }

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([{
    id: '0', role: 'assistant',
    content: 'שלום! אני מערכת האבחון של אופק גיזום. תאר תקלה, קוד שגיאה, או העלה תמונה של חלק.',
  }])
  const [input, setInput] = useState('')
  const [image, setImage] = useState<{ base64: string; mimeType: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [feedbackId, setFeedbackId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  function handleImg(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage({ base64: (reader.result as string).split(',')[1], mimeType: file.type })
    reader.readAsDataURL(file)
  }

  async function send() {
    if (!input.trim() && !image) return
    const userMsg: Msg = { id: Date.now().toString(), role: 'user', content: input, imageUrl: image ? `data:${image.mimeType};base64,${image.base64}` : undefined }
    setMsgs(p => [...p, userMsg])
    const savedInput = input
    setInput(''); setImage(null); setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: savedInput, image, history: msgs.slice(-8).map(m => ({ role: m.role, content: m.content })) }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const aMsg: Msg = { id: (Date.now()+1).toString(), role: 'assistant', content: data.answer || 'שגיאה בתשובה', sources: data.sources }
      setMsgs(p => [...p, aMsg])
    } catch (e) {
      setMsgs(p => [...p, { id: (Date.now()+1).toString(), role: 'assistant', content: `שגיאה: ${e instanceof Error ? e.message : 'נסה שוב'}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm`}
              style={m.role === 'user'
                ? { background: '#3B82F6', color: '#fff', borderTopRightRadius: 4 }
                : { background: '#1E293B', color: '#F1F5F9', border: '1px solid #334155', borderTopLeftRadius: 4 }}>
              {m.imageUrl && <img src={m.imageUrl} alt="" className="rounded-lg mb-2 max-h-40 object-contain" />}
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{m.content}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 pt-2 text-xs" style={{ borderTop: '1px solid #334155', color: '#64748B' }}>
                  מקורות: {m.sources.join(' • ')}
                </div>
              )}
              {m.role === 'assistant' && m.id !== '0' && (
                <button onClick={() => setFeedbackId(m.id)} className="mt-1.5 text-xs block" style={{ color: '#3B82F6' }}>
                  איך פתרת? ← ספר לי
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className="rounded-2xl px-4 py-3 flex gap-1" style={{ background: '#1E293B', border: '1px solid #334155', borderTopLeftRadius: 4 }}>
              {[0,150,300].map(d => (
                <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#3B82F6', animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Image preview */}
      {image && (
        <div className="px-4 pb-2">
          <div className="relative inline-block">
            <img src={`data:${image.mimeType};base64,${image.base64}`} alt="" className="h-16 w-16 rounded-xl object-cover" />
            <button onClick={() => setImage(null)} className="absolute -top-1 -right-1 rounded-full w-5 h-5 flex items-center justify-center" style={{ background: '#EF4444' }}>
              <X size={10} color="white" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4" style={{ background: '#1E293B', borderTop: '1px solid #334155' }}>
        <div className="flex items-end gap-2">
          <button onClick={() => fileRef.current?.click()} className="p-3 rounded-xl flex-shrink-0" style={{ background: '#243347', color: '#94A3B8' }}>
            <Camera size={20} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImg} />
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="תאר תקלה, קוד שגיאה..." rows={1}
            className="flex-1 resize-none rounded-xl px-3 py-2.5 text-sm max-h-24 outline-none"
            style={{ background: '#243347', color: '#F1F5F9', border: '1px solid #334155' }} />
          <button onClick={send} disabled={loading || (!input.trim() && !image)}
            className="p-3 rounded-xl flex-shrink-0 disabled:opacity-40"
            style={{ background: '#3B82F6', color: '#fff' }}>
            <Send size={20} />
          </button>
        </div>
      </div>

      {feedbackId && <FeedbackModal onClose={() => setFeedbackId(null)} onSaved={() => setFeedbackId(null)} context={msgs.find(m => m.id === feedbackId)?.content || ''} />}
    </div>
  )
}
