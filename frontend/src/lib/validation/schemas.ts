import { z } from 'zod'

/**
 * Login Form Validation Schema
 * Validates: Requirements 11.1, 9.7
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Registration Form Validation Schema
 * Validates: Requirements 11.2, 11.6, 10.8
 * 
 * Password requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export const registerSchema = z
  .object({
    email: z.string().email('Invalid email format'),
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[!@#$%^&*]/,
        'Password must contain at least one special character (!@#$%^&*)'
      ),
    confirmPassword: z.string(),
    role: z.enum(['MANAGER', 'STAFF']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
