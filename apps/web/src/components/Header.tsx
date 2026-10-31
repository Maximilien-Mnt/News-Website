/**
 * En-tête sticky (56px) avec filet bas, wordmark, navigation,
 * bouton recherche et ThemeToggle.
 */
import { ThemeToggle } from './ThemeToggle'
import { Icon } from './Icon'
import { SearchBox } from '../lib/SearchBox'

// Lien de navigation (à finaliser avec les routes réelles)
const NAV_LINKS = [
  { label: "Fil", href: "/" },
  { label: "Glossaire", href: "/glossaire" },
  { label: "Méthode", href: "/methode" },
  { label: "À propos", href: "/a-propos" },
] as const

export function Header({ searchBox }: { searchBox?: React.ComponentType }) {
  const handleSearch = (query: string) => {
    window.location.href = `/?q=${encodeURIComponent(query)}`
  }

  return (
    <header className="site-header">
      <div className="site-header__row">
        {/* Wordmark : texte "Brève" en Archivo 800, wdth 88 (pas de logo SVG) */}
        <a className="site-header__wordmark" href="/" aria-label="Brève — accueil">
          <span className="site-header__wordmark-text">Brève</span>
        </a>

        <nav className="site-header__nav" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="site-header__nav-link"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          {/* Bouton recherche */}
          {searchBox ? (
            <SearchBox onSearch={handleSearch} onKeyDown={undefined} />
          ) : (
            <button
              type="button"
              className="site-header__search-btn"
              disabled
              aria-label="Recherche (non fonctionnelle pour l'instant)"
            >
              <Icon name="search" className="site-header__search-icon" />
            </button>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export default Header
