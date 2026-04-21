'use client'

import { useState, useEffect, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { FileText, Upload, X, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'

type Document = {
  id: string
  machine_brand: string | null
  machine_model: string | null
  doc_type: string
  title: string
  file_url: string | null
  uploaded_at: string
}

const DOC_TYPES: Record<string, string> = {
  manual: 'מדריך',
  schematic: 'שמאטיקה',
  parts_catalog: 'קטלוג חלקים',
  fault_codes: 'קודי תקלות',
  other: 'אחר',
}

const BRANDS = ['JLG', 'Manitou', 'Dingli', 'Genie', 'אחר']

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = getSupabaseClient()

  const [form, setForm] = useState({
    title: '',
    machine_brand: '',
    machine_model: '',
    doc_type: 'manual',
    file: null as File | null,
  })

  async function fetchDocs() {
    const { data } = await supabase.from('documents').select('*').order('uploaded_at', { ascending: false })
    setDocuments(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchDocs() }, [])

  async function uploadDocument() {
    if (!form.file || !form.title) return
    setUploading(true)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          brand: form.machine_brand,
          model: form.machine_model,
          doc_type: form.doc_type,
          filename: form.file.name,
          fileBase64: await toBase64(form.file),
          mimeType: form.file.type,
        }),
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ title: '', machine_brand: '', machine_model: '', doc_type: 'manual', file: null })
        fetchDocs()
      }
    } finally {
      setUploading(false)
    }
  }

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string).split(',')[1])
      reader.readAsDataURL(file)
    })
  }

  const filtered = documents.filter(d =>
    !filter || d.machine_brand?.toLowerCase().includes(filter.toLowerCase()) ||
    d.machine_model?.toLowerCase().includes(filter.toLowerCase()) ||
    d.title.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">מסמכים</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
        >
          <Upload size={16} />
          העלה
        </button>
      </div>

      {/* Filter */}
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="חפש לפי מותג, דגם, שם..."
        className="w-full mb-4 px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Upload form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-bold">העלאת מסמך</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <input
              placeholder="שם המסמך *"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none"
            />

            <div className="flex gap-2">
              <select
                value={form.machine_brand}
                onChange={e => setForm(f => ({ ...f, machine_brand: e.target.value }))}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none bg-white"
              >
                <option value="">מותג</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <input
                placeholder="דגם"
                value={form.machine_model}
                onChange={e => setForm(f => ({ ...f, machine_model: e.target.value }))}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none"
              />
            </div>

            <select
              value={form.doc_type}
              onChange={e => setForm(f => ({ ...f, doc_type: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none bg-white"
            >
              {Object.entries(DOC_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>

            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500"
            >
              {form.file ? form.file.name : '+ בחר קובץ PDF'}
            </button>
            <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden"
              onChange={e => setForm(f => ({ ...f, file: e.target.files?.[0] || null }))}
            />

            <button
              onClick={uploadDocument}
              disabled={!form.file || !form.title || uploading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
            >
              {uploading ? 'מעלה ומעבד...' : 'העלה ועבד'}
            </button>
          </div>
        </div>
      )}

      {/* Documents list */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">אין מסמכים</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{doc.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {[doc.machine_brand, doc.machine_model, DOC_TYPES[doc.doc_type]].filter(Boolean).join(' • ')}
                </div>
                <div className="text-xs text-slate-400">{format(new Date(doc.uploaded_at), 'dd/MM/yyyy')}</div>
              </div>
              {doc.file_url && (
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 font-medium">
                  פתח
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
