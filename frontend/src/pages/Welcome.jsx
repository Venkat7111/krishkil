import { useNavigate } from 'react-router-dom'
import { Sprout, Sun, Moon, Leaf, CloudSun, LineChart } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage, LANGUAGES } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/common/Button'

export default function Welcome() {
  const { theme, toggleTheme } = useTheme()
  const { language, changeLanguage, t } = useLanguage()
  const { continueAsGuest } = useAuth()
  const navigate = useNavigate()

  const handleGuest = () => {
    continueAsGuest()
    navigate('/app')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Sprout className="w-7 h-7 text-[var(--color-primary)]" />
          <span className="font-display font-bold text-lg">KrishiSahay</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-transparent border border-current/15 rounded-lg text-sm px-2 py-1.5 outline-none"
          >
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-current/5">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="flex-1 grid lg:grid-cols-2 gap-10 items-center px-6 max-w-6xl mx-auto w-full py-8">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
            {t('welcome.heroLine1')} <span className="text-[var(--color-primary)]">{t('welcome.heroLine2')}</span>
          </h1>
          <p className="mt-4 text-current/60 text-lg">
            {t('welcome.subtitle')}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate('/login')}>{t('welcome.login')}</Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/register')}>{t('welcome.register')}</Button>
            <Button size="lg" variant="ghost" onClick={handleGuest}>{t('welcome.guest')}</Button>
          </div>

          <div className="mt-10 flex gap-6 text-sm text-current/60">
            <span className="flex items-center gap-1.5"><Leaf className="w-4 h-4 text-[var(--color-secondary)]" /> {t('welcome.featureDisease')}</span>
            <span className="flex items-center gap-1.5"><CloudSun className="w-4 h-4 text-[var(--color-accent)]" /> {t('welcome.featureWeather')}</span>
            <span className="flex items-center gap-1.5"><LineChart className="w-4 h-4 text-[var(--color-primary)]" /> {t('welcome.featureMarket')}</span>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <svg viewBox="0 0 400 400" className="w-full h-auto">
            <circle cx="200" cy="200" r="180" fill="var(--color-secondary)" opacity="0.08" />
            <path
              d="M200 340 C200 260 200 180 200 80 M200 200 C150 170 110 130 90 70 M200 230 C260 200 300 150 320 90 M200 130 C165 110 140 80 125 45 M200 150 C240 130 265 100 280 60"
              stroke="var(--color-primary)" strokeWidth="6" strokeLinecap="round" fill="none"
            />
            <circle cx="200" cy="340" r="12" fill="var(--color-accent)" />
          </svg>
        </div>
      </main>
    </div>
  )
}
