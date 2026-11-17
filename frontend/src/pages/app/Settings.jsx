import { Moon, Globe, Bell, Lock, Info, HelpCircle, MessageSquareHeart, Sun } from 'lucide-react'
import Card from '@/components/common/Card'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage, LANGUAGES } from '@/context/LanguageContext'

function Row({ icon: Icon, label, control }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-current/10 last:border-0">
      <span className="flex items-center gap-3 text-sm"><Icon className="w-4 h-4 text-current/50" /> {label}</span>
      {control}
    </div>
  )
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { language, changeLanguage, t } = useLanguage()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold">{t('nav.settings')}</h1>

      <Card>
        <Row
          icon={theme === 'dark' ? Moon : Sun}
          label={t('settings.darkMode')}
          control={
            <button
              onClick={toggleTheme}
              className={`w-11 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-[var(--color-primary)]' : 'bg-current/20'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          }
        />
        <Row
          icon={Globe}
          label={t('settings.language')}
          control={
            <select value={language} onChange={(e) => changeLanguage(e.target.value)} className="bg-transparent border border-current/15 rounded-lg text-sm px-2 py-1 outline-none">
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          }
        />
        <Row icon={Bell} label={t('settings.notifications')} control={<input type="checkbox" defaultChecked className="rounded" />} />
        <Row icon={Lock} label={t('settings.privacy')} control={<span className="text-xs text-current/40">Manage →</span>} />
      </Card>

      <Card>
        <Row icon={Info} label={t('settings.about')} control={<span className="text-xs text-current/40">v1.0.0</span>} />
        <Row icon={HelpCircle} label={t('settings.help')} control={<span className="text-xs text-current/40">→</span>} />
        <Row icon={MessageSquareHeart} label={t('settings.feedback')} control={<span className="text-xs text-current/40">→</span>} />
      </Card>
    </div>
  )
}
