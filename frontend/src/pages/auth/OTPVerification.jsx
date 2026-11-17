import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authAPI } from '@/services/api/authAPI'
import { useToast } from '@/components/common/Toast'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { Mail } from 'lucide-react'

export default function OTPVerification() {
  const [digits, setDigits] = useState(Array(6).fill(''))
  const [seconds, setSeconds] = useState(60)
  const [loading, setLoading] = useState(false)
  const refs = useRef([])
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { state } = useLocation()

  // Fallback to sessionStorage if navigated directly or refreshed
  const initialEmail = state?.email || sessionStorage.getItem('ks_reset_email') || ''
  const [email, setEmail] = useState(initialEmail)

  useEffect(() => {
    if (initialEmail) {
      sessionStorage.setItem('ks_reset_email', initialEmail)
    }
  }, [initialEmail])

  useEffect(() => {
    if (seconds <= 0) return
    const t = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [seconds])

  const handleChange = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const verify = async () => {
    const targetEmail = (email || '').trim()
    const otp = digits.join('').trim()

    if (!targetEmail) {
      showToast('Please enter your email address', 'error')
      return
    }

    if (otp.length < 6) {
      showToast('Please enter all 6 digits of the OTP', 'error')
      return
    }

    setLoading(true)
    try {
      const res = await authAPI.verifyOtp(targetEmail, otp)
      if (res.verified) {
        sessionStorage.setItem('ks_reset_email', targetEmail)
        sessionStorage.setItem('ks_reset_otp', otp)
        showToast('OTP verified successfully', 'success')
        navigate('/reset-password', { state: { email: targetEmail, otp } })
      } else {
        showToast(res.error || 'Invalid or expired OTP', 'error')
      }
    } catch (err) {
      showToast(err.message || 'Verification failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    const targetEmail = (email || '').trim()
    if (!targetEmail) {
      showToast('Please enter your email address first', 'error')
      return
    }
    const res = await authAPI.sendOtp(targetEmail)
    if (res.sent) {
      setSeconds(60)
      showToast('New OTP sent to ' + targetEmail, 'info')
    } else {
      showToast(res.error || 'Failed to resend OTP', 'error')
    }
  }

  return (
    <div className="text-center">
      <h2 className="font-display text-2xl font-semibold mb-1">Verify OTP</h2>
      <p className="text-sm text-current/60 mb-6">
        Enter the 6-digit verification code sent to <strong className="text-[var(--color-primary)]">{email || 'your email'}</strong>
      </p>

      {!initialEmail && (
        <div className="mb-4 text-left">
          <Input
            label="Confirm Email"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="farmer@example.com"
            required
          />
        </div>
      )}

      <div className="flex justify-center gap-2 mb-6">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            maxLength={1}
            inputMode="numeric"
            className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-current/15 bg-transparent outline-none focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/20"
          />
        ))}
      </div>

      <Button className="w-full" loading={loading} onClick={verify}>
        Verify OTP
      </Button>

      <p className="text-sm text-current/60 mt-4">
        {seconds > 0 ? (
          `Resend OTP in ${seconds}s`
        ) : (
          <button type="button" onClick={resend} className="text-[var(--color-primary)] font-medium hover:underline">
            Resend OTP
          </button>
        )}
      </p>
    </div>
  )
}
