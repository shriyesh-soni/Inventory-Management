import Link from 'next/link'
import { LogoMark } from '@/components/shared/Logo'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
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
          Sign in to your account
        </h1>
        <p className="text-sm text-gray-500">
          Enter your credentials to access the inventory dashboard
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <LoginForm />
      </div>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-blue-600 hover:text-blue-700 underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
