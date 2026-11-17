import { Link } from 'react-router-dom'
import { Sprout } from 'lucide-react'
import Button from '@/components/common/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <Sprout className="w-14 h-14 text-[var(--color-primary)] mb-4" />
      <h1 className="font-display text-3xl font-bold">Field not found</h1>
      <p className="text-current/60 mt-2 mb-6">This page hasn't been planted yet.</p>
      <Link to="/"><Button>Back to home</Button></Link>
    </div>
  )
}
