import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CloudSun, Sprout, MessageCircle, LineChart, Landmark, ListChecks,
  ScanEye, Droplets, FlaskConical, FileBarChart2,
} from 'lucide-react'
import Card from '@/components/common/Card'
import WeatherCard from '@/components/cards/WeatherCard'
import { weatherAPI } from '@/services/api/weatherAPI'
import { marketAPI } from '@/services/api/marketAPI'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'

const TASKS = [
  { id: 1, label: 'Apply second dose of urea to Field 2', done: false },
  { id: 2, label: 'Check drip irrigation line for leaks', done: false },
  { id: 3, label: 'Photograph tomato leaves showing spots', done: true },
]

export default function Dashboard() {
  const { user, isGuest } = useAuth()
  const { t } = useLanguage()
  const [weather, setWeather] = useState(null)
  const [prices, setPrices] = useState([])

  useEffect(() => {
    weatherAPI.getCurrent().then(setWeather)
    marketAPI.getPrices().then((p) => setPrices(p.slice(0, 3)))
  }, [])

  const QUICK_ACTIONS = [
    { label: t('dashboard.uploadLeaf'), to: '/app/disease-detection', icon: ScanEye },
    { label: t('dashboard.askAi'), to: '/app/chat', icon: MessageCircle },
    { label: t('dashboard.cropPick'), to: '/app/crop-recommendation', icon: Sprout },
    { label: t('dashboard.irrigation'), to: '/app/irrigation', icon: Droplets },
    { label: t('dashboard.fertilizer'), to: '/app/fertilizer', icon: FlaskConical },
    { label: t('dashboard.reports'), to: '/app/reports', icon: FileBarChart2 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">
          {isGuest ? t('dashboard.greetingGuest') : `${t('dashboard.greetingUser')}, ${user?.name?.split(' ')[0] || 'Farmer'}`} 🌾
        </h1>
        <p className="text-current/60 text-sm mt-1">{t('dashboard.subtitle')}</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-current/60 mb-3">{t('dashboard.quickActions')}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map(({ label, to, icon: Icon }, i) => (
            <motion.div key={to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={to} className="flex flex-col items-center gap-2 glass rounded-2xl p-4 hover:-translate-y-0.5 transition-transform">
                <Icon className="w-6 h-6 text-[var(--color-primary)]" />
                <span className="text-xs text-center text-current/70">{label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <WeatherCard data={weather} />

        <Card leaf>
          <div className="flex items-center gap-2 mb-3">
            <Sprout className="w-5 h-5 text-[var(--color-secondary)]" />
            <h3 className="font-display font-semibold">{t('dashboard.cropHealth')}</h3>
          </div>
          <p className="text-3xl font-display font-bold text-[var(--color-primary)]">Good</p>
          <p className="text-sm text-current/60 mt-1">2 fields monitored · no active alerts</p>
        </Card>

        <Card leaf>
          <div className="flex items-center gap-2 mb-3">
            <LineChart className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="font-display font-semibold">{t('dashboard.marketPrices')}</h3>
          </div>
          <div className="space-y-2">
            {prices.map((p) => (
              <div key={p.crop} className="flex justify-between text-sm">
                <span className="text-current/70">{p.crop}</span>
                <span className="font-mono-data font-medium">₹{p.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <Link to="/app/market" className="text-xs text-[var(--color-primary)] hover:underline mt-3 inline-block">{t('dashboard.viewAllPrices')}</Link>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="w-5 h-5 text-[var(--color-primary)]" />
            <h3 className="font-display font-semibold">{t('dashboard.todaysTasks')}</h3>
          </div>
          <ul className="space-y-2">
            {TASKS.map((t2) => (
              <li key={t2.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked={t2.done} className="rounded" readOnly />
                <span className={t2.done ? 'line-through text-current/40' : 'text-current/80'}>{t2.label}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Landmark className="w-5 h-5 text-[var(--color-clay)]" />
            <h3 className="font-display font-semibold">{t('dashboard.govtSchemes')}</h3>
          </div>
          <p className="text-sm text-current/70">PM-KISAN 6th installment credited this week for eligible farmers.</p>
          <Link to="/app/schemes" className="text-xs text-[var(--color-primary)] hover:underline mt-3 inline-block">{t('dashboard.browseSchemes')}</Link>
        </Card>
      </div>
    </div>
  )
}
