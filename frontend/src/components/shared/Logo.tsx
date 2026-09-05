/**
 * StockControl Logo Mark
 *
 * A custom SVG logo representing stacked inventory cards with ledger lines.
 * Used across the app: sidebar, navbar, login, register, landing page, and not-found.
 */

interface LogoMarkProps {
  size?: number
  className?: string
}

export function LogoMark({ size = 32, className = '' }: LogoMarkProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        {/* Back card — offset for depth */}
        <rect x="8" y="2" width="17" height="20" rx="3" fill="white" opacity="0.2" />
        {/* Front card */}
        <rect x="3" y="6" width="17" height="20" rx="3" fill="white" opacity="0.9" />
        {/* Ledger lines */}
        <rect x="7" y="11.5" width="9" height="1.5" rx="0.75" fill="#2563eb" opacity="0.7" />
        <rect x="7" y="15.5" width="7" height="1.5" rx="0.75" fill="#2563eb" opacity="0.45" />
        <rect x="7" y="19.5" width="5" height="1.5" rx="0.75" fill="#2563eb" opacity="0.25" />
      </svg>
    </div>
  )
}

interface LogoProps {
  markSize?: number
  showText?: boolean
  textClass?: string
  className?: string
}

export function Logo({
  markSize = 32,
  showText = true,
  textClass = 'text-gray-900',
  className = '',
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={markSize} />
      {showText && (
        <span className={`text-lg font-bold tracking-tight ${textClass}`}>
          StockControl
        </span>
      )}
    </span>
  )
}
