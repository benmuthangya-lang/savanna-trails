import { useEffect, useRef, useState } from 'react'
import { BrandMark, MenuIcon } from './Icons.jsx'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef(null)

  // Clear mobile-only menu state when the layout switches to desktop.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 760) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Escape closes the menu and returns keyboard focus to its trigger.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <a className="brand" href="#top" aria-label="Savanna Trails home" onClick={closeMenu}>
          <BrandMark />
          <span>
            <strong>Savanna</strong> Trails
          </span>
        </a>

        <button
          ref={menuButtonRef}
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <MenuIcon open={menuOpen} />
        </button>

        <nav id="primary-navigation" className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Primary navigation">
          <a href="#tours" onClick={closeMenu}>Tours</a>
          <a href="#about" onClick={closeMenu}>Our story</a>
          <a className="nav-cta" href="#enquiry" onClick={closeMenu}>Make an enquiry</a>
        </nav>
      </div>
    </header>
  )
}
