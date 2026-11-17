import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { authAPI } from '@/services/api/authAPI'
import { useToast } from '@/components/common/Toast'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.sendOtp(email)
      showToast('OTP sent to your email', 'success')
      navigate('/otp-verification', { state: { email } })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-1">Forgot password?</h2>
      <p className="text-sm text-current/60 mb-6">Enter your email and we'll send you a one-time code.</p>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" type="email" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Button type="submit" className="w-full" loading={loading}>Send OTP</Button>
      </form>
      <p className="text-sm text-center text-current/60 mt-6">
        <Link to="/login" className="text-[var(--color-primary)] font-medium hover:underline">Back to login</Link>
      </p>
    </div>
  )
}
