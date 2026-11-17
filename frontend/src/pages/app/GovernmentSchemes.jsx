import { useEffect, useState } from 'react'
import { Search, Bookmark, BookmarkCheck, FileText } from 'lucide-react'
import Card from '@/components/common/Card'
import Skeleton from '@/components/common/Skeleton'
import { schemeAPI } from '@/services/api/schemeAPI'

export default function GovernmentSchemes() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [categories, setCategories] = useState(['All'])
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState([])

  useEffect(() => {
    schemeAPI.categories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => {
      schemeAPI.list({ q: query || undefined, category })
        .then(setSchemes)
        .catch(() => setSchemes([]))
        .finally(() => setLoading(false))
    }, 250) // debounce search-as-you-type
    return () => clearTimeout(timeout)
  }, [query, category])

  const toggleSave = (id) => setSaved((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Government Schemes</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-current/5 rounded-xl px-3 py-2 flex-1">
          <Search className="w-4 h-4 text-current/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search schemes..." className="bg-transparent outline-none text-sm w-full" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-xs px-3 py-2 rounded-xl whitespace-nowrap ${category === c ? 'bg-[var(--color-primary)] text-white' : 'bg-current/5 hover:bg-current/10'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : schemes.length === 0 ? (
        <p className="text-sm text-current/50 text-center py-10">No schemes match your search.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {schemes.map((s) => (
            <Card key={s.id} leaf>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-semibold">{s.name}</h3>
                  <p className="text-xs text-[var(--color-primary)] mt-0.5">{s.category}</p>
                </div>
                <button onClick={() => toggleSave(s.id)} className="text-current/50 hover:text-[var(--color-accent)]">
                  {saved.includes(s.id) ? <BookmarkCheck className="w-5 h-5 text-[var(--color-accent)]" /> : <Bookmark className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-sm text-current/70 mt-3">{s.description}</p>
              <p className="text-sm text-current/70 mt-2"><strong>Eligibility:</strong> {s.eligibility}</p>
              <p className="text-sm text-current/70 mt-1"><strong>Documents:</strong> {s.documents}</p>
              <button className="text-xs text-[var(--color-primary)] hover:underline mt-3 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> View application guide
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
