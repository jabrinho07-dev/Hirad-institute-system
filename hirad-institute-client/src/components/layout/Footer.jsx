import { Link } from 'react-router-dom'
import { primaryNav } from '../../data/navigation'
import { brand } from '../../data/site'
import Container from '../common/Container'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gold-500/40 bg-navy-950 text-white">
      <Container className="grid gap-10 py-12 sm:py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-serif text-2xl tracking-wide">{brand.name}</p>
          <p className="mt-3 text-sm leading-relaxed text-gold-400">{brand.tagline}</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            {brand.statement}
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
            Explore
          </p>
          <ul className="mt-4 space-y-2">
            {primaryNav.slice(0, 2).map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-white/75 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/services"
                className="text-sm text-white/75 transition-colors hover:text-white"
              >
                Services
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Services">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
            Services
          </p>
          <ul className="mt-4 space-y-2">
            {primaryNav.slice(2).map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-white/75 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      <div className="border-t border-white/10">
        <Container className="py-5">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-400">
            © {year} {brand.name}
          </p>
        </Container>
      </div>
    </footer>
  )
}
