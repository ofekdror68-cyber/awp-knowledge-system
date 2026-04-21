'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Camera, X, ThumbsUp, ThumbsDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import FeedbackModal from '@/components/FeedbackModal'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  sources?: string[]
  showFeedback?: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'שלום! אני מערכת האבחון של אופק במות הרמה. תאר לי תקלה, קוד שגיאה, או העלה תמונה של החלק.',
    },
  ])
  const [input, setInput] = useState('')
  const [image, setImage] = useState<{ base64: string; mimeType: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [feedbackMsgId, setFeedbackMsgId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      const mimeType = file.type as 'image/jpeg' | 'image/png' | 'image/webp'
      setImage({ base64, mimeType })
    }
    reader.readAsDataURL(file)
  }

  async function sendMessage() {
    if (!input.trim() && !image) return
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      imageUrl: image ? `data:${image.mimeType};base64,${image.base64}` : undefined,
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setImage(null)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          image: image,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        showFeedback: true,
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'שגיאה — נסה שוב.',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-white border border-slate-200 text-slate-900 rounded-tl-sm'
            }`}>
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="" className="rounded-lg mb-2 max-h-40 object-contain" />
              )}
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none text-slate-900">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-400">מקורות: {msg.sources.join(' • ')}</div>
                </div>
              )}
              {msg.showFeedback && (
                <button
                  onClick={() => setFeedbackMsgId(msg.id)}
                  className="mt-2 text-xs text-blue-600 hover:underline block"
                >
                  איך פתרת בסוף? ספר לי ←
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Image preview */}
      {image && (
        <div className="px-4 pb-2">
          <div className="relative inline-block">
            <img
              src={`data:${image.mimeType};base64,${image.base64}`}
              alt=""
              className="h-16 w-16 rounded-lg object-cover border border-slate-200"
            />
            <button
              onClick={() => setImage(null)}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-end gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="p-3 rounded-xl bg-slate-100 text-slate-600 flex-shrink-0"
          >
            <Camera size={20} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="תאר תקלה, קוד שגיאה..."
            className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-24"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={loading || (!input.trim() && !image)}
            className="p-3 rounded-xl bg-blue-600 text-white disabled:opacity-40 flex-shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {feedbackMsgId && (
        <FeedbackModal
          onClose={() => setFeedbackMsgId(null)}
          onSaved={() => setFeedbackMsgId(null)}
          context={messages.find(m => m.id === feedbackMsgId)?.content || ''}
        />
      )}
    </div>
  )
}
