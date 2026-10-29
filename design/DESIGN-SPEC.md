# Brève: spécification design & UX

Légende: ✅ défini ici · 🟡 à fournir par toi · ⬜ à décider (proposition donnée)

## 1. Identité
| Élément | Décision |
|---|---|
| Nom | « Brève » (provisoire, ⬜). Centralisé dans `apps/web/src/lib/site.ts` (`name`, `tagline`, `url`, `contactEmail`). |
| Promesse | « L'essentiel en quelques lignes. » (⬜ tagline alternative: « Le monde, en bref. ») |
| Idée de marque | Le surligneur: on souligne ce qui compte. Un bleu Klein profond pour l'importance, un jaune surligneur réservé au glossaire. |
| Ton | Direct, sobre, précis. Phrases courtes. Jamais de sensationnalisme ni de point d'exclamation. S'adresse peu au lecteur (formulations neutres, jamais de tutoiement). |
| Public | Lecteurs pressés, francophones, curieux du monde, de 16 à 80 ans: lisibilité avant tout. |
| Ce que le design doit éviter | L'allure « template IA »: dégradés, cartes arrondies identiques, emojis, majuscules espacées, mono pour les métadonnées, flèches décoratives. |

## 2. Logo et assets de marque (🟡 tout fournir dans `design/logo/`, specs dans `design/logo/README.md`)
Wordmark (3 variantes), mark carré, favicon SVG + ICO, apple-touch-icon 180, icônes 192/512, image de partage 1200x630. Cline utilise un texte de remplacement tant qu'ils manquent.

## 3. Couleurs (✅ `tokens.css`)
| Rôle | Clair « Craie » | Sombre « Abysse » | Usage |
|---|---|---|---|
| Fond `--c-paper` | #F1F3F0 | #0A1220 | page |
| Surface `--c-surface` | #FFFFFF | #111B2E | bulles, champs, feuilles |
| Encre `--c-ink` | #0F1B2D | #E7ECF5 | texte, logo (15,5:1 / 15,8:1) |
| Encre 2 `--c-ink-2` | #475569 | #9AA7BD | métadonnées (6,8:1 / 7,7:1) |
| Filet `--c-line` | #D3D9D1 | #22304A | séparateurs, rail bas niveau |
| Accent « Klein » `--c-accent` | #1736D9 | #7E94FF | liens, rail, actions (7,3:1 / 6,8:1) |
| Surligneur `--c-mark` | #F7E34B | #F7E34B | glossaire, ombre des bulles, pastille du niveau « essentiel » uniquement |
Règles: un seul accent. Pas de couleur par catégorie (les catégories sont typographiques). Rouge/vert réservés aux états d'erreur/succès. Le jaune n'est jamais utilisé comme fond de bouton. Mode sombre automatique (préférence système) + bascule manuelle clair/sombre/auto mémorisée.
États: hover = soulignement épaissi (liens) ou fond `color-mix(in srgb, var(--c-ink) 6%, transparent)` (boutons fantômes); active = translateY(1px); disabled = opacité .45 + `aria-disabled`; focus = anneau 2px `--c-focus`, offset 3px.

## 4. Typographie (✅ `tokens.css`, `fonts.css`)
| Rôle | Police | Réglages |
|---|---|---|
| Titres de brèves, titres de page | Archivo | wght 750, wdth 88, interlignage 1.12, tracking -0.012em |
| Interface, métadonnées, boutons | Archivo | wght 500-600, 13-15px, chiffres tabulaires |
| Résumés, contexte, textes longs | Literata | wght 400, 17px, interlignage 1.55, mesure 62ch |
Échelle: 13 · 15 · 17 · 22 · 28 · 40 px (`--fs-*`). Titre standard 22, niveau important 28, essentiel 40 (mobile: 22/24/30). Pas d'italique par défaut.
Typographie française (✅ helper `frTypo()` + post-traitement à l'ingestion): espace insécable avant `: ; ! ? »` et après `«`; guillemets « » (jamais " "); apostrophe ’; points de suspension `…`; « n° »; unités collées par espace insécable (« 3,5 % », « 40 km »); majuscules accentuées respectées (« À », « État »).
Chargement: polices auto-hébergées, `font-display: swap`, sous-ensembles latin + latin-ext (noms étrangers).

## 5. Grille, espacement, rayons (✅)
Espacement base 4px (`--s-1..8`). Rayons: 0 (fil), 4px (boutons/champs), 10px (bulles/feuilles), pilule (puces de filtre uniquement). Filets 1px `--c-line`. Pas d'ombres douces; seule ombre: la bulle (3px 3px 0 jaune).
Breakpoints: < 640 mobile · 640-899 tablette · 900-1179 petit desktop · ≥ 1180 desktop.
| Zone | Mobile | Tablette/petit desktop | Desktop |
|---|---|---|---|
| Navigation | barre haute 56px | barre haute | barre haute sticky 56px |
| Filtres | feuille plein écran depuis le bas | feuille latérale | colonne gauche sticky 15rem |
| Fil | 1 colonne, marges 16px | 1 colonne centrée, max 42,5rem | colonne centrale 42,5rem |
| Aside (« Lieux en vue », « À la une ») | masqué | masqué | colonne droite 17,5rem |
Largeur max du conteneur ≈ 1360px, centré.

## 6. Encodage de l'importance (✅ `base.css`: `.rail`, `data-level`)
| Score | Niveau `data-level` | Rail | Titre | Libellé accessible |
|---|---|---|---|---|
| 85-100 | `flash` | 8px Klein + bloc inversé (fond Klein, texte blanc, pastille jaune) | 40px | « Essentiel » |
| 65-84 | `high` | 8px Klein | 28px | « Important » |
| 40-64 | `mid` | 4px Klein 55 % | 22px | « À suivre » |
| 0-39 | `low` | 2px filet | 22px, texte résumé réduit à 16px | « En bref » |
Le score numérique s'affiche dans la bulle de l'icône `importance` (« Importance 72 sur 100 »), jamais en gros.

## 7. Composants (inventaire exhaustif)
Chaque composant: états à livrer = défaut, hover, focus, actif, désactivé, chargement, erreur, vide (selon pertinence).
| # | Composant | Définition |
|---|---|---|
| 1 | **Layout / Shell** | `<html lang="fr">`, skip-link « Aller au contenu », en-tête, zone principale, pied de page. |
| 2 | **En-tête** | Wordmark à gauche (lien accueil), navigation « Fil · Glossaire · Méthode · À propos » (texte seul, pas de « · » à l'écran: espacement), recherche (icône `search`, déploie un champ), bascule de thème. Filet bas 1px. Sticky. |
| 3 | **Bascule de thème** | Bouton 3 états (auto/clair/sombre), icônes `sun`/`moon`, `aria-pressed`, script inline anti-flash. |
| 4 | **Fil (liste)** | Séparateurs: filets 1px, aucune carte. Groupes temporels avec titres collants en casse normale: « Dernière heure », « Aujourd'hui », « Hier », « Cette semaine ». |
| 5 | **Brève (StoryItem)** | Grille [gouttière temps 4,5rem] [contenu]. Gouttière: temps relatif en gras (« 12 min »), heure sous (« 14:32 », `<time datetime>`, tooltip date complète). Contenu: titre (Archivo), résumé (Literata, glossaire surligné), rangée de métadonnées, rangée de sources. Variantes: flash/high/mid/low. |
| 6 | **Rangée de métadonnées** | Éléments séparés par l'espacement (jamais « · »): icône `map-pin` + lieux (max 2, « Lisbonne, PT »), icône `layers` + « 5 sources », catégorie en texte (« Économie ») cliquable = filtre, icône `signal` = importance. Mono interdite. |
| 7 | **Sources (SourceChips)** | Libellé « Sources » + puces: favicon 16px (service de favicons; repli = monogramme carré 16px, 1re lettre, fond `--c-line`) + nom + icône `arrow-up-right`, tout est un lien `target=_blank rel="noopener noreferrer"`. Max 3 visibles + « +2 ». Ordre: plus récente d'abord. |
| 8 | **Terme de glossaire** | Bouton `.term` (surlignage jaune bas, plein au hover/focus) dans le texte. Ouvre une **bulle** (`.popover`): terme en gras, définition (≤ 140 car.), icône `glossary`. Hover (desktop) ou clic/Entrée (tactile/clavier), Échap ferme. Radix Popover. |
| 9 | **Notice IA** | Petit bouton `info` en fin de brève: bulle « Résumé généré par IA à partir des titres et extraits des sources ci-dessus. Il peut contenir des erreurs. » + lien « Notre méthode ». |
| 10 | **Contexte (expander)** | Bouton « Contexte » (icône `chevron-down`) qui déplie `explainer`, animation hauteur 200ms. Absent si vide. |
| 11 | **Panneau de filtres** | Sections repliables: Période (Dernière heure, 6 heures, 24 heures, 7 jours), Catégorie (multi), Importance (Toutes, À suivre et plus, Important et plus, Essentiel), Lieu (pays, recherche dans la liste), Source (multi), Langue d'origine (multi), Recherche texte. Compteur par option. Bouton « Réinitialiser ». |
| 12 | **Puces de filtres actifs** | Au-dessus du fil: une puce pilule par filtre actif (`x` pour retirer), + « Tout effacer ». |
| 13 | **Menu de tri** | « À la une » (hot_score) · « Plus récentes » · « Plus importantes » · « Plus de sources ». Bouton avec icône `arrow-up-down`. |
| 14 | **Bannière « N nouvelles brèves »** | Apparaît en haut du fil quand un contrôle (toutes les 5 min) détecte du nouveau. Clic = actualise et remonte. |
| 15 | **Charger plus** | Bouton « Charger plus de brèves » (pas de défilement infini: garde le pied de page atteignable). |
| 16 | **Skeletons** | 6 brèves fantômes aux dimensions réelles (shimmer). |
| 17 | **État vide** | « Rien ne correspond à ces filtres. » + bouton « Réinitialiser les filtres ». |
| 18 | **État erreur** | « Impossible de charger le fil. » + bouton « Réessayer ». Les données déjà affichées restent. |
| 19 | **Aside (desktop)** | Bloc « Lieux en vue » (top 8 pays/villes des 24 h, cliquables = filtre) et « Glossaire récent » (5 derniers termes). Texte seul. |
| 20 | **Page Brève (détail)** `/b/[slug]` | Titre, résumé, contexte, toutes les sources (liste complète avec titre original et date), métadonnées complètes (date de l'événement, première vue, dernière mise à jour, lieux, langue d'origine, modèle), bouton « Copier le lien » (`link`). Sert aussi au SEO/partage. |
| 21 | **Page Glossaire** `/glossaire` | Liste A-Z de tous les termes + définitions, ancres par lettre. |
| 22 | **Page Méthode** `/methode` | Comment c'est fait: sources, IA, score d'importance (formule en clair), limites, correction. |
| 23 | **Page À propos / Contact** | Qui, pourquoi, contact, demande de retrait de contenu. |
| 24 | **Pages légales** | Mentions légales, confidentialité (stats sans cookies). Texte rédigé par toi/juriste. |
| 25 | **404 / erreur** | Wordmark, phrase courte, lien vers le fil. |
| 26 | **Pied de page** | Liens (Méthode, Glossaire, À propos, Légal, flux RSS du site), dernière mise à jour de l'ingestion (« Mis à jour il y a 7 min »), mention « Résumés générés par IA ». |
| 27 | **Raccourcis clavier** | `/` recherche, `j`/`k` brève suivante/précédente, `f` ouvre les filtres, `?` aide. Aide dans une bulle. |
| 28 | **Toasts** | Uniquement pour « Lien copié ». |
| 29 | **Flux RSS du site** `/rss.xml` | Titre + résumé + lien vers la brève (⬜ phase 2). |

## 8. Icônes (✅ voir `design/ICONS.md`)
Bibliothèque en ligne: Lucide. Trait 1,75px, extrémités carrées, jointures anguleuses (forcées en CSS), taille 1,125em, couleur = texte courant.

## 9. Imagerie (✅ politique)
Aucune image de source (droits). Aucune photo stock. Aucune illustration IA. L'identité repose sur la typographie, la couleur et le rail. Seuls visuels: logo (🟡), favicons de sources (16px), image de partage (🟡, modèle unique). Pas de drapeaux emoji: code pays en texte.

## 10. Mouvement (✅ `animations.css`)
Un moment orchestré au chargement (les rails se dessinent de haut en bas, 45ms d'écart, 12 premiers). Le reste répond à une action: surlignage du terme (200ms), ouverture de bulle (200ms, ombre jaune qui sort), feuille de filtres (320ms), bannière (320ms), clignotement surligneur du temps mis à jour. Courbes `--ease-out`, `--ease-snap`. `prefers-reduced-motion`: tout désactivé.

## 11. Accessibilité (✅ exigences)
Contraste AA mini (palette validée). Focus visible partout. Cibles >= 44px sur mobile. Terme de glossaire = `<button aria-expanded aria-controls>`; la bulle a `role="dialog"` non modal, Échap ferme, le focus revient au déclencheur. Niveau d'importance annoncé en texte (« Importance: Important »). `<time datetime>`. Liens externes annoncés (« s'ouvre dans un nouvel onglet »). Ordre de tabulation logique, skip-link, un seul `<h1>` par page, titres de brèves en `<h2>`. Texte redimensionnable à 200 %. Sections de filtres en `<fieldset><legend>`. Changement de langue: `lang="en"` sur les titres originaux affichés.

## 12. Architecture d'information et URL
`/` fil · `/b/[slug]` brève · `/glossaire` · `/methode` · `/a-propos` · `/mentions-legales` · `/confidentialite` · `/rss.xml` (⬜ phase 2) · `/404`.
Filtres dans l'URL (partageables), noms stables: `?q=` `&periode=1h|6h|24h|7j` `&cat=economie,tech` `&imp=40|65|85` `&pays=FR,DE` `&src=lemonde,bbc-world` `&lang=fr,en` `&tri=une|recent|important|sources`. Valeur par défaut: `periode=24h`, `tri=une`. Un lien vers `/?cat=science` est valide.

## 13. Contenu et microcopy (✅)
Catégories: Politique, Économie, Monde, Conflits, Tech, Science, Santé, Climat, Société, Culture, Sport.
Temps: « à l'instant » (< 1 min) · « il y a 12 min » · « il y a 3 h » · « hier, 18:42 » · « mar. 27 oct. » (< 7 j) · « 12 oct. 2026 » (au-delà). Fuseau = celui du navigateur. Format 24 h. Implémentation `Intl.RelativeTimeFormat("fr")` / `Intl.DateTimeFormat("fr")`.
Nombres: virgule décimale, espace insécable fine pour les milliers (« 12 400 »).
Libellés: « Filtrer », « Trier », « Réinitialiser », « Tout effacer », « Charger plus de brèves », « Actualiser », « Copier le lien », « Lien copié », « Sources », « Contexte », « Notre méthode », « Aller au contenu ».
Longueurs: titre ≤ 90 car., résumé ≤ 300 car., contexte ≤ 220 car., définition ≤ 140 car.

## 14. SEO et partage (✅ exigences, ⬜ SSR en phase 2)
`<title>` « Titre de la brève, Brève », meta description = résumé, `link rel=canonical`, Open Graph/Twitter (image par défaut 🟡), `lang`, `sitemap.xml`, `robots.txt`, données structurées `ItemList` sur le fil. Le fil est rendu côté navigateur au MVP; la page `/b/[slug]` doit pouvoir être pré-rendue (phase 2).

## 15. Performance (✅ budgets)
JS initial ≤ 120 Ko gzip, CSS ≤ 25 Ko, polices ≤ 270 Ko (chargées à la demande par unicode-range), LCP < 2,5 s sur 4G, CLS < 0,05 (réserver la hauteur des skeletons), requêtes Supabase paginées par 20, aucune bibliothèque d'animation JS.

## 16. Maquettes (ASCII)
Desktop ≥ 1180
```
┌────────────────────────────────────────────────────────────────────────┐
│ Brève         Fil  Glossaire  Méthode  À propos        [rech.] [thème] │
├───────────────┬────────────────────────────────────────┬───────────────┤
│ Filtres       │ Tri: À la une ▾        [Période ×][Tech ×]             │
│ Période       │ ┌────────────────────────────────────┐ │ Lieux en vue  │
│ Catégorie     │ █ 12 min  Titre essentiel (40px)     │ │ Lisbonne  4   │
│ Importance    │ █ 14:32   Résumé avec ▓terme▓ …      │ │ Francfort 3   │
│ Lieu          │ █         pin Lisbonne  layers 5     │ │               │
│ Source        │ █         Sources: [Le Monde ↗][BBC ↗]│ │ Glossaire     │
│ Langue        │ └────────────────────────────────────┘ │ récent        │
│ [Réinitialiser]│ ▌ 3 h    Titre important (28px) …     │               │
│               │ │ 5 h    Titre à suivre (22px) …       │               │
└───────────────┴────────────────────────────────────────┴───────────────┘
```
Mobile < 640
```
┌──────────────────────────┐
│ Brève        [rech.][thème]│
│ [Filtrer]  [Trier ▾]      │
│ Période × · Tech ×        │
│ █ 12 min · 14:32          │
│ █ Titre essentiel         │
│ █ Résumé …                │
│ █ pin Lisbonne  5 sources │
│ █ [Le Monde][BBC] +2      │
│ ▌ 3 h   Titre important …  │
└──────────────────────────┘
```
Anatomie d'une brève: `[temps]` | rail · titre · résumé(glossaire) · métadonnées · sources · notice IA · contexte.

## 17. Checklist des livrables design
| Livrable | Statut |
|---|---|
| Nom final, tagline | ⬜ toi |
| Logo (wordmark ×3, mark, favicon, apple-touch, 192/512, OG) | 🟡 toi |
| Palette + tokens clair/sombre | ✅ |
| Typographie + échelle + règles françaises | ✅ |
| Grille, espacements, rayons, breakpoints | ✅ |
| Encodage importance (rail) | ✅ |
| Glossaire (surlignage + bulle) | ✅ |
| Jeu d'icônes (Lucide, mapping) | ✅ |
| Animations | ✅ |
| Inventaire composants + états | ✅ (maquettes détaillées: Cline construit, tu valides à l'écran) |
| Pages (fil, brève, glossaire, méthode, à propos, légal, 404) | ✅ structure · 🟡 textes légaux |
| Microcopy FR | ✅ |
| Accessibilité, performance, SEO | ✅ exigences |
| Image de partage OG | 🟡 toi (ou Cline génère un modèle en phase 12) |
| Textes « Méthode » et « À propos » | ⬜ Cline rédige un brouillon, tu relis |
