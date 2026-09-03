'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '@/lib/validation/schemas'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { apiPost } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Mail,
  Lock,
  User,
  Shield,
  Loader2,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react'
import type { ApiResponse, AuthResponse } from '@/types/api'

function calculatePasswordStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score += 25
  if (/[A-Z]/.test(password)) score += 25
  if (/[0-9]/.test(password)) score += 25
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 25
  return score
}

function getStrengthColor(strength: number): string {
  if (strength <= 25) return 'bg-rose-500'
  if (strength <= 50) return 'bg-amber-500'
  if (strength <= 75) return 'bg-blue-500'
  return 'bg-emerald-500'
}

function getStrengthLabel(strength: number): string {
  if (strength <= 25) return 'Weak (Add length & special characters)'
  if (strength <= 50) return 'Fair (Add uppercase & numbers)'
  if (strength <= 75) return 'Good'
  return 'Strong Password'
}

export function RegisterForm() {
  const router = useRouter()
  const { login } = useAuth()
  const { addToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
      role: 'STAFF',
    },
  })

  const passwordValue = watch('password') || ''
  const selectedRole = watch('role')

  const passwordStrength = useMemo(
    () => calculatePasswordStrength(passwordValue),
    [passwordValue]
  )

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)

    try {
      await apiPost<ApiResponse<AuthResponse>>('/auth/register', {
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role,
      })

      // Automatically sign in
      await login(data.email, data.password)

      addToast({
        title: 'Account Created',
        description: `Welcome to StockControl, ${data.name}! Redirecting...`,
        type: 'success',
      })

      router.push('/dashboard')
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Registration failed. Please try again.'

      addToast({
        title: 'Registration failed',
        description: errorMessage,
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            {...register('name')}
            id="name"
            type="text"
            placeholder="Sarah Connor"
            disabled={isSubmitting}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          Work Email <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            {...register('email')}
            id="email"
            type="email"
            placeholder="s.connor@inventory.com"
            disabled={isSubmitting}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          Password <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            {...register('password')}
            id="password"
            type="password"
            placeholder="••••••••"
            disabled={isSubmitting}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-mono"
          />
        </div>

        {/* Password Strength Meter */}
        {passwordValue && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500">Strength</span>
              <span className="font-semibold text-gray-700">{getStrengthLabel(passwordStrength)}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                style={{ width: `${passwordStrength}%` }}
              />
            </div>
          </div>
        )}

        {errors.password && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          Confirm Password <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            {...register('confirmPassword')}
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            disabled={isSubmitting}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-mono"
          />
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Role Selection */}
      <div>
        <label htmlFor="role" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          Initial Role <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Shield className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            {...register('role')}
            id="role"
            disabled={isSubmitting}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="STAFF">Staff Operator</option>
            <option value="MANAGER">Manager (Authorized)</option>
          </select>
        </div>

        {selectedRole === 'MANAGER' && (
          <div className="mt-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Note: If manager accounts already exist in the database, new manager accounts must be created by an active manager via <strong>Users Management</strong>.
            </p>
          </div>
        )}

        {errors.role && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{errors.role.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Creating Account...</span>
          </>
        ) : (
          <>
            <span>Complete Registration</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </form>
  )
}
