'use client'

import React from 'react'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Box } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-3">
            <Box className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">StockControl</h1>
          <p className="text-xs text-blue-200/70 mt-1">
            Enterprise Inventory & Warehouse Stock Control System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Create Staff Account</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Register new operator credentials for inventory operations
            </p>
          </div>

          <RegisterForm />

          <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
