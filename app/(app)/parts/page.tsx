'use client'

import { useState, useRef } from 'react'
import { Camera, Search, X, Package } from 'lucide-react'

type PartResult = {
  id: string
  brand: string
  part_number: string
  description: string
  model_compatibility: string[]
  location_description: string | null
  image_url: string | null
}

export default function PartsPage() {
  const [query, setQuery] = useState('')
  const [image, setImage] = useState<{ base64: string; mimeType: string } | null>(null)
  const [results, setResults] = useState<PartResult[]>([])
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      setImage({ base64, mimeType: file.type })
    }
    reader.readAsDataURL(file)
  }

  async function search() {
    if (!query.trim() && !image) return
    setLoading(true)
    setResults([])
    setAiAnalysis('')
    try {
      const res = await fetch('/api/parts/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, image }),
      })
      const data = await res.json()
      setResults(data.parts || [])
      setAiAnalysis(data.analysis || '')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">זיהוי חלקים</h1>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 mb-4">
        <div className="flex gap-2 mb-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="מספר חלק, תיאור, מודל..."
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={search} disabled={loading} className="p-2 bg-blue-600 text-white rounded-lg">
            <Search size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-lg"
          >
            <Camera size={16} />
            צלם חלק
          </button>
          {image && (
            <div className="relative">
              <img
                src={`data:${image.mimeType};base64,${image.base64}`}
                alt=""
                className="h-10 w-10 rounded object-cover"
              />
              <button
                onClick={() => setImage(null)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
              >
                <X size={10} />
              </button>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 text-slate-500 text-sm">מחפש ומנתח...</div>
      )}

      {/* AI Analysis */}
      {aiAnalysis && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-800">
          {aiAnalysis}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-slate-700">תוצאות ({results.length})</h2>
          {results.map(part => (
            <div key={part.id} className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="flex gap-3">
                {part.image_url ? (
                  <img src={part.image_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Package size={24} className="text-slate-300" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-sm">{part.part_number}</div>
                  <div className="text-sm text-slate-600 mt-0.5">{part.description}</div>
                  {part.brand && <div className="text-xs text-slate-500 mt-0.5">מותג: {part.brand}</div>}
                  {part.model_compatibility?.length > 0 && (
                    <div className="text-xs text-slate-500">מודלים: {part.model_compatibility.join(', ')}</div>
                  )}
                  {part.location_description && (
                    <div className="text-xs text-blue-600 mt-0.5">מיקום: {part.location_description}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && !aiAnalysis && (
        <div className="text-center py-16 text-slate-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">חפש לפי מספר חלק או צלם תמונה</p>
        </div>
      )}
    </div>
  )
}
