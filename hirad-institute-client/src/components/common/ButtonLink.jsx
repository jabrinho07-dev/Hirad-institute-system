import { Link } from 'react-router-dom'

const variants = {
  gold: 'bg-gold-500 text-navy-950 hover:bg-gold-400',
  outlineLight:
    'border border-white/35 text-white hover:border-gold-400 hover:text-gold-400',
  navy: 'bg-navy-900 text-white hover:bg-navy-800',
  outline:
    'border border-navy-900/15 bg-white text-navy-900 hover:border-gold-600',
}

export default function ButtonLink({
  to,
  children,
  variant = 'gold',
  className = '',
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center px-5 py-3 text-sm font-semibold tracking-wide transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  )
}
