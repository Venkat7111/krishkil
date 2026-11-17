import { createContext, useContext, useMemo, useState } from 'react'
import { resolve } from '@/constants/translations'

const LanguageContext = createContext(null)

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'hi', label: 'हिंदी' },
]

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('ks_lang') || 'en')

  const changeLanguage = (code) => {
    setLanguage(code)
    localStorage.setItem('ks_lang', code)
  }

  // t('nav.dashboard') -> translated string for the active language
  const t = useMemo(() => (key) => resolve(language, key), [language])

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
