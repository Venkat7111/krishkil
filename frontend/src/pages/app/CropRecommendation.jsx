import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Sprout, TrendingUp, Coins } from 'lucide-react'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import Loader from '@/components/common/Loader'
import { cropAPI } from '@/services/api/cropAPI'

const FIELDS = [
  { name: 'soilType', label: 'Soil Type' },
  { name: 'nitrogen', label: 'Nitrogen (N)' },
  { name: 'phosphorus', label: 'Phosphorus (P)' },
  { name: 'potassium', label: 'Potassium (K)' },
  { name: 'temperature', label: 'Temperature (°C)' },
  { name: 'humidity', label: 'Humidity (%)' },
  { name: 'rainfall', label: 'Rainfall (mm)' },
  { name: 'ph', label: 'Soil pH' },
  { name: 'location', label: 'Location' },
]

export default function CropRecommendation() {
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const update = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await cropAPI.recommend(form)
    setResult(res)
    setLoading(false)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Crop Recommendation</h1>
        <p className="text-current/60 text-sm mt-1 mb-5">Enter your soil and climate data for an AI-matched crop.</p>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          {FIELDS.map((f) => (
            <Input key={f.name} label={f.label} value={form[f.name] || ''} onChange={(e) => update(f.name, e.target.value)} />
          ))}
          <Button type="submit" className="col-span-2 mt-2" loading={loading} icon={Sprout}>Get Recommendation</Button>
        </form>
      </div>

      <div>
        {loading && <Loader label="Matching your soil profile..." />}
        {result && !loading && (
          <div className="space-y-4">
            <Card leaf className="text-center">
              <p className="text-xs uppercase tracking-wide text-current/50">Best Match</p>
              <p className="font-display text-3xl font-bold text-[var(--color-primary)] mt-1">{result.crop}</p>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div>
                  <p className="text-current/50 flex items-center gap-1 justify-center"><TrendingUp className="w-4 h-4" /> Confidence</p>
                  <p className="font-mono-data font-semibold text-lg">{result.confidence}%</p>
                </div>
                <div>
                  <p className="text-current/50">Expected Yield</p>
                  <p className="font-mono-data font-semibold text-lg">{result.expectedYield}</p>
                </div>
                <div>
                  <p className="text-current/50 flex items-center gap-1 justify-center"><Coins className="w-4 h-4" /> Profit</p>
                  <p className="font-mono-data font-semibold text-lg">{result.estimatedProfit}</p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-display font-semibold mb-3">Nutrient Profile</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={result.npkChart}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--color-secondary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 className="font-display font-semibold mb-3">Alternatives</h3>
              <div className="space-y-2">
                {result.alternatives.map((a) => (
                  <div key={a.crop} className="flex justify-between text-sm">
                    <span>{a.crop}</span>
                    <span className="text-current/60">{a.confidence}% · {a.yield}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
