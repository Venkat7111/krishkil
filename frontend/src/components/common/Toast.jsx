import { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = { success: CheckCircle2, error: XCircle, info: Info }
const COLORS = {
  success: 'border-[var(--color-secondary)] text-[var(--color-primary-dark)]',
  error: 'border-red-400 text-red-500',
  info: 'border-[var(--color-accent)] text-current',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type]
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                className={`glass border-l-4 rounded-xl p-3 flex items-start gap-2 shadow-lg ${COLORS[t.type]}`}
              >
                <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm flex-1">{t.message}</p>
                <button onClick={() => dismiss(t.id)}><X className="w-4 h-4 opacity-50 hover:opacity-100" /></button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
