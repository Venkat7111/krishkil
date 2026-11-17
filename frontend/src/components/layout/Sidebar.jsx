import { NavLink } from 'react-router-dom'
import { Sprout, LogOut, X } from 'lucide-react'
import { SIDEBAR_LINKS } from '@/constants/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth()
  const { t } = useLanguage()

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-40 glass border-r border-current/10 flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <Sprout className="w-7 h-7 text-[var(--color-primary)]" />
            <span className="font-display font-bold text-lg">KrishiSahay</span>
          </div>
          <button className="lg:hidden" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          {SIDEBAR_LINKS.map(({ to, key, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white font-medium'
                    : 'text-current/70 hover:bg-current/5'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {t(key)}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-current/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full text-red-500 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" /> {t('nav.logout')}
          </button>
        </div>
      </aside>
    </>
  )
}
