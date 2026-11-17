import { Outlet } from 'react-router-dom'
import { Sprout } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[var(--color-secondary)]/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[var(--color-accent)]/10 blur-3xl" />
      <div className="w-full max-w-md relative">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sprout className="w-8 h-8 text-[var(--color-primary)]" />
          <span className="font-display font-bold text-xl">KrishiSahay</span>
        </div>
        <div className="glass leaf-corner p-7 shadow-xl">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
