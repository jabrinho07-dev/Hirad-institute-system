import { Landmark, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { primaryNav, serviceNav } from '../../data/navigation'
import { brand } from '../../data/site'

function isCurrent(to, pathname, hash, activeSection) {
  if (to === '/') return pathname === '/'
  if (to === '/about') return pathname === '/about'

  const [path, id] = to.split('#')
  if (pathname !== path) return false
  if (hash) return hash === `#${id}`
  return activeSection === id
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const { pathname, hash } = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname, hash])

  useEffect(() => {
    if (pathname !== '/services') {
      setActiveSection('')
      return undefined
    }

    const elements = serviceNav
      .map((item) => document.getElementById(item.to.split('#')[1]))
      .filter(Boolean)

    if (!elements.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]) setActiveSection(visible[0].target.id)
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0.15, 0.4] },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const linkClass = (to) => {
    const active = isCurrent(to, pathname, hash, activeSection)
    return [
      'text-[13px] font-medium tracking-wide transition-colors',
      active ? 'text-gold-400' : 'text-white/80 hover:text-white',
    ].join(' ')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gold-500/30 bg-navy-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-gold-500/70 text-gold-400">
            <Landmark size={20} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-serif text-lg tracking-wide">
              {brand.name}
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.18em] text-gold-400 sm:block">
              Research · Training · Consultancy
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-x-4 xl:flex" aria-label="Primary">
          {primaryNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={linkClass(item.to)}
              aria-current={
                isCurrent(item.to, pathname, hash, activeSection) ? 'page' : undefined
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-white xl:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="max-h-[calc(100vh-4.25rem)] overflow-y-auto border-t border-white/10 bg-navy-800 px-4 py-3 xl:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col">
            {primaryNav.map((item) => {
              const active = isCurrent(item.to, pathname, hash, activeSection)
              return (
                <li key={item.to} className="border-b border-white/10 last:border-b-0">
                  <Link
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={`block py-3 text-sm ${
                      active ? 'text-gold-400' : 'text-white/85 hover:text-white'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </header>
  )
}
