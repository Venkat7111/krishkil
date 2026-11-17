import { useEffect, useState } from 'react'
import { Search, Download, FlaskConical, Leaf, ShieldCheck, FileText, Sprout, CheckCircle2, Sparkles, BookOpen } from 'lucide-react'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import { chatAPI } from '@/services/api/chatAPI'

const DEFAULT_NPK = [
  { label: 'Nitrogen (N)', value: 40, unit: 'kg/acre', color: 'var(--color-primary)' },
  { label: 'Phosphorus (P)', value: 30, unit: 'kg/acre', color: 'var(--color-secondary)' },
  { label: 'Potassium (K)', value: 35, unit: 'kg/acre', color: 'var(--color-accent)' },
]

export default function Fertilizer() {
  const [searchQuery, setSearchQuery] = useState('')
  const [popDocs, setPopDocs] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCropFilter, setSelectedCropFilter] = useState('All')

  useEffect(() => {
    fetchPoP()
  }, [])

  const fetchPoP = async (crop = null) => {
    setLoading(true)
    const data = await chatAPI.getPackageOfPractices(crop === 'All' ? null : crop)
    setPopDocs(data)
    setLoading(false)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      fetchPoP(selectedCropFilter)
      return
    }
    setLoading(true)
    const searchRes = await chatAPI.searchPoP(searchQuery, selectedCropFilter === 'All' ? null : selectedCropFilter)
    if (searchRes && searchRes.length > 0) {
      setPopDocs(searchRes)
    } else {
      setPopDocs([])
    }
    setLoading(false)
  }

  const CROPS_LIST = ['All', 'Rice (Paddy)', 'Wheat', 'Cotton', 'Maize', 'Tomato', 'Chilli', 'Groundnut', 'Pulses', 'Sugarcane']

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Title & Download Handbook Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold">Fertilizer & Package of Practices</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Verified PoP Database
            </span>
          </div>
          <p className="text-current/60 text-sm mt-1">
            Search crop fertilizer schedules, NPK dosages, chemical & bio-pesticide recommendations, and download the full PoP PDF handbook.
          </p>
        </div>

        <a
          href={chatAPI.getPoPPdfUrl(selectedCropFilter)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button icon={Download} variant="primary">
            Download PoP PDF Handbook
          </Button>
        </a>
      </div>

      {/* Interactive NPK Quick Overview Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {DEFAULT_NPK.map((n) => (
          <Card key={n.label} leaf className="text-center">
            <p className="text-3xl font-mono-data font-bold" style={{ color: n.color }}>{n.value}</p>
            <p className="text-sm text-current/60 mt-1">{n.label} ({n.unit})</p>
          </Card>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--color-primary)]" /> Search Package of Practices & Pesticides
          </h3>

          {/* Crop Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            {CROPS_LIST.map((crop) => (
              <button
                key={crop}
                onClick={() => {
                  setSelectedCropFilter(crop)
                  fetchPoP(crop)
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors ${
                  selectedCropFilter === crop
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'bg-current/5 hover:bg-current/10 border border-current/10'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-current/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by fertilizer (Urea, DAP, MOP), disease (Blight, Rust), pesticide, or crop..."
              className="w-full bg-current/5 border border-current/10 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <Button type="submit" size="sm" icon={Search}>
            Search PoP
          </Button>
        </form>
      </Card>

      {/* Package of Practices Document Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-current/50 glass rounded-2xl">
            Loading Package of Practices data...
          </div>
        ) : popDocs.length > 0 ? (
          popDocs.map((doc) => (
            <Card key={doc.id || doc.title} leaf className="space-y-3">
              <div className="flex items-start justify-between gap-3 border-b border-current/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-current">{doc.title}</h3>
                    <p className="text-xs text-current/50">Crop: <strong className="text-current/80">{doc.crop}</strong></p>
                  </div>
                </div>

                <a
                  href={chatAPI.getPoPPdfUrl(doc.crop)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg border border-current/15 text-xs font-semibold hover:bg-current/5 flex items-center gap-1 shrink-0"
                >
                  <FileText className="w-3.5 h-3.5" /> PDF Guide
                </a>
              </div>

              <div className="text-sm leading-relaxed whitespace-pre-line text-current/80 bg-current/5 p-4 rounded-xl font-mono-data border border-current/10">
                {doc.content}
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-center text-current/60 space-y-2">
            <p className="font-semibold text-base">No Package of Practices found for '{searchQuery}'</p>
            <p className="text-xs">Try searching for keywords like "Paddy", "Urea", "DAP", "Blight", "Cotton", or "Mancozeb".</p>
            <Button size="sm" variant="outline" onClick={() => { setSearchQuery(''); fetchPoP('All'); }}>
              Reset Search
            </Button>
          </Card>
        )}
      </div>

      {/* Safety Instructions */}
      <Card className="flex items-start gap-3 border-l-4 border-red-400">
        <ShieldCheck className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-display font-semibold mb-1">Fertilizer & Pesticide Safety Instructions</h3>
          <p className="text-sm text-current/70">
            Always wear protective gloves, long sleeves, and a face mask while handling chemical fertilizers or spraying pesticides. Apply split Nitrogen doses according to crop stages and keep all chemicals away from children and farm animals.
          </p>
        </div>
      </Card>
    </div>
  )
}
