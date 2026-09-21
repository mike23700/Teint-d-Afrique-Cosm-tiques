import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import logo from '@/imports/TDA_LogoExe_CMJN.png'
import { GAMMES } from '@/data'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [shopDropdown, setShopDropdown] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setShopDropdown(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#FAF6EF]/96 backdrop-blur-sm shadow-sm' : 'bg-[#FAF6EF]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img
            src={logo}
            alt="Teint d'Afrique Cosmétiques"
            className="h-8 md:h-10 object-contain mix-blend-multiply"
          />
        </Link>

        {/* Desktop links */}
        <div
          className="hidden md:flex items-center gap-8"
          style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
        >
          {[
            { label: 'Accueil', to: '/' },
            { label: 'Présentation', to: '/presentation' },
            { label: 'Notre Histoire', to: '/histoire' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-[11px] tracking-[0.2em] uppercase font-medium transition-colors ${
                isActive(link.to) && link.to !== '/'
                  ? 'text-[#C97B1A]'
                  : location.pathname === '/' && link.to === '/'
                  ? 'text-[#C97B1A]'
                  : 'text-[#3B1705] hover:text-[#C97B1A]'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Boutique dropdown */}
          <div className="relative">
            <button
              onClick={() => setShopDropdown(v => !v)}
              onBlur={() => setTimeout(() => setShopDropdown(false), 200)}
              className={`flex items-center gap-1 text-[11px] tracking-[0.2em] uppercase font-medium transition-colors ${
                isActive('/boutique') ? 'text-[#C97B1A]' : 'text-[#3B1705] hover:text-[#C97B1A]'
              }`}
            >
              Boutique
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="mt-px">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            {shopDropdown && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white shadow-xl border border-[#3B1705]/8 py-3 w-56 z-50">
                <Link
                  to="/boutique"
                  className="block px-5 py-2.5 text-[10px] tracking-[0.15em] uppercase text-[#3B1705]/60 hover:text-[#3B1705] hover:bg-[#FAF6EF] transition-colors"
                >
                  Toutes les gammes
                </Link>
                <div className="border-t border-[#3B1705]/8 my-1" />
                {GAMMES.map(g => (
                  <Link
                    key={g.id}
                    to={`/boutique/${g.id}`}
                    className="flex items-center gap-3 px-5 py-2.5 text-[11px] tracking-[0.15em] uppercase hover:bg-[#FAF6EF] transition-colors"
                    style={{ color: g.colorDark }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: g.color }}
                    />
                    {g.nom}
                    <span className="text-[#3B1705]/35 text-[9px] normal-case tracking-normal ml-auto">
                      {g.ingredients.split('&')[0].trim()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/contact"
            className={`text-[11px] tracking-[0.2em] uppercase font-medium transition-colors ${
              isActive('/contact') ? 'text-[#C97B1A]' : 'text-[#3B1705] hover:text-[#C97B1A]'
            }`}
          >
            Contact
          </Link>
        </div>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-4">
          <Link
            to="/contact"
            className="hidden md:block bg-[#3B1705] text-[#FAF6EF] px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase hover:bg-[#C97B1A] transition-colors"
            style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
          >
            Nous Contacter
          </Link>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden w-10 h-10 flex flex-col justify-center gap-[5px] items-center"
            aria-label="Menu"
          >
            <span
              className={`block w-6 h-0.5 bg-[#3B1705] origin-center transition-all duration-300 ${
                menuOpen ? 'rotate-45 translate-y-[7px]' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-[#3B1705] transition-all duration-300 ${
                menuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-[#3B1705] origin-center transition-all duration-300 ${
                menuOpen ? '-rotate-45 -translate-y-[7px]' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden bg-[#FAF6EF] border-t border-[#3B1705]/10"
          style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
        >
          <div className="px-6 py-6 flex flex-col gap-5 text-[11px] tracking-[0.2em] uppercase font-medium text-[#3B1705]">
            <Link to="/" className="hover:text-[#C97B1A] transition-colors">Accueil</Link>
            <Link to="/presentation" className="hover:text-[#C97B1A] transition-colors">Présentation</Link>
            <Link to="/histoire" className="hover:text-[#C97B1A] transition-colors">Notre Histoire</Link>
            <Link to="/boutique" className="hover:text-[#C97B1A] transition-colors">Boutique — Toutes les gammes</Link>
            <div className="flex flex-col gap-3 pl-3">
              {GAMMES.map(g => (
                <Link
                  key={g.id}
                  to={`/boutique/${g.id}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  style={{ color: g.colorDark }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: g.color }} />
                  Gamme {g.nom}
                </Link>
              ))}
            </div>
            <Link to="/contact" className="hover:text-[#C97B1A] transition-colors">Contact</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
