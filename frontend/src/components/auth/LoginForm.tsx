'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validation/schemas'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, User } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const { addToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)

    try {
      await login(data.email, data.password)
      addToast({
        title: 'Welcome back!',
        description: 'Authentication successful. Redirecting to dashboard...',
        type: 'success',
      })
      router.push('/dashboard')
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Invalid email or password'
      addToast({
        title: 'Login failed',
        description: errorMessage,
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Quick fill helper for testing
  const handleQuickFill = (role: 'manager' | 'staff') => {
    if (role === 'manager') {
      setValue('email', 'manager@inventory.com', { shouldValidate: true })
      setValue('password', 'Password123!', { shouldValidate: true })
    } else {
      setValue('email', 'staff1@inventory.com', { shouldValidate: true })
      setValue('password', 'Password123!', { shouldValidate: true })
    }
  }

  return (
    <div className="space-y-6">
      {/* Demo Credentials Helper Pill */}
      <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-2">
        <div className="flex items-center justify-between font-semibold">
          <span className="flex items-center gap-1.5 text-blue-800">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Quick Demo Logins
          </span>
          <span className="text-[11px] text-blue-500 font-normal">Click to autofill</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('manager')}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-blue-200 hover:border-blue-400 text-blue-700 font-medium transition-all shadow-2xs hover:bg-blue-50/50"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Manager</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('staff')}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-blue-200 hover:border-blue-400 text-blue-700 font-medium transition-all shadow-2xs hover:bg-blue-50/50"
          >
            <User className="w-3.5 h-3.5" />
            <span>Staff Operator</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="name@company.com"
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
            Password
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
          {errors.password && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
            <input
              {...register('rememberMe')}
              type="checkbox"
              className="w-4 h-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Remember this device</span>
          </label>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
