'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import {
  ArrowRight,
  BarChart3,
  Shield,
  ArrowLeftRight,
  Bell,
  MapPin,
  FileSpreadsheet,
  ChevronDown,
  Package,
  ClipboardList,
  Users,
  Layers,
  CheckCircle2,
  Zap,
  TrendingUp,
} from 'lucide-react'
import { LogoMark } from '@/components/shared/Logo'

// ─── Scroll-reveal hook ─────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, visible }
}

// ─── Animated counter ───────────────────────────────────────────────
function Counter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const { ref, visible } = useReveal(0.3)

  useEffect(() => {
    if (!visible) return
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [visible, end, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ─── Feature card ───────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  delay,
}: {
  icon: React.ElementType
  title: string
  description: string
  color: string
  delay: number
}) {
  const { ref, visible } = useReveal()

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'group-hover:border-blue-200' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'group-hover:border-emerald-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'group-hover:border-amber-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'group-hover:border-purple-200' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'group-hover:border-rose-200' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'group-hover:border-cyan-200' },
  }

  const c = colorMap[color] || colorMap.blue

  return (
    <div
      ref={ref}
      className={`group relative bg-white border border-gray-100 rounded-2xl p-6 transition-all duration-500 hover:shadow-lg hover:-translate-y-1 ${c.border} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${c.bg} ${c.text} mb-4 transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}

// ─── How-it-works step ──────────────────────────────────────────────
function Step({
  number,
  title,
  description,
  delay,
}: {
  number: number
  title: string
  description: string
  delay: number
}) {
  const { ref, visible } = useReveal()

  return (
    <div
      ref={ref}
      className={`relative flex gap-5 transition-all duration-600 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-200">
          {number}
        </div>
        {number < 4 && <div className="w-px flex-1 bg-gradient-to-b from-blue-200 to-transparent mt-2" />}
      </div>
      <div className="pb-10">
        <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// LANDING PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)
  const [navScrolled, setNavScrolled] = useState(false)

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      setNavScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  // If authenticated, show nothing (redirect is happening)
  if (isAuthenticated) return null

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden scroll-smooth">

      {/* ─── Navbar ────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navScrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm'
          : 'bg-transparent'
          }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
              <LogoMark size={32} />
            </div>
            <span className="text-lg font-bold tracking-tight">StockControl</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">How it Works</a>
            <a href="#stats" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Results</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-200 shadow-md shadow-blue-200/50 hover:shadow-lg hover:shadow-blue-300/40 hover:-translate-y-px active:translate-y-0"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white to-white" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          {/* Floating orbs */}
          <div
            className="absolute w-[500px] h-[500px] rounded-full bg-blue-200/30 blur-[120px] -top-32 -right-32 animate-pulse"
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full bg-purple-200/20 blur-[100px] top-1/2 -left-48 animate-pulse"
            style={{ animationDelay: '2s', transform: `translateY(${scrollY * 0.1}px)` }}
          />
          <div
            className="absolute w-[300px] h-[300px] rounded-full bg-emerald-200/20 blur-[80px] bottom-16 right-1/4 animate-pulse"
            style={{ animationDelay: '4s', transform: `translateY(${scrollY * 0.08}px)` }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center">


          {/* Title */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-slide-up"
          >
            Every unit tracked.
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Nothing lost.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up-delayed"
          >
            StockControl records every receipt, issue, and transfer as it happens — so your on-hand count is always the truth, not a guess typed into a spreadsheet.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up-delayed-2">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-300/40 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-300/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Start Tracking Now
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              View Demo
            </Link>
          </div>

          {/* Trust bar */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-gray-400 font-medium animate-fade-in-delayed">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Append-only ledger</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Role-based access</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Real-time alerts</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Multi-location</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <a href="#features" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors animate-bounce-slow cursor-pointer">
          <span className="text-xs font-medium">Explore</span>
          <ChevronDown className="w-4 h-4" />
        </a>
      </section>

      {/* ─── Features Grid ──────────────────────────────────────── */}
      <section id="features" className="py-24 sm:py-32 bg-gray-50/50 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything you need to <span className="text-blue-600">control inventory</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From receipts to transfers, from alerts to analytics — every tool your warehouse team needs in one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={ClipboardList}
              title="Append-Only Stock Ledger"
              description="Every movement is permanent. On-hand counts are derived from the ledger — never typed in directly. Full audit trail, always."
              color="blue"
              delay={0}
            />
            <FeatureCard
              icon={ArrowLeftRight}
              title="Receipts, Issues & Transfers"
              description="Record stock arriving, leaving, or moving between locations. Transfers are atomic — both sides update together or not at all."
              color="green"
              delay={100}
            />
            <FeatureCard
              icon={Bell}
              title="Low-Stock Alerts"
              description="Items below reorder level surface automatically. Dismiss alerts, and they reappear if stock dips below the threshold again."
              color="amber"
              delay={200}
            />
            <FeatureCard
              icon={MapPin}
              title="Multi-Location Tracking"
              description="Warehouses, retail floors, project sites — track stock per location and assign staff to the places they manage."
              color="purple"
              delay={300}
            />
            <FeatureCard
              icon={Shield}
              title="Role-Based Access"
              description="Managers control items, locations, and assignments. Staff record movements only at their assigned locations. Enforced on the server."
              color="rose"
              delay={400}
            />
            <FeatureCard
              icon={FileSpreadsheet}
              title="Bulk Import & Export"
              description="Import items and receipts from CSV with row-by-row error reports. Export your complete stock position any time."
              color="cyan"
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 sm:py-32 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-3">How It Works</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                From chaos to clarity in four steps
              </h2>
              <p className="text-gray-500 mb-10 max-w-md">
                No more spreadsheets drifting out of sync. No more phone-call records that never get logged.
              </p>

              <div>
                <Step
                  number={1}
                  title="Set up your locations"
                  description="Add your warehouse, retail floors, and project sites. Assign staff to the locations they manage."
                  delay={0}
                />
                <Step
                  number={2}
                  title="Create items & categories"
                  description="Add your inventory with SKUs, units of measure, and reorder levels. Organize with categories your team maintains."
                  delay={100}
                />
                <Step
                  number={3}
                  title="Record movements as they happen"
                  description="Log receipts when stock arrives, issues when it leaves, and transfers between locations — all in real time."
                  delay={200}
                />
                <Step
                  number={4}
                  title="Monitor, analyze, act"
                  description="Your dashboard shows live stock levels, alerts for low items, and 8-week movement trends — so you reorder before you run out."
                  delay={300}
                />
              </div>
            </div>

            {/* Visual card stack */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl -z-10" />
              <div className="space-y-4">
                {/* Mock dashboard card */}
                <DashboardPreviewCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Section ──────────────────────────────────────── */}
      <section id="stats" className="py-20 sm:py-28 bg-gray-900 text-white scroll-mt-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-400 tracking-wider uppercase mb-3">Built for Results</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Numbers that speak for themselves
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard label="Stock Accuracy" suffix="%" end={99} />
            <StatCard label="Faster Audits" suffix="x" end={10} />
            <StatCard label="Locations Managed" suffix="+" end={50} />
            <StatCard label="Uptime" suffix="%" end={99} />
          </div>
        </div>
      </section>

      {/* ─── Capabilities Bento ──────────────────────────────────── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-3">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Built for <span className="text-blue-600">real warehouse operations</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <BentoCard
              icon={<BarChart3 className="w-5 h-5" />}
              title="Live Dashboard"
              description="Active items, low-stock counts, today's movements, and weekly trends — all at a glance."
              gradient="from-blue-50 to-cyan-50"
              delay={0}
            />
            <BentoCard
              icon={<Layers className="w-5 h-5" />}
              title="Item History Timeline"
              description="See every field change, every note, every movement — an immutable timeline you can never rewrite."
              gradient="from-purple-50 to-pink-50"
              delay={100}
            />
            <BentoCard
              icon={<Users className="w-5 h-5" />}
              title="Staff & Assignments"
              description="Assign staff to specific locations. Managers act everywhere; staff only where they belong."
              gradient="from-amber-50 to-orange-50"
              delay={200}
            />
            <BentoCard
              icon={<Package className="w-5 h-5" />}
              title="Adjustments with Reasons"
              description="Fix miscounts with proper adjustment records. Every adjustment must have a reason — the server enforces it."
              gradient="from-emerald-50 to-teal-50"
              delay={300}
            />
            <BentoCard
              icon={<Zap className="w-5 h-5" />}
              title="Smart Search & Filters"
              description="Find any item with text search, category filters, location filters, stock-level checks — all server-side."
              gradient="from-rose-50 to-red-50"
              delay={400}
            />
            <BentoCard
              icon={<TrendingUp className="w-5 h-5" />}
              title="8-Week Movement Charts"
              description="Visualize receipt and issue volume over time. Spot trends, plan orders, and stay ahead of demand."
              gradient="from-sky-50 to-indigo-50"
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* ─── CTA Section ────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <div className="relative max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Ready to stop guessing<br />and start tracking?
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join teams who replaced spreadsheets with a real-time stock ledger. Set up in minutes, see the difference today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl border border-white/25 hover:bg-white/10 transition-all duration-200"
            >
              Sign In to Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <LogoMark size={32} />
                <span className="text-white font-bold text-lg">StockControl</span>
              </div>
              <p className="text-sm leading-relaxed">
                Enterprise inventory management that keeps every unit accounted for, across every location.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/items" className="hover:text-white transition-colors">Items</Link></li>
                <li><Link href="/movements" className="hover:text-white transition-colors">Movements</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/import-export" className="hover:text-white transition-colors">Import / Export</Link></li>
                <li><Link href="/alerts" className="hover:text-white transition-colors">Stock Alerts</Link></li>
                <li><Link href="/locations" className="hover:text-white transition-colors">Locations</Link></li>
                <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">Account</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
                <li><Link href="/settings" className="hover:text-white transition-colors">Settings</Link></li>
                <li><Link href="/suppliers" className="hover:text-white transition-colors">Suppliers</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs">© {new Date().getFullYear()} StockControl. All rights reserved.</p>
            <div className="flex gap-6 text-xs">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Inline Styles for Animations ──────────────────────── */}
      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-up-delayed {
          opacity: 0;
          animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
        }
        .animate-slide-up-delayed-2 {
          opacity: 0;
          animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
        }
        .animate-fade-in {
          opacity: 0;
          animation: fade-in 0.6s ease 0.1s forwards;
        }
        .animate-fade-in-delayed {
          opacity: 0;
          animation: fade-in 0.8s ease 0.6s forwards;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

// ─── Dashboard Preview Card (static visual) ─────────────────────────
function DashboardPreviewCard() {
  const { ref, visible } = useReveal()

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl border border-gray-200 shadow-xl p-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0 rotate-0' : 'opacity-0 translate-y-12 rotate-1'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-gray-400 font-medium">Dashboard Overview</p>
          <p className="text-sm font-bold text-gray-900">Today&apos;s Activity</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Live
        </div>
      </div>

      {/* Mock KPI row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Active Items', value: '1,247', color: 'text-blue-600' },
          { label: 'Low Stock', value: '23', color: 'text-amber-600' },
          { label: 'Movements Today', value: '86', color: 'text-emerald-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-gray-50 rounded-xl p-3 text-center">
            <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Mock chart bars */}
      <div className="mb-3">
        <p className="text-xs font-medium text-gray-500 mb-2">Weekly Movement Volume</p>
        <div className="flex items-end gap-1.5 h-20">
          {[40, 65, 45, 80, 55, 70, 90, 60].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all duration-500"
              style={{
                height: `${h}%`,
                transitionDelay: `${i * 80}ms`,
                opacity: visible ? 1 : 0,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-gray-300 mt-1">
          {['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'].map(w => (
            <span key={w} className="flex-1 text-center">{w}</span>
          ))}
        </div>
      </div>

      {/* Mock recent movements */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Recent Movements</p>
        <div className="space-y-1.5">
          {[
            { type: 'Receipt', item: 'Steel Bolts M10', qty: '+500', color: 'bg-emerald-100 text-emerald-700' },
            { type: 'Transfer', item: 'Safety Helmets', qty: '→ 24', color: 'bg-blue-100 text-blue-700' },
            { type: 'Issue', item: 'Copper Wire 2mm', qty: '-120', color: 'bg-rose-100 text-rose-700' },
          ].map((m) => (
            <div key={m.item} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${m.color}`}>{m.type}</span>
                <span className="text-xs text-gray-700">{m.item}</span>
              </div>
              <span className="text-xs font-mono font-semibold text-gray-600">{m.qty}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Stat Card ──────────────────────────────────────────────────────
function StatCard({ label, suffix, end }: { label: string; suffix: string; end: number }) {
  const { ref, visible } = useReveal()

  return (
    <div
      ref={ref}
      className={`text-center transition-all duration-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <p className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
        <Counter end={end} suffix={suffix} />
      </p>
      <p className="text-sm text-gray-400 font-medium">{label}</p>
    </div>
  )
}

// ─── Bento Card ─────────────────────────────────────────────────────
function BentoCard({
  icon,
  title,
  description,
  gradient,
  delay,
}: {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
  delay: number
}) {
  const { ref, visible } = useReveal()

  return (
    <div
      ref={ref}
      className={`group relative bg-gradient-to-br ${gradient} rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-10 h-10 rounded-xl bg-white/80 border border-gray-200/50 flex items-center justify-center text-gray-700 mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}
