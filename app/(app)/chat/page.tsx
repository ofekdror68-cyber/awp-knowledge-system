'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Camera, X, Mic, MicOff } from 'lucide-react'
import FeedbackModal from '@/components/FeedbackModal'

type Msg = { id: string; role: 'user' | 'assistant'; content: string; imageUrl?: string; sources?: string[] }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([{
    id: '0', role: 'assistant',
    content: 'שלום. תאר תקלה, קוד שגיאה, או העלה תמונה של חלק — אגיד לך מה לבדוק קודם.',
  }])
  const [input, setInput] = useState('')
  const [image, setImage] = useState<{ base64: string; mimeType: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [feedbackId, setFeedbackId] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<AnyRecognition>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  function handleImg(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage({ base64: (reader.result as string).split(',')[1], mimeType: file.type })
    reader.readAsDataURL(file)
  }

  function startVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SR) { alert('הדפדפן לא תומך בזיהוי קול — נסה Chrome או Safari'); return }
    const r = new SR()
    r.lang = 'he-IL'
    r.continuous = false
    r.interimResults = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => {
      const text = e.results[0][0].transcript
      setInput((prev: string) => prev ? prev + ' ' + text : text)
    }
    r.onend = () => setRecording(false)
    r.onerror = () => setRecording(false)
    r.start()
    recognitionRef.current = r
    setRecording(true)
  }

  function stopVoice() {
    recognitionRef.current?.stop()
    setRecording(false)
  }

  async function send() {
    if (!input.trim() && !image) return
    const userMsg: Msg = {
      id: Date.now().toString(), role: 'user', content: input,
      imageUrl: image ? `data:${image.mimeType};base64,${image.base64}` : undefined,
    }
    setMsgs(p => [...p, userMsg])
    const savedInput = input
    setInput(''); setImage(null); setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: savedInput, image, history: msgs.slice(-8).map(m => ({ role: m.role, content: m.content })) }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.answer || `שגיאת שרת ${res.status}`)
      }
      const data = await res.json()
      const aMsg: Msg = { id: (Date.now()+1).toString(), role: 'assistant', content: data.answer || 'תשובה ריקה', sources: data.sources }
      setMsgs(p => [...p, aMsg])
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'שגיאה לא ידועה'
      setMsgs(p => [...p, { id: (Date.now()+1).toString(), role: 'assistant', content: `שגיאה: ${msg}. בדוק חיבור לאינטרנט ונסה שוב.` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 120px)' }}>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className="max-w-[88%] rounded-2xl px-4 py-3 text-sm"
              style={m.role === 'user'
                ? { background: '#3B82F6', color: '#fff', borderTopRightRadius: 4 }
                : { background: '#FFFFFF', color: '#1E293B', border: '1px solid #CBD5E1', borderTopLeftRadius: 4 }}>
              {m.imageUrl && <img src={m.imageUrl} alt="" className="rounded-lg mb-2 max-h-40 object-contain" />}
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{m.content}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 pt-2 text-xs" style={{ borderTop: '1px solid #E2E8F0', color: '#94A3B8' }}>
                  {m.sources.join(' • ')}
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
            <div className="rounded-2xl px-4 py-3 flex gap-1" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderTopLeftRadius: 4 }}>
              {[0,150,300].map(d => (
                <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#3B82F6', animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

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

      <div className="px-3 py-3" style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex items-end gap-2">
          <button onClick={() => fileRef.current?.click()} className="p-3 rounded-xl flex-shrink-0" style={{ background: '#F1F5F9', color: '#64748B' }}>
            <Camera size={20} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImg} />

          <textarea value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="תאר תקלה, קוד שגיאה..." rows={1}
            className="flex-1 resize-none rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{ background: '#F1F5F9', color: '#1E293B', border: '1px solid #CBD5E1', minHeight: 44, maxHeight: 120 }} />

          <button
            onClick={recording ? stopVoice : startVoice}
            className="p-3 rounded-xl flex-shrink-0 transition-all"
            style={{ background: recording ? '#EF4444' : '#F1F5F9', color: recording ? '#fff' : '#64748B' }}>
            {recording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

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
