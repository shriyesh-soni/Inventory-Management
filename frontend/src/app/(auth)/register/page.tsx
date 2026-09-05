import Link from 'next/link'
import { LogoMark } from '@/components/shared/Logo'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md space-y-6 p-4">
      <div className="flex flex-col items-center text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <LogoMark size={40} />
          <span className="text-2xl font-bold text-gray-900 tracking-tight">
            StockControl
          </span>
        </Link>
        <h1 className="text-xl font-semibold text-gray-800">
          Create an account
        </h1>
        <p className="text-sm text-gray-500">
          Get started with modern inventory & stock management
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <RegisterForm />
      </div>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-700 underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
