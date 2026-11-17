import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
})

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().min(10, 'Enter a valid phone number'),
    country: z.string().min(1, 'Required'),
    state: z.string().min(1, 'Required'),
    district: z.string().min(1, 'Required'),
    village: z.string().min(1, 'Required'),
    preferredLanguage: z.string().min(1, 'Required'),
    password: z.string().min(6, 'At least 6 characters'),
    confirmPassword: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const passwordStrength = (password = '') => {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return Math.min(score, 4)
}
