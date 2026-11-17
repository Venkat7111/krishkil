import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock } from 'lucide-react'
import { loginSchema } from '@/utils/validation'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/common/Toast'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'

export default function Login() {
  const { login, continueAsGuest } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  })

  const onSubmit = async (data) => {
    setServerError('')
    try {
      await login(data)
      showToast('Welcome back!', 'success')
      navigate('/app')
    } catch (e) {
      setServerError(e.message || 'Login failed')
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-1">Welcome back</h2>
      <p className="text-sm text-current/60 mb-6">Log in to continue growing smarter.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" icon={Lock} placeholder="••••••••" error={errors.password?.message} {...register('password')} />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-current/70">
            <input type="checkbox" {...register('remember')} className="rounded" /> Remember me
          </label>
          <Link to="/forgot-password" className="text-[var(--color-primary)] hover:underline">Forgot password?</Link>
        </div>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <Button type="submit" className="w-full" loading={isSubmitting}>Login</Button>
        <Button type="button" variant="ghost" className="w-full" onClick={() => { continueAsGuest(); navigate('/app') }}>
          Continue as Guest
        </Button>
      </form>

      <p className="text-sm text-center text-current/60 mt-6">
        Don't have an account? <Link to="/register" className="text-[var(--color-primary)] font-medium hover:underline">Register</Link>
      </p>
    </div>
  )
}
