import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const Input = forwardRef(function Input(
  { label, error, type = 'text', icon: Icon, className = '', ...props },
  ref
) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1.5 text-current/80">{label}</label>
      )}
      <div className="relative">
        {Icon && <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-current/40" />}
        <input
          ref={ref}
          type={inputType}
          className={`w-full rounded-xl border bg-transparent px-4 py-2.5 text-sm outline-none transition-colors
            ${Icon ? 'pl-9' : ''}
            ${error ? 'border-red-400 focus:border-red-500' : 'border-current/15 focus:border-[var(--color-secondary)]'}
            ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-current/40 hover:text-current/70"
            tabIndex={-1}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
})

export default Input
