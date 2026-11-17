import { useEffect, useState } from 'react'
import { Newspaper, ExternalLink, RefreshCw, Search, Rss, Calendar, Tag } from 'lucide-react'
import Card from '@/components/common/Card'
import Skeleton from '@/components/common/Skeleton'
import Button from '@/components/common/Button'
import { newsAPI } from '@/services/api/newsAPI'

export default function News() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')

  const load = (refresh = false, query = search) => {
    refresh ? setRefreshing(true) : setLoading(true)
    setError(false)
    newsAPI.list({ limit: 25, refresh, search: query })
      .then((data) => setItems(data))
      .catch(() => setError(true))
      .finally(() => { setLoading(false); setRefreshing(false) })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      load(false, search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-[var(--color-primary)]" /> Farming & Agricultural News
          </h1>
          <p className="text-current/60 text-sm mt-1">
            Real-time news and advisories aggregated from major agricultural RSS feeds (Down To Earth, Krishi Jagran, FAO, ICAR).
          </p>
        </div>
        <Button variant="outline" icon={RefreshCw} loading={refreshing} onClick={() => load(true, search)}>
          Refresh RSS Feeds
        </Button>
      </div>

      {/* Search & Feed Sources */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-current/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search news, topics, crops..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-current/15 bg-transparent focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs text-current/60">
          <span className="font-semibold flex items-center gap-1"><Rss className="w-3.5 h-3.5 text-amber-500" /> RSS Sources:</span>
          <span className="px-2 py-0.5 rounded-md bg-current/5 font-medium">Down To Earth</span>
          <span className="px-2 py-0.5 rounded-md bg-current/5 font-medium">Krishi Jagran</span>
          <span className="px-2 py-0.5 rounded-md bg-current/5 font-medium">FAO</span>
          <span className="px-2 py-0.5 rounded-md bg-current/5 font-medium">ICAR</span>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : error || items.length === 0 ? (
        <Card className="text-center py-12 space-y-2">
          <p className="text-base font-semibold">No news articles found</p>
          <p className="text-xs text-current/60">
            {search ? `No articles matching "${search}". Try searching for another keyword.` : "Couldn't load headlines. Try clicking Refresh RSS Feeds."}
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noreferrer" className="group">
              <Card leaf className="h-full hover:-translate-y-1 transition-all border border-current/10 hover:border-[var(--color-primary)]/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      {item.source}
                    </span>
                    {item.category && (
                      <span className="text-xs font-medium text-current/50 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-current/40" /> {item.category}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-semibold leading-snug group-hover:text-[var(--color-primary)] transition-colors">
                    {item.title}
                  </h3>
                  {item.summary && (
                    <p className="text-xs text-current/65 mt-2 line-clamp-3 leading-relaxed">
                      {item.summary.replace(/<[^>]+>/g, '')}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-current/10 text-xs text-current/40">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 opacity-60" /> {item.published || 'Today'}
                  </span>
                  <span className="text-[var(--color-primary)] font-medium flex items-center gap-1 group-hover:underline">
                    Read Article <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

