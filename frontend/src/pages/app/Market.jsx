import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { MapPin, Sparkles } from 'lucide-react'
import MarketCard from '@/components/cards/MarketCard'
import Card from '@/components/common/Card'
import { marketAPI } from '@/services/api/marketAPI'

export default function Market() {
  const [prices, setPrices] = useState([])
  const [markets, setMarkets] = useState([])
  const [trend, setTrend] = useState([])

  useEffect(() => {
    marketAPI.getPrices().then(setPrices)
    marketAPI.getNearbyMarkets().then(setMarkets)
    marketAPI.getTrend().then(setTrend)
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Market</h1>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-display font-semibold mb-3">Crop Prices</h3>
          <div className="space-y-2">
            {prices.map((p) => <MarketCard key={p.crop} item={p} />)}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Nearby Markets</h3>
            <div className="space-y-2">
              {markets.map((m) => (
                <div key={m.name} className="flex justify-between text-sm">
                  <span>{m.name}</span>
                  <span className="text-current/50">{m.distanceKm} km</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display font-semibold mb-1">Sell Recommendation</h3>
              <p className="text-sm text-current/70">Cotton prices are trending up — consider holding for 5-7 more days before selling.</p>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <h3 className="font-display font-semibold mb-3">Cotton Price Trend (6 months)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
