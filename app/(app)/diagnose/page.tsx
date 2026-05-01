'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronRight, Mic, MicOff, CheckCircle, XCircle, RotateCcw, Zap } from 'lucide-react'

type Step = 'model' | 'system' | 'symptom' | 'questions' | 'result'

const SYSTEMS = ['הנעה', 'הידראוליקה', 'חשמל', 'בקרה', 'בטיחות', 'מנוע', 'אחר']

const SYMPTOM_SUGGESTIONS = [
  'לא עולה', 'לא יורד', 'לא נוסע', 'תקוע במקום', 'קוד שגיאה',
  'לא מתניע', 'הידראוליקה חלשה', 'נזילה', 'קול חריג', 'סוללה חלשה',
  'מנוף לא זז', 'פלטפורמה רועדת', 'בלמים לא עובדים', 'מסך כבוי',
]

type Suspect = { rank: number; probability: number; cause: string; explanation: string; page_ref: string | null }
type DiagnosisResult = { suspects: Suspect[]; quick_test: string; decision_tree: string; closing: string }

export default function DiagnosePage() {
  const [step, setStep] = useState<Step>('model')
  const [models, setModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedSystem, setSelectedSystem] = useState('')
  const [symptom, setSymptom] = useState('')
  const [questions, setQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [outcome, setOutcome] = useState<'worked' | 'failed' | null>(null)
  const [actualFix, setActualFix] = useState('')
  const [outcomeSubmitted, setOutcomeSubmitted] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    fetch('/api/diagnose').then(r => r.json()).then(d => setModels(d.models || []))
  }, [])

  function startVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SR) { alert('דפדפן לא תומך בזיהוי קול — נסה Chrome או Safari'); return }

    const r = new SR()
    r.lang = 'he-IL'
    r.continuous = false
    r.interimResults = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => {
      const text = e.results[0][0].transcript
      setSymptom((prev: string) => prev ? prev + ' ' + text : text)
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

  async function loadQuestions() {
    setLoading(true)
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'questions', model: selectedModel, system_category: selectedSystem, symptom }),
      })
      const data = await res.json()
      setQuestions(data.questions || [])
      setAnswers(new Array(data.questions?.length || 0).fill(''))
      setStep('questions')
    } catch {
      setQuestions([])
      setStep('questions')
    } finally {
      setLoading(false)
    }
  }

  async function runDiagnosis() {
    setLoading(true)
    try {
      const clarifying_qa = questions.map((q, i) => ({ q, a: answers[i] || 'לא נענה' }))
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'diagnose', model: selectedModel, system_category: selectedSystem, symptom, clarifying_qa }),
      })
      const data = await res.json()
      setDiagnosis(data.diagnosis)
      setSessionId(data.session_id)
      setStep('result')
    } catch (e) {
      alert(`שגיאה: ${e instanceof Error ? e.message : 'נסה שוב'}`)
    } finally {
      setLoading(false)
    }
  }

  async function submitOutcome() {
    if (!sessionId || outcome === null) return
    await fetch(`/api/repair-history/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ worked: outcome === 'worked', actual_fix: actualFix }),
    })
    setOutcomeSubmitted(true)
  }

  function reset() {
    setStep('model'); setSelectedModel(''); setSelectedSystem(''); setSymptom('')
    setQuestions([]); setAnswers([]); setDiagnosis(null); setSessionId(null)
    setOutcome(null); setActualFix(''); setOutcomeSubmitted(false)
  }

  const stepNum = { model: 1, system: 2, symptom: 3, questions: 4, result: 5 }[step]

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Progress */}
      {step !== 'result' && (
        <div className="flex items-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className={`flex-1 h-1.5 rounded-full transition-all ${n <= stepNum ? 'bg-blue-500' : 'bg-slate-200'}`} />
          ))}
          <span className="text-xs text-slate-400 mr-2">{stepNum}/5</span>
        </div>
      )}

      {/* STEP 1: Model */}
      {step === 'model' && (
        <div className="space-y-4">
          <h1 className="text-xl font-bold text-slate-800">אבחון תקלה</h1>
          <p className="text-sm text-slate-500">שלב 1 — בחר דגם</p>

          {models.length > 0 && (
            <div className="space-y-2">
              {models.map(m => (
                <button key={m} onClick={() => { setSelectedModel(m); setStep('system') }}
                  className="w-full text-right px-4 py-3 rounded-xl font-medium text-sm transition-all"
                  style={{ background: selectedModel === m ? '#3B82F6' : '#FFFFFF', color: selectedModel === m ? '#fff' : '#1E293B', border: '1px solid #CBD5E1' }}>
                  {m}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4">
            <p className="text-xs text-slate-400 mb-2">דגם לא ברשימה?</p>
            <div className="flex gap-2">
              <input value={selectedModel} onChange={e => setSelectedModel(e.target.value)}
                placeholder="הקלד דגם..." className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#1E293B' }} />
              <button onClick={() => selectedModel && setStep('system')}
                disabled={!selectedModel}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40"
                style={{ background: '#3B82F6' }}>
                הבא <ChevronRight size={14} className="inline" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: System */}
      {step === 'system' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">שלב 2 — מערכת תקולה ({selectedModel})</p>
          <h2 className="text-lg font-bold text-slate-800">איזו מערכת?</h2>
          <div className="grid grid-cols-2 gap-2">
            {SYSTEMS.map(s => (
              <button key={s} onClick={() => { setSelectedSystem(s); setStep('symptom') }}
                className="py-4 rounded-xl font-semibold text-sm transition-all"
                style={{ background: '#FFFFFF', color: '#1E293B', border: '2px solid #CBD5E1' }}>
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => setStep('model')} className="text-sm text-slate-400 mt-2">← חזרה</button>
        </div>
      )}

      {/* STEP 3: Symptom */}
      {step === 'symptom' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">שלב 3 — תסמין ({selectedModel} / {selectedSystem})</p>
          <h2 className="text-lg font-bold text-slate-800">מה קורה?</h2>

          <div className="relative">
            <textarea value={symptom} onChange={e => setSymptom(e.target.value)}
              placeholder="תאר בקצרה מה לא עובד..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#1E293B', paddingLeft: 52 }} />
            <button
              onClick={recording ? stopVoice : startVoice}
              className="absolute left-3 top-3 p-2 rounded-lg transition-all"
              style={{ background: recording ? '#EF4444' : '#E2E8F0', color: recording ? '#fff' : '#64748B' }}>
              {recording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_SUGGESTIONS.slice(0, 8).map(s => (
              <button key={s} onClick={() => setSymptom(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: '#EEF2F7', color: '#334155' }}>
                {s}
              </button>
            ))}
          </div>

          <button onClick={loadQuestions} disabled={!symptom.trim() || loading}
            className="w-full py-4 rounded-xl font-semibold text-white disabled:opacity-40 text-base"
            style={{ background: '#3B82F6' }}>
            {loading ? 'מחשב שאלות...' : 'המשך לאבחון ←'}
          </button>
          <button onClick={() => setStep('system')} className="text-sm text-slate-400">← חזרה</button>
        </div>
      )}

      {/* STEP 4: Questions */}
      {step === 'questions' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">שלב 4 — שאלות מקדימות</p>
          <h2 className="text-lg font-bold text-slate-800">כמה שאלות לפני האבחון:</h2>

          {questions.length === 0 ? (
            <p className="text-sm text-slate-400">אין שאלות נוספות — ממשיכים לאבחון</p>
          ) : (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="rounded-xl p-4" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
                  <p className="text-sm font-medium text-slate-800 mb-3">{q}</p>
                  <div className="flex gap-2">
                    {['כן', 'לא', 'לא יודע'].map(opt => (
                      <button key={opt}
                        onClick={() => {
                          const next = [...answers]; next[i] = opt; setAnswers(next)
                        }}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                        style={answers[i] === opt
                          ? { background: '#3B82F6', color: '#fff' }
                          : { background: '#F1F5F9', color: '#475569' }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                  {answers[i] && answers[i] !== 'כן' && answers[i] !== 'לא' && answers[i] !== 'לא יודע' && (
                    <input className="mt-2 w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#1E293B' }}
                      value={answers[i]} onChange={e => { const next = [...answers]; next[i] = e.target.value; setAnswers(next) }}
                      placeholder="פרט..." />
                  )}
                </div>
              ))}
            </div>
          )}

          <button onClick={runDiagnosis} disabled={loading}
            className="w-full py-4 rounded-xl font-semibold text-white text-base"
            style={{ background: '#3B82F6' }}>
            {loading ? 'מאבחן...' : 'קבל אבחון ←'}
          </button>
          <button onClick={() => setStep('symptom')} className="text-sm text-slate-400">← חזרה</button>
        </div>
      )}

      {/* STEP 5: Result */}
      {step === 'result' && diagnosis && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">אבחון — {selectedModel}</h2>
            <button onClick={reset} className="p-2 rounded-lg" style={{ background: '#F1F5F9', color: '#64748B' }}>
              <RotateCcw size={18} />
            </button>
          </div>

          <p className="text-xs text-slate-400">{selectedSystem} | {symptom}</p>

          {/* Suspects */}
          <div className="space-y-3">
            {diagnosis.suspects?.map((s, i) => (
              <div key={i} className="rounded-xl p-4" style={{
                background: i === 0 ? 'rgba(59,130,246,0.06)' : '#FFFFFF',
                border: `1px solid ${i === 0 ? '#3B82F6' : '#CBD5E1'}`,
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm" style={{ color: '#1E293B' }}>
                    {i === 0 ? '🔴' : i === 1 ? '🟡' : '🟢'} {s.cause}
                  </span>
                  <span className="text-sm font-bold" style={{ color: i === 0 ? '#3B82F6' : '#64748B' }}>
                    {s.probability}%
                  </span>
                </div>
                <p className="text-sm text-slate-600">{s.explanation}</p>
                {s.page_ref && (
                  <p className="text-xs text-blue-500 mt-1">📄 {s.page_ref}</p>
                )}
              </div>
            ))}
          </div>

          {/* Quick test */}
          <div className="rounded-xl p-4" style={{ background: '#FFFBEB', border: '1px solid #F59E0B' }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} color="#F59E0B" />
              <span className="font-semibold text-sm text-amber-800">בדיקה מהירה קודם</span>
            </div>
            <p className="text-sm text-amber-900">{diagnosis.quick_test}</p>
          </div>

          {/* Decision tree */}
          {diagnosis.decision_tree && (
            <div className="rounded-xl p-4" style={{ background: '#F0FDF4', border: '1px solid #22C55E' }}>
              <p className="text-sm text-green-800" style={{ whiteSpace: 'pre-wrap' }}>{diagnosis.decision_tree}</p>
            </div>
          )}

          {/* Closing */}
          <p className="text-sm text-slate-500 italic">{diagnosis.closing}</p>

          {/* Outcome */}
          {!outcomeSubmitted ? (
            <div className="rounded-xl p-4 space-y-3" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
              <p className="text-sm font-semibold text-slate-700">אחרי שתסיים — עדכן אותי:</p>
              <div className="flex gap-2">
                <button onClick={() => setOutcome('worked')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
                  style={outcome === 'worked'
                    ? { background: 'rgba(34,197,94,0.15)', border: '2px solid #22C55E', color: '#15803D' }
                    : { background: '#F1F5F9', color: '#475569' }}>
                  <CheckCircle size={16} /> פתרון עבד
                </button>
                <button onClick={() => setOutcome('failed')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
                  style={outcome === 'failed'
                    ? { background: 'rgba(239,68,68,0.15)', border: '2px solid #EF4444', color: '#DC2626' }
                    : { background: '#F1F5F9', color: '#475569' }}>
                  <XCircle size={16} /> לא עבד
                </button>
              </div>
              {outcome === 'worked' && (
                <textarea value={actualFix} onChange={e => setActualFix(e.target.value)}
                  placeholder="מה בדיוק עשית? (יעזור לתיקונים עתידיים)"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                  style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#1E293B' }} />
              )}
              {outcome && (
                <button onClick={submitOutcome}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white"
                  style={{ background: '#3B82F6' }}>
                  שמור ←
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-xl p-4 text-center" style={{ background: '#F0FDF4', border: '1px solid #22C55E' }}>
              <p className="text-sm text-green-700 font-medium">תודה! המידע נשמר ויעזור לתיקונים עתידיים.</p>
            </div>
          )}

          <button onClick={reset} className="w-full py-3 rounded-xl text-sm font-medium"
            style={{ background: '#F1F5F9', color: '#475569' }}>
            אבחון חדש
          </button>
        </div>
      )}
    </div>
  )
}
