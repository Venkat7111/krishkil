import { CloudSun, Droplets, Wind } from 'lucide-react'
import Card from '@/components/common/Card'

export default function WeatherCard({ data }) {
  if (!data) return null
  return (
    <Card leaf className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-current/50">{data.location}</p>
          <p className="font-display text-4xl font-semibold mt-1">{data.tempC}°C</p>
          <p className="text-sm text-current/60">{data.condition}</p>
        </div>
        <CloudSun className="w-12 h-12 text-[var(--color-accent)]" />
      </div>
      <div className="mt-4 flex gap-4 text-sm text-current/70">
        <span className="flex items-center gap-1"><Droplets className="w-4 h-4 text-[var(--color-secondary)]" /> {data.humidity}%</span>
        <span className="flex items-center gap-1"><Wind className="w-4 h-4 text-[var(--color-secondary)]" /> {data.windKph} km/h</span>
      </div>
    </Card>
  )
}
