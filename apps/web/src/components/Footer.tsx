// Pied de page minimal : marque, copyright, liens légaux/accessibilité.
// Spéc : DESIGN-SPEC §16 (pages), checklist livrables.

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="site-footer__brand">
          <a href="/" className="site-footer__brand-link">
            <span className="site-footer__brand-text">Brève</span>
          </a>
        </p>
        <p className="site-footer__copy">
          {new Date().getFullYear()} Brève. Texte sous licence libre, sources
          citées dans chaque brève.
        </p>
        <nav className="site-footer__nav" aria-label="Pied de page">
          <a href="/a-propos" className="site-footer__nav-link">
            À propos
          </a>
          <a href="/legal" className="site-footer__nav-link">
            Légal
          </a>
          <a href="/methode" className="site-footer__nav-link">
            Méthode
          </a>
          <a href="/accessibility" className="site-footer__nav-link">
            Accessibilité
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
