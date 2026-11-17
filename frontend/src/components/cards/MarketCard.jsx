import { TrendingUp, TrendingDown } from 'lucide-react'

export default function MarketCard({ item }) {
  const up = item.trend === 'up'
  return (
    <div className="flex items-center justify-between rounded-xl border border-current/10 px-4 py-3 hover:bg-current/5 transition-colors">
      <div>
        <p className="font-medium">{item.crop}</p>
        <p className="text-xs text-current/50">per {item.unit}</p>
      </div>
      <div className="text-right">
        <p className="font-mono-data font-semibold">₹{item.price.toLocaleString('en-IN')}</p>
        <p className={`text-xs flex items-center gap-1 justify-end ${up ? 'text-[var(--color-secondary)]' : 'text-red-500'}`}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(item.change)}%
        </p>
      </div>
    </div>
  )
}
