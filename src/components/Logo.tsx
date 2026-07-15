import { Link } from 'react-router-dom'

export function Logo({
  to = '/',
  compact = false,
  light = false,
}: {
  to?: string
  compact?: boolean
  light?: boolean
}) {
  return (
    <Link to={to} className="inline-flex shrink-0 select-none">
      <img
        src="/logo.png"
        alt="Хроматика"
        className={`w-auto object-contain ${compact ? 'h-8' : 'h-9 sm:h-10'} ${light ? 'brightness-0 invert' : ''}`}
      />
    </Link>
  )
}
