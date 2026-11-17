import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="glass leaf-corner max-w-md w-full p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">{title}</h3>
              <button onClick={onClose} className="text-current/50 hover:text-current"><X className="w-5 h-5" /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
