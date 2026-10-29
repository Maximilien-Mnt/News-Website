# Logo: à fournir par toi

Dépose ici ces fichiers (noms exacts). Tant qu'ils n'existent pas, Cline affiche le texte « Brève » en Archivo 800 (width 88) avec l'accent grave en `--c-accent`.

| Fichier | Usage | Spécification |
|---|---|---|
| `wordmark.svg` | En-tête (inline, hérite de `currentColor`) | SVG, tracés convertis en courbes (pas de `<text>`), 1 couleur = `fill="currentColor"`, accent éventuel en `style="fill:var(--c-accent,#1736D9)"`. Hauteur utile 28 à 32 px. Zone de protection = hauteur du « e ». |
| `wordmark-light.svg` | Fond clair, hors page (réseaux, e-mails) | Couleurs fixes: encre `#0F1B2D`, accent `#1736D9` |
| `wordmark-dark.svg` | Fond sombre, hors page | Couleurs fixes: `#E7ECF5`, accent `#7E94FF` |
| `mark.svg` | Pastille/avatar carré | SVG carré, viewBox 1:1, lisible à 16 px |
| `favicon.svg` | Onglet navigateur | SVG carré, supporte `prefers-color-scheme` si souhaité |
| `favicon.ico` | Anciens navigateurs | 32x32 (optionnel) |
| `apple-touch-icon.png` | iOS écran d'accueil | PNG 180x180, fond opaque, pas de transparence |
| `icon-192.png`, `icon-512.png` | PWA/Android | PNG 192 et 512 |
| `og-default.png` | Aperçu de partage par défaut | PNG 1200x630, texte lisible à 600 px de large, marges 60 px |

Contraintes de marque: palette de `design/tokens.css` uniquement (Klein `#1736D9`, Nuit `#0F1B2D`, Surligneur `#F7E34B`, Craie `#F1F3F0`). Le nom est « Brève » (provisoire, centralisé dans `apps/web/src/lib/site.ts`).
