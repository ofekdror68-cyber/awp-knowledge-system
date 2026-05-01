'use client'

import { useState, useEffect, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { FileText, Upload, X, Search, ExternalLink, Eye, CheckCircle, Loader } from 'lucide-react'
import { format } from 'date-fns'

type Doc = {
  id: string
  machine_brand: string | null
  machine_model: string | null
  doc_type: string
  title: string
  file_url: string | null
  uploaded_at: string
  vision_analyzed: boolean | null
  page_count: number | null
}

const TYPE_LABELS: Record<string, string> = { manual: 'מדריך', schematic: 'סכמה', parts_catalog: 'קטלוג חלקים', fault_codes: 'קודי תקלות', other: 'אחר' }
const BRANDS = ['JLG', 'Manitou', 'Dingli', 'Genie', 'BT', 'אחר']

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', machine_brand: '', machine_model: '', doc_type: 'manual', file: null as File | null })
  const fileRef = useRef<HTMLInputElement>(null)
  const sb = getSupabaseClient()

  async function load() {
    const { data } = await sb.from('documents').select('*').order('uploaded_at', { ascending: false })
    setDocs((data || []) as Doc[]); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = docs.filter(d => !filter ||
    d.title.toLowerCase().includes(filter.toLowerCase()) ||
    d.machine_brand?.toLowerCase().includes(filter.toLowerCase()) ||
    d.machine_model?.toLowerCase().includes(filter.toLowerCase()))

  const grouped = filtered.reduce((acc, d) => {
    const key = d.machine_brand || 'אחר'
    if (!acc[key]) acc[key] = []
    acc[key].push(d)
    return acc
  }, {} as Record<string, Doc[]>)

  async function upload() {
    if (!form.file || !form.title) return
    setUploading(true)
    try {
      const toBase64 = (f: File) => new Promise<string>(r => { const reader = new FileReader(); reader.onload = () => r((reader.result as string).split(',')[1]); reader.readAsDataURL(f) })
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, brand: form.machine_brand, model: form.machine_model, doc_type: form.doc_type, filename: form.file.name, fileBase64: await toBase64(form.file), mimeType: form.file.type }),
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ title: '', machine_brand: '', machine_model: '', doc_type: 'manual', file: null })
        load()
      } else {
        const err = await res.json()
        alert(`שגיאה בהעלאה: ${err.error || 'נסה שוב'}`)
      }
    } finally { setUploading(false) }
  }

  async function processVision(docId: string) {
    setProcessingId(docId)
    try {
      const res = await fetch('/api/documents/process-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId }),
      })
      const data = await res.json()
      if (data.ok) {
        alert(`עיבוד הושלם: ${data.pagesProcessed} עמודים, ${data.schematicPages} סכמות`)
        load()
      } else {
        alert(`שגיאה: ${data.error || 'נסה שוב'}`)
      }
    } finally { setProcessingId(null) }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold" style={{ color: '#1E293B' }}>מסמכים טכניים</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#3B82F6' }}>
          <Upload size={15} /> העלה
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="חפש מסמך, דגם..."
          className="w-full pr-9 pl-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: '#FFFFFF', color: '#1E293B', border: '1px solid #CBD5E1' }} />
      </div>

      {/* Stats */}
      <div className="rounded-xl p-3 mb-4 flex gap-4 text-center" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <div className="flex-1">
          <div className="text-xl font-bold" style={{ color: '#1E293B' }}>{docs.length}</div>
          <div className="text-xs" style={{ color: '#64748B' }}>מסמכים</div>
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold" style={{ color: '#3B82F6' }}>{Object.keys(grouped).length}</div>
          <div className="text-xs" style={{ color: '#64748B' }}>מותגים</div>
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold" style={{ color: '#22C55E' }}>{docs.filter(d => d.vision_analyzed).length}</div>
          <div className="text-xs" style={{ color: '#64748B' }}>עם vision</div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-7 w-7" style={{ border: '2px solid #3B82F6', borderTopColor: 'transparent' }} />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(59,130,246,.15)' }}>
            <FileText size={32} style={{ color: '#3B82F6' }} />
          </div>
          <p className="font-semibold" style={{ color: '#1E293B' }}>אין מסמכים</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([brand, brandDocs]) => (
            <div key={brand}>
              <div className="text-xs font-bold uppercase mb-2 px-1" style={{ color: '#3B82F6', letterSpacing: 1 }}>{brand}</div>
              <div className="space-y-2">
                {brandDocs.map(doc => (
                  <div key={doc.id} className="rounded-xl p-3 flex items-center gap-3" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59,130,246,.15)' }}>
                      {doc.vision_analyzed ? <CheckCircle size={17} style={{ color: '#22C55E' }} /> : <FileText size={17} style={{ color: '#3B82F6' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: '#1E293B' }}>{doc.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                        {[doc.machine_model, TYPE_LABELS[doc.doc_type]].filter(Boolean).join(' • ')}
                        {doc.page_count ? ` • ${doc.page_count} עמ'` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {doc.file_url && !doc.vision_analyzed && (
                        <button
                          onClick={() => processVision(doc.id)}
                          disabled={processingId === doc.id}
                          className="p-1.5 rounded-lg text-xs flex items-center gap-1"
                          style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}
                          title="עבד עם Vision">
                          {processingId === doc.id ? <Loader size={14} className="animate-spin" /> : <Eye size={14} />}
                        </button>
                      )}
                      {doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg" style={{ color: '#3B82F6' }}>
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,.7)' }}>
          <div className="w-full rounded-t-2xl p-5 space-y-3 max-h-[90vh] overflow-y-auto" style={{ background: '#FFFFFF' }}>
            <div className="flex justify-between items-center">
              <h2 className="font-bold" style={{ color: '#1E293B' }}>העלאת מסמך</h2>
              <button onClick={() => setShowForm(false)} style={{ color: '#64748B' }}><X size={20} /></button>
            </div>
            <input placeholder="שם *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: '#EEF2F7', color: '#1E293B', border: '1px solid #CBD5E1' }} />
            <div className="flex gap-2">
              <select value={form.machine_brand} onChange={e => setForm(f => ({ ...f, machine_brand: e.target.value }))}
                className="flex-1 px-3 py-2 rounded-xl text-sm" style={{ background: '#EEF2F7', color: '#1E293B', border: '1px solid #CBD5E1' }}>
                <option value="">מותג</option>
                {BRANDS.map(b => <option key={b}>{b}</option>)}
              </select>
              <input placeholder="דגם" value={form.machine_model} onChange={e => setForm(f => ({ ...f, machine_model: e.target.value }))}
                className="flex-1 px-3 py-2 rounded-xl text-sm" style={{ background: '#EEF2F7', color: '#1E293B', border: '1px solid #CBD5E1' }} />
            </div>
            <select value={form.doc_type} onChange={e => setForm(f => ({ ...f, doc_type: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm" style={{ background: '#EEF2F7', color: '#1E293B', border: '1px solid #CBD5E1' }}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button onClick={() => fileRef.current?.click()} className="w-full py-3 rounded-xl text-sm" style={{ border: '2px dashed #CBD5E1', color: '#64748B' }}>
              {form.file ? form.file.name : '+ בחר קובץ'}
            </button>
            <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={e => setForm(f => ({ ...f, file: e.target.files?.[0] || null }))} />
            <button onClick={upload} disabled={!form.file || !form.title || uploading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50"
              style={{ background: '#3B82F6' }}>
              {uploading ? 'מעלה...' : 'העלה'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
