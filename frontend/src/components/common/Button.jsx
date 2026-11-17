import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]',
  secondary: 'bg-[var(--color-secondary)] text-white hover:brightness-95',
  accent: 'bg-[var(--color-accent)] text-soil hover:brightness-95',
  ghost: 'bg-transparent text-current border border-current/20 hover:bg-current/5',
  outline: 'bg-transparent border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  ...props
}) {
  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-6 py-3',
  }
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
    </motion.button>
  )
}
