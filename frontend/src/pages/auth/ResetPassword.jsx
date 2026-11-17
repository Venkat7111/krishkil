import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Lock } from 'lucide-react'
import { authAPI } from '@/services/api/authAPI'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { state } = useLocation()

  const email = (state?.email || sessionStorage.getItem('ks_reset_email') || '').trim()
  const otp = (state?.otp || sessionStorage.getItem('ks_reset_otp') || '').trim()

  const submit = async (e) => {
    e.preventDefault()
    if (!password) return setError('Please enter a new password')
    if (password !== confirm) return setError("Passwords don't match")
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (!email || !otp) {
      return setError('Session expired or missing verification code. Please request OTP again.')
    }

    setError('')
    setLoading(true)
    try {
      const res = await authAPI.resetPassword({
        email,
        otp,
        newPassword: password,
      })

      if (res.success) {
        sessionStorage.removeItem('ks_reset_email')
        sessionStorage.removeItem('ks_reset_otp')
        setSuccess(true)
        setTimeout(() => navigate('/login'), 1800)
      } else {
        setError(res.error || 'Password reset failed')
      }
    } catch (err) {
      setError(err.message || 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
        <CheckCircle2 className="w-16 h-16 text-[var(--color-secondary)] mx-auto mb-4" />
        <h2 className="font-display text-xl font-semibold">Password reset!</h2>
        <p className="text-sm text-current/60 mt-1">Redirecting you to login...</p>
      </motion.div>
    )
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-1">Reset password</h2>
      <p className="text-sm text-current/60 mb-6">Choose a new, strong password for your account.</p>
      <form onSubmit={submit} className="space-y-4">
        <Input label="New Password" type="password" icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Input label="Confirm Password" type="password" icon={Lock} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>Reset Password</Button>
      </form>
    </div>
  )
}
