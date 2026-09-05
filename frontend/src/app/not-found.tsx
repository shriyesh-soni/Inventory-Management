import Link from 'next/link'
import { ArrowLeft, Wrench, HardHat } from 'lucide-react'
import { LogoMark } from '@/components/shared/Logo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Navbar */}
      <nav className="px-6 h-16 flex items-center border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5 group">
          <LogoMark size={32} />
          <span className="text-lg font-bold tracking-tight text-gray-900">StockControl</span>
        </Link>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          {/* Animated illustration */}
          <div className="relative mb-10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-blue-100/60 blur-3xl animate-pulse" />
            </div>

            <div className="relative inline-flex items-center justify-center">
              {/* Orbiting dots */}
              <div className="absolute w-36 h-36 animate-spin-slow">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-blue-400" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400" />
              </div>

              {/* Center icon */}
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-200/50">
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-md animate-bounce-gentle">
                  <Wrench className="w-4 h-4 text-amber-900" />
                </div>
                <HardHat className="w-10 h-10 text-white/90" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
            Work in Progress
          </h1>
          <p className="text-gray-500 mb-2 leading-relaxed">
            This page is currently under construction. Our team is building something great here — check back soon!
          </p>
          <p className="text-sm text-gray-400 mb-8">
            In the meantime, head back to the dashboard or explore what&apos;s already available.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow-md shadow-blue-200/50 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-sm"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
          </div>

          {/* Progress bar */}
          <div className="mt-12 max-w-xs mx-auto">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Building progress</span>
              <span className="font-mono">42%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-progress-bar"
                style={{ width: '42%' }}
              />
            </div>
            <p className="text-[10px] text-gray-300 mt-2 font-mono">
              ETA: Coming soon™
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes progress-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        .animate-progress-bar {
          animation: progress-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
