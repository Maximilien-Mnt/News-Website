# Icônes: Lucide (en ligne, via npm)

Bibliothèque: **Lucide** (`lucide-react`, licence ISC, ~1500 icônes, grille 24px, trait). Pourquoi: cohérente, libre, tree-shakable, et son trait se laisse rendre angulaire par CSS (`base.css` force `stroke-linecap: square`, `stroke-linejoin: miter`, `stroke-width: 1.75`), ce qui s'accorde avec les capitales franches d'Archivo et le rail rectiligne.
Alternative acceptable si un nom manque: Phosphor (poids « regular ») ou Tabler, mais ne jamais mélanger deux bibliothèques.

Règles: taille 1,125em (aligne sur le texte), `currentColor`, `aria-hidden="true"` si décoratives, sinon `aria-label`. Toujours accompagnées d'un texte, sauf boutons-icônes (alors `aria-label` obligatoire + info-bulle). Pas d'icône dans un cercle coloré, pas d'icône pleine.

Composant unique `<Icon name="clock" />` (dans `apps/web/src/components/Icon.tsx`), table de correspondance nom interne → composant Lucide. Vérifier chaque nom dans la version installée (Lucide renomme parfois; utiliser l'alias fourni si besoin).

| Nom interne | Lucide | Usage |
|---|---|---|
| `external` | `ArrowUpRight` | lien vers une source |
| `clock` | `Clock` | heure/temps relatif |
| `pin` | `MapPin` | lieu |
| `layers` | `Layers` | nombre de sources |
| `importance` | `Signal` | niveau d'importance (barres montantes) |
| `glossary` | `BookOpenText` | glossaire (repli `BookOpen`) |
| `filter` | `ListFilter` | ouvrir les filtres (repli `SlidersHorizontal`) |
| `sort` | `ArrowUpDown` | tri |
| `search` | `Search` | recherche |
| `sun` | `Sun` | thème clair |
| `moon` | `Moon` | thème sombre |
| `close` | `X` | fermer, retirer une puce |
| `check` | `Check` | option cochée, « lien copié » |
| `chevron-down` | `ChevronDown` | expander |
| `chevron-right` | `ChevronRight` | navigation secondaire |
| `globe` | `Globe` | langue d'origine, monde |
| `languages` | `Languages` | filtre langue |
| `refresh` | `RefreshCw` | actualiser |
| `calendar` | `Calendar` | période, date de l'événement |
| `menu` | `Menu` | menu mobile |
| `info` | `Info` | notice IA |
| `link` | `Link` | copier le lien |
| `rss` | `Rss` | flux RSS |
| `keyboard` | `Keyboard` | aide raccourcis |
| `alert` | `TriangleAlert` | état d'erreur |

Favicons des sources: ce ne sont pas des icônes de la bibliothèque. Source par défaut: `https://www.google.com/s2/favicons?domain={domain}&sz=64` (compromis vie privée: l'URL est appelée depuis le navigateur du visiteur; à remplacer ensuite par des fichiers auto-hébergés `/sources/{slug}.png`). Repli: monogramme.
