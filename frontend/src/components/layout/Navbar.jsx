import { useState } from 'react'
import { Menu, Search, Bell, Sun, Moon, Globe, CloudSun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage, LANGUAGES } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { Link } from 'react-router-dom'

export default function Navbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme()
  const { language, changeLanguage, t } = useLanguage()
  const { user } = useAuth()
  const [langOpen, setLangOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 glass border-b border-current/10 px-4 sm:px-6 py-3 flex items-center gap-4">
      <button className="lg:hidden" onClick={onMenuClick}><Menu className="w-5 h-5" /></button>

      <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md bg-current/5 rounded-xl px-3 py-2">
        <Search className="w-4 h-4 text-current/40" />
        <input placeholder={t('navbar.search')} className="bg-transparent outline-none text-sm w-full" />
      </div>

      <div className="flex-1 sm:flex-none" />

      <div className="hidden md:flex items-center gap-1 text-sm text-current/60">
        <CloudSun className="w-4 h-4 text-[var(--color-accent)]" /> 29°C, Warangal
      </div>

      <div className="relative">
        <button onClick={() => setLangOpen((o) => !o)} className="p-2 rounded-lg hover:bg-current/5 flex items-center gap-1">
          <Globe className="w-5 h-5" />
        </button>
        {langOpen && (
          <div className="absolute right-0 mt-2 w-36 glass rounded-xl p-1 shadow-lg">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => { changeLanguage(l.code); setLangOpen(false) }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm hover:bg-current/5 ${language === l.code ? 'text-[var(--color-primary)] font-medium' : ''}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-current/5">
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <button className="p-2 rounded-lg hover:bg-current/5 relative">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-accent)]" />
      </button>

      <Link to="/app/profile" className="w-9 h-9 rounded-full bg-[var(--color-secondary)]/20 flex items-center justify-center font-display font-semibold text-[var(--color-primary)] shrink-0">
        {user?.name?.[0] || 'G'}
      </Link>
    </header>
  )
}
