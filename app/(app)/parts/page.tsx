'use client'

import { useState, useRef } from 'react'
import { Camera, Search, X, Package, Loader2 } from 'lucide-react'

type PartResult = { id: string; brand: string; part_number: string; description: string; model_compatibility: string[]; location_description: string | null; image_url: string | null }

export default function PartsPage() {
  const [query, setQuery] = useState('')
  const [image, setImage] = useState<{ base64: string; mimeType: string } | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [results, setResults] = useState<PartResult[]>([])
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImg(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setImage({ base64: dataUrl.split(',')[1], mimeType: file.type })
      setImagePreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  async function search() {
    if (!query.trim() && !image) return
    setLoading(true); setResults([]); setAnalysis('')
    try {
      const res = await fetch('/api/parts/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, image }),
      })
      const data = await res.json()
      setResults(data.parts || [])
      setAnalysis(data.analysis || '')
    } finally { setLoading(false) }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-4">זיהוי חלקים</h1>

      {/* Search box */}
      <div className="card p-3 mb-4">
        <div className="flex gap-2 mb-2">
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="מספר חלק, תיאור, דגם..."
            className="flex-1 text-sm px-3 py-2 rounded-xl outline-none"
            style={{ background: '#243347', color: '#F1F5F9', border: '1px solid #334155' }} />
          <button onClick={search} disabled={loading}
            className="p-2 rounded-xl disabled:opacity-40"
            style={{ background: '#3B82F6', color: '#fff' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl"
            style={{ background: '#243347', color: '#94A3B8' }}>
            <Camera size={15} /> צלם חלק
          </button>
          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="" className="h-10 w-10 rounded-lg object-cover" />
              <button onClick={() => { setImage(null); setImagePreview('') }}
                className="absolute -top-1 -right-1 rounded-full w-4 h-4 flex items-center justify-center"
                style={{ background: '#EF4444' }}>
                <X size={9} color="white" />
              </button>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImg} />
      </div>

      {/* AI Analysis */}
      {analysis && (
        <div className="rounded-xl p-3 mb-4 text-sm" style={{ background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.3)', color: '#93C5FD' }}>
          {analysis}
        </div>
      )}

      {/* Results */}
      {results.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold" style={{ color: '#94A3B8' }}>תוצאות ({results.length})</h2>
          {results.map(part => (
            <div key={part.id} className="card p-3 flex gap-3">
              {part.image_url
                ? <img src={part.image_url} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                : <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#243347' }}>
                    <Package size={22} style={{ color: '#3B82F6' }} />
                  </div>
              }
              <div>
                <div className="font-bold text-sm text-white">{part.part_number}</div>
                <div className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>{part.description}</div>
                {part.model_compatibility?.length > 0 && (
                  <div className="text-xs mt-1" style={{ color: '#64748B' }}>מודלים: {part.model_compatibility.join(', ')}</div>
                )}
                {part.location_description && (
                  <div className="text-xs mt-0.5" style={{ color: '#60A5FA' }}>מיקום: {part.location_description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : !loading && !analysis && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(59,130,246,.15)' }}>
            <Package size={32} style={{ color: '#3B82F6' }} />
          </div>
          <p className="text-white font-semibold mb-1">זיהוי חלקים חכם</p>
          <p className="text-sm" style={{ color: '#64748B' }}>חפש לפי מספר חלק או צלם תמונה</p>
        </div>
      )}
    </div>
  )
}
