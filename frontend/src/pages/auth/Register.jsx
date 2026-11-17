import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Mail, Phone, MapPin, Lock } from 'lucide-react'
import { registerSchema, passwordStrength } from '@/utils/validation'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/common/Toast'
import { LANGUAGES } from '@/context/LanguageContext'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'

const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent']
const STRENGTH_COLORS = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-[var(--color-secondary)]', 'bg-[var(--color-primary)]']

export default function Register() {
  const { register: registerUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      country: 'India',
      state: 'Telangana',
      district: '',
      village: '',
      preferredLanguage: 'en',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  })

  const strength = passwordStrength(password)

  const onSubmit = async (data) => {
    try {
      await registerUser(data)
      showToast('Account created successfully!', 'success')
      navigate('/app')
    } catch (e) {
      showToast(e.message || 'Registration failed', 'error')
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-1">Create your account</h2>
      <p className="text-sm text-current/60 mb-6">Tell us about your farm to get tailored advice.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full Name" icon={User} error={errors.fullName?.message} {...register('fullName')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Email" type="email" icon={Mail} error={errors.email?.message} {...register('email')} />
          <Input label="Phone Number" icon={Phone} error={errors.phone?.message} {...register('phone')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Country" icon={MapPin} defaultValue="India" error={errors.country?.message} {...register('country')} />
          <Input label="State" icon={MapPin} defaultValue="Telangana" error={errors.state?.message} {...register('state')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="District" icon={MapPin} error={errors.district?.message} {...register('district')} />
          <Input label="Village" icon={MapPin} error={errors.village?.message} {...register('village')} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-current/80">Preferred Language</label>
          <select {...register('preferredLanguage')} className="w-full rounded-xl border border-current/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-[var(--color-secondary)]">
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>

        <Input
          label="Password" type="password" icon={Lock}
          error={errors.password?.message}
          {...register('password', { onChange: (e) => setPassword(e.target.value) })}
        />
        {password && (
          <div className="-mt-2">
            <div className="flex gap-1 h-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`flex-1 rounded-full ${i <= strength ? STRENGTH_COLORS[strength] : 'bg-current/10'}`} />
              ))}
            </div>
            <p className="text-xs text-current/50 mt-1">{STRENGTH_LABELS[strength]}</p>
          </div>
        )}
        <Input label="Confirm Password" type="password" icon={Lock} error={errors.confirmPassword?.message} {...register('confirmPassword')} />

        <label className="flex items-start gap-2 text-sm text-current/70">
          <input type="checkbox" className="mt-0.5 rounded" {...register('terms')} />
          I agree to the Terms & Conditions and Privacy Policy
        </label>
        {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}

        <Button type="submit" className="w-full" loading={isSubmitting}>Create Account</Button>
      </form>

      <p className="text-sm text-center text-current/60 mt-6">
        Already have an account? <Link to="/login" className="text-[var(--color-primary)] font-medium hover:underline">Login</Link>
      </p>
    </div>
  )
}
