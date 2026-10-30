// En-tête sticky (56px) avec filet bas, wordmark, navigation,
// bouton recherche (inactif) et ThemeToggle.
// Spéc : DESIGN-SPEC §3.3 (thème), §5 (filet), §2 (wordmark ≠ logo).

import { ThemeToggle } from "./ThemeToggle";
import { Icon } from "./Icon";

// Lien de navigation (à finaliser avec les routes réelles)
const NAV_LINKS = [
  { label: "Fil", href: "/" },
  { label: "Glossaire", href: "/glossaire" },
  { label: "Méthode", href: "/methode" },
  { label: "À propos", href: "/a-propos" },
] as const;

export function Header() {
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
          {/* Bouton recherche : inactif pour l'instant */}
          <button
            type="button"
            className="site-header__search-btn"
            disabled
            aria-label="Recherche (non fonctionnelle pour l'instant)"
          >
            <Icon name="search" className="site-header__search-icon" />
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Header;
