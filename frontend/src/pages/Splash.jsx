import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'

export default function Splash() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  useEffect(() => {
    const t = setTimeout(() => navigate('/welcome'), 2400)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-primary)] text-white relative overflow-hidden">
      <motion.svg
        width="120" height="120" viewBox="0 0 120 120"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.path
          d="M60 100 C60 70 60 50 60 20 M60 55 C40 45 30 30 25 15 M60 65 C80 55 90 40 95 25 M60 40 C45 32 38 22 35 12 M60 45 C75 37 82 27 85 15"
          stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"
          className="vein-path"
        />
        <motion.circle
          cx="60" cy="100" r="6" fill="var(--color-accent)"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8, type: 'spring' }}
        />
      </motion.svg>
      <motion.h1
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="font-display text-3xl font-bold mt-6"
      >
        KrishiSahay
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="mt-2 text-white/80 text-sm tracking-wide"
      >
        {t('tagline')}
      </motion.p>
      <motion.div
        initial={{ width: 0 }} animate={{ width: 160 }} transition={{ delay: 1.2, duration: 1 }}
        className="h-1 rounded-full bg-[var(--color-accent)] mt-8"
      />
    </div>
  )
}
