# Prompts pour Cline

## Réglages Cline (une fois)
1. Ouvre **le dossier racine du dépôt** dans VS Code (Cline lit `.clinerules/` automatiquement).
2. Modèle, par ordre de préférence: (a) fournisseur Cline avec un modèle marqué gratuit; (b) **Google Gemini** avec la clé du projet AI Studio « breve-cline » (modèle Flash le plus récent affichant un palier gratuit); (c) **OpenRouter** avec un modèle `:free` orienté code. Si ton fournisseur le permet, utilise un modèle plus fort en Plan et un modèle code en Act.
3. Auto-approve: lecture de fichiers ✔, édition dans le projet ✔ (garde les **checkpoints** activés), commandes terminal ✘ au début (tu valides chaque commande; active plus tard pour `npm run …` seulement), navigateur/MCP ✘.
4. **Une tâche (nouvelle conversation) par prompt**: contexte propre, moins d'erreurs avec des modèles gratuits.
5. Limite de débit (429): attends quelques minutes ou change de fournisseur; ne renvoie pas le prompt à moitié exécuté, utilise le prompt de reprise ci-dessous.

## Comment utiliser Plan/Act
- **Plan puis Act**: envoie le prompt en mode **Plan**, lis le plan (fichiers, commandes, risques). Si OK, réponds « OK, exécute le plan tel quel », passe en mode **Act**. Sinon corrige le plan avant.
- **Act**: envoie directement en mode Act (tâche mécanique, périmètre clair).
- Après chaque prompt: lance toi-même `npm run check`, `npm test`, `npm run build`, regarde le résultat à l'écran (critères), puis `git add -A && git commit -m "…"` et `git push`.

| Prompt | Phase | Mode | Prérequis à ta charge |
|---|---|---|---|
| P0 Squelette | 1 | Act | TODO-USER §A |
| P1 Design system + coque | 1 | Plan → Act | |
| P2 Types, formats, mocks | 2 | Act | |
| P3 Fil (mocks) | 2 | Plan → Act | |
| P4 Glossaire | 3 | Act | |
| P5 Filtres, tri, URL | 3 | Plan → Act | |
| P6 Lecture Supabase | 4 | Act | Supabase créé + SQL exécuté + `.env` (SETUP §B) |
| P7 Ingestion: RSS | 5 | Plan → Act | clé secrète Supabase dans `.env` |
| P8 Ingestion: clustering | 5 | Plan → Act | |
| P9 Ingestion: IA | 5 | Plan → Act | clé Gemini n°2 + `LLM_MODEL` (SETUP §C) |
| P10 Score | 5 | Act | |
| P11 GitHub Actions | 6 | Act | secrets/variables GitHub (SETUP §E) |
| P12 Stats, SEO, pages | 7 | Plan → Act | projet PostHog (SETUP §F), Cloudflare déjà connecté (SETUP §D) |
| P13 Finition + QA | 8 | Act | |
| P14 API de news (option) | 9 | Plan → Act | clé API |

---
## P0 · Squelette (Act)
```text
Lis .clinerules/ puis docs/PROJECT.md et docs/STACK.md.
Objectif: créer le squelette du monorepo, sans aucune fonctionnalité.
Fais:
1. Crée apps/web (Astro, TypeScript strict, intégration React, sortie statique) avec le CLI officiel en mode non interactif (`npm create astro@latest`, vérifie les flags avec --help; si le CLI bloque, crée les fichiers à la main). Package: @breve/web. Scripts: dev, build, preview, check (`astro check`), test (`vitest run --passWithNoTests`). Ajoute vitest en devDependency.
2. Crée ingest/ (package @breve/ingest, type module, TypeScript, dépendances: tsx, vitest, zod, @supabase/supabase-js, @google/genai, rss-parser) avec src/index.ts qui affiche "ingest ready". Scripts: ingest (`tsx src/index.ts`), check (`tsc --noEmit`), test (`vitest run --passWithNoTests`).
3. Chaque tsconfig étend ../tsconfig.base.json (ou ../../tsconfig.base.json). Ne modifie pas le package.json racine sauf nécessité.
4. Lance `npm install` à la racine.
Critères: `npm run check`, `npm test`, `npm run build` passent; `npm run ingest` affiche "ingest ready".
Ne fais pas: composants, styles, appels réseau.
```

## P1 · Design system + coque (Plan → Act)
```text
Lis design/DESIGN-SPEC.md (sections 3 à 7 et 11), design/ICONS.md et .clinerules/02-design.md.
Objectif: brancher le design system et créer l'ossature visuelle vide.
Fais:
1. `npm run sync:design`. Importe dans le layout global, dans cet ordre: fonts.css, tokens.css, base.css, animations.css.
2. src/lib/site.ts: { name: "Brève", tagline: "L'essentiel en quelques lignes.", url: import.meta.env.PUBLIC_SITE_URL, contactEmail: "" }.
3. src/layouts/BaseLayout.astro: <html lang="fr">, meta de base, lien d'évitement « Aller au contenu », script inline anti-flash qui applique data-theme depuis localStorage("theme") avant le rendu, favicon (public/favicon.svg s'il existe), <slot/>.
4. Installe lucide-react et @radix-ui/react-popover. Composant React Icon (src/components/Icon.tsx) avec la table de design/ICONS.md (vérifie chaque nom d'icône dans la version installée; utilise le repli indiqué si renommé).
5. En-tête sticky 56px avec filet bas: wordmark (si public/logo/wordmark.svg existe, l'inclure en inline; sinon le texte « Brève » en Archivo 800, wdth 88), navigation (Fil, Glossaire, Méthode, À propos), bouton de recherche (inactif pour l'instant), ThemeToggle (îlot React, 3 états auto/clair/sombre, aria-pressed, mémorisé).
6. Pied de page minimal; accueil placeholder « Le fil arrive. »; pages /glossaire /methode /a-propos /404 avec un titre.
Critères: build OK; clair/sombre corrects; polices servies depuis /fonts (onglet Réseau); aucun hex dans les composants; navigation clavier avec focus visible.
Ne fais pas: le fil, les filtres.
```

## P2 · Types, formats, mocks (Act)
```text
Lis design/DESIGN-SPEC.md sections 4, 6, 13 et docs/PROJECT.md (métadonnées).
Objectif: la couche de données pure, testée, sans interface.
Fais dans apps/web/src/lib/:
1. types.ts + schémas zod: Story (id, slug, headline, summary, explainer|null, category, importance, hot_score, event_at|null, first_seen_at, last_source_at, updated_at, source_count, locations[{name,country|null}], countries[], languages[], sources[{name,domain,icon_url|null,url,title,published_at|null}], terms[{surface,term,definition}]). Doit correspondre à la vue feed_stories de supabase/migrations/0001_init.sql.
2. levels.ts: levelOf(importance) → "flash"|"high"|"mid"|"low" (seuils 85/65/40) + libellés FR (Essentiel, Important, À suivre, En bref).
3. time.ts: relativeTime(date, now), absoluteTime(date), groupLabel(date, now) selon la section 13 (« à l'instant », « il y a 12 min », « il y a 3 h », « hier, 18:42 », « mar. 27 oct. », « 12 oct. 2026 »; groupes « Dernière heure », « Aujourd'hui », « Hier », « Cette semaine », « Plus ancien »), avec Intl, `now` injecté.
4. frTypo.ts: frTypo(text) (espace insécable avant : ; ! ? » et après «, apostrophe ’, …).
5. mocks/stories.ts: 12 brèves factices variées (4 niveaux, 1 à 6 sources, 0 à 3 termes dont le `surface` figure dans le texte, 2 sans lieu), textes plausibles mais fictifs, aucune organisation ni personne réelle.
6. Tests Vitest pour levels, time (59 s, 60 min, minuit, changement de jour), frTypo.
Critères: npm test passe.
```

## P3 · Fil avec mocks (Plan → Act)
```text
Lis design/DESIGN-SPEC.md sections 5 à 7, 10, 16 et design/base.css (.rail, [data-level]).
Objectif: afficher le fil avec les mocks, fidèle aux maquettes.
Fais:
1. Composants (src/components/): StoryItem (4 variantes via data-level), TimeGutter, MetaRow, SourceChips (favicon https://www.google.com/s2/favicons?domain={domain}&sz=64 avec monogramme de repli si erreur; max 3 puis « +N »; liens target="_blank" rel="noopener noreferrer"), AiNotice (bouton info + Popover Radix, texte de la spec), StoryList (groupes temporels, titres collants), StoryListSkeleton.
2. Accueil: 3 colonnes ≥ 1180px (colonnes filtres et aside vides pour l'instant, largeurs de tokens.css), 1 colonne sinon. Le fil affiche les mocks.
3. Animation de chargement: attribut data-intro sur <main>, variable --i par élément (animations.css).
4. Titres par niveau, gouttière de temps, <time datetime>, un <h2> par brève.
Critères: build OK; 4 niveaux visuellement distincts; 375px sans scroll horizontal; tabulation logique; reduced-motion désactive l'animation.
Ne fais pas: glossaire interactif, filtres.
```

## P4 · Glossaire (Act)
```text
Lis design/DESIGN-SPEC.md section 7 (#8) et 11, design/base.css (.term, .popover), design/animations.css.
Objectif: termes surlignés avec bulle accessible.
Fais:
1. src/lib/glossary.ts: splitWithTerms(text, terms) → segments [{text}|{term, surface, definition}]; correspondance insensible à la casse sur `surface`, première occurrence seulement, sans chevauchement, termes absents ignorés. Tests Vitest (accents, casse, doublons, terme absent, chevauchement).
2. GlossaryText (React): chaque terme = <button class="term" aria-expanded> + Popover Radix (classe .popover, data-state, titre = terme, définition). Ouverture: survol (desktop, délai 150 ms) et clic/Entrée/Espace; fermeture: Échap, clic extérieur; le focus revient au bouton.
3. Utilise GlossaryText dans StoryItem (résumé, et titre si un terme y figure).
4. Page /glossaire: liste A-Z de tous les termes des mocks, ancres par lettre.
Critères: tests OK; ouverture/fermeture au clavier; aria-expanded correct; la bulle ne déborde jamais à 375px.
```

## P5 · Filtres, tri, URL (Plan → Act)
```text
Lis design/DESIGN-SPEC.md sections 7 (#11 à #14) et 12, docs/PROJECT.md.
Objectif: filtres, tri et recherche avec état dans l'URL, sur les mocks.
Fais:
1. src/lib/filters.ts: type Filters {q, periode, cat[], imp, pays[], src[], lang[], tri}; parseFilters(URLSearchParams) et serializeFilters (noms de la section 12; défauts periode=24h tri=une; valeurs invalides ignorées); applyFilters(stories, filters, now); sortStories(stories, tri); facets(stories) pour les compteurs. Tests Vitest complets.
2. Hook useFilters synchronisé avec l'URL (history.replaceState, écoute de popstate).
3. Composants: FilterPanel (sections repliables en <fieldset><legend>, compteurs, Réinitialiser), ActiveFilters (puces pilule + Tout effacer), SortMenu, SearchBox (ouverte depuis l'en-tête, raccourci « / »).
4. Desktop: panneau en colonne gauche sticky. Mobile: bouton « Filtrer » ouvrant une feuille plein écran (.sheet, data-state) avec piège de focus et fermeture par Échap.
5. État vide: « Rien ne correspond à ces filtres. » + Réinitialiser les filtres.
6. /?cat=science&tri=recent doit charger directement l'état voulu.
Critères: tests OK; chaque filtre modifie le fil et l'URL; le retour arrière restaure l'état; utilisable à une main sur mobile.
```

## P6 · Lecture Supabase (Act)
```text
Prérequis (déjà fait par moi): projet Supabase créé, 0001_init.sql et seed.sql exécutés, .env contient PUBLIC_SUPABASE_URL et PUBLIC_SUPABASE_PUBLISHABLE_KEY.
Lis supabase/migrations/0001_init.sql (vue feed_stories) et apps/web/src/lib/filters.ts.
Objectif: remplacer les mocks par la lecture réelle.
Fais:
1. Installe @supabase/supabase-js. src/lib/supabase.ts: client avec les variables PUBLIC_*. Jamais de clé secrète.
2. src/lib/api.ts: fetchStories(filters, page) interroge la vue `feed_stories`; traduis les filtres en PostgREST: période → last_source_at >= seuil; cat → in; imp → gte sur importance; pays → overlaps sur countries; src → contains sur le jsonb sources avec [{domain}]; lang → overlaps sur languages; q → or(headline.ilike, summary.ilike) avec échappement; tri: une=hot_score desc, recent=last_source_at desc, important=importance desc, sources=source_count desc; pagination par 20 via range. Valide les réponses avec les schémas zod; retourne un résultat typé (ok/erreur) sans exception non gérée.
3. fetchFacets() (catégories, pays, sources présents sur la période) pour les compteurs.
4. Le fil utilise fetchStories; skeleton pendant le chargement; état erreur avec « Réessayer »; bouton « Charger plus de brèves ». Repli sur les mocks uniquement en dev si les variables sont absentes, avec un bandeau visible « Données factices ».
5. Tests Vitest de la traduction filtres → paramètres de requête (fonction pure).
Critères: le fil affiche les 6 brèves de démo; chaque filtre fonctionne contre la base; aucune requête vers raw_articles; build OK.
```

## P7 · Ingestion: flux RSS (Plan → Act)
```text
Prérequis (moi): SUPABASE_URL et SUPABASE_SECRET_KEY dans .env.
Lis docs/PROJECT.md (flux, règles de contenu), .clinerules/03-data-and-ai.md, ingest/sources.seed.json, supabase/migrations/0001_init.sql.
Objectif: récupérer les flux RSS et stocker les articles bruts. Ni clustering ni IA.
Fais dans ingest/src/:
1. config.ts: variables d'environnement validées par zod (SUPABASE_URL, SUPABASE_SECRET_KEY, INGEST_WINDOW_HOURS, INGEST_MAX_ITEMS_PER_FEED, DRY_RUN) + option CLI --dry-run.
2. db.ts: client Supabase (clé secrète) + helpers.
3. sources.ts: charge sources.seed.json et upsert dans `sources` (icon_url = https://www.google.com/s2/favicons?domain={domain}&sz=64).
4. fetchFeeds.ts: pour chaque source active, télécharge le flux (timeout 15 s, User-Agent « BreveBot/0.1 »), parse avec rss-parser; échec ⇒ consecutive_failures +1 (désactive à 5), succès ⇒ remise à 0 et last_fetched_at. Respecte INGEST_MAX_ITEMS_PER_FEED et la fenêtre INGEST_WINDOW_HOURS.
5. normalize.ts: URL canonique (retire utm_*, fragment, slash final), url_hash sha256, titre nettoyé (entités HTML décodées), extrait sans HTML tronqué à 500 caractères, title_tokens (minuscules, sans accents, sans mots vides fr/en), langue de la source.
6. Upsert idempotent dans raw_articles (onConflict url_hash). Écris une ligne ingestion_runs (début/fin, compteurs, erreurs).
7. index.ts orchestre; `npm run ingest -- --dry-run` n'écrit rien et affiche un résumé.
8. Tests Vitest pour normalize (URL, tokens, troncature) avec des fixtures RSS locales (aucun réseau en test).
Critères: les tests passent hors ligne; avec .env, --dry-run liste les flux OK/KO; sans --dry-run, raw_articles se remplit et un second lancement n'ajoute aucun doublon.
```

## P8 · Ingestion: clustering (Plan → Act)
```text
Lis docs/PROJECT.md (section Clustering) et supabase/migrations/0001_init.sql.
Objectif: regrouper les articles bruts par événement.
Fais dans ingest/src/:
1. cluster.ts: fonction pure clusterArticles(unclustered, existingStories) → affectations. Règles de la section Clustering (Jaccard sur title_tokens, seuils 0,45 ou 0,30 avec ≥ 2 entités communes), fenêtre 48 h; un article rejoint la brève existante la plus proche au-dessus du seuil, sinon en crée une.
2. persist.ts: crée les stories (slug unique = titre normalisé + suffixe court, status 'draft', needs_resummary true, first_seen_at, last_source_at, source_count, languages), remplit story_sources, renseigne raw_articles.story_id. Quand une brève reçoit un nouvel article: needs_resummary = true, mise à jour de source_count et last_source_at.
3. Branche dans index.ts après le fetch; respecte DRY_RUN.
4. Tests Vitest de clusterArticles: même événement vu par 3 sources; deux événements proches mais distincts; titres équivalents en langues différentes (ne se regroupent pas au MVP); fenêtre dépassée.
Critères: tests OK; un second lancement sur données réelles ne recrée aucune brève; le résumé d'exécution affiche brèves créées/mises à jour.
```

## P9 · Ingestion: IA (Plan → Act)
```text
Prérequis (moi): GEMINI_API_KEY (projet AI Studio dédié) et LLM_MODEL dans .env.
Lis ingest/prompts/summarize.system.md, ingest/prompts/summary.schema.json et .clinerules/03-data-and-ai.md. Avant d'écrire le code, consulte la documentation officielle du SDK `@google/genai` et de la sortie structurée (https://ai.google.dev/gemini-api/docs/structured-output). N'invente aucune méthode.
Objectif: résumer chaque brève en français avec validation stricte.
Fais dans ingest/src/:
1. llm.ts: client Gemini; prompt système + sortie JSON contrainte par le schéma, température 0.2, timeout. Définis une interface Summarizer pour injecter un faux client en test.
2. summarize.ts: pour les brèves needs_resummary (tri par source_count décroissant, au plus LLM_MAX_CALLS_PER_RUN par exécution), construis l'entrée { articles:[{source,language,title,snippet,published_at}], known_terms:[200 canoniques les plus utilisés], now }. Valide la sortie avec zod (mêmes contraintes que le schéma; retire tout terme dont `surface` est absent de headline/summary). Sortie invalide ⇒ 1 nouvelle tentative; 429/5xx ⇒ backoff exponentiel (3 essais max); sinon la brève reste draft.
3. typo.ts: frenchTypography(text) (mêmes règles que apps/web/src/lib/frTypo.ts, logique copiée, pas de dépendance entre workspaces) appliqué à headline, summary, context et définitions avant écriture.
4. Écriture: mets à jour stories (headline, summary, explainer, category, llm_importance, importance = llm_importance pour l'instant, event_at, locations, countries, status 'published', needs_resummary false, summarized_at, model = LLM_MODEL, prompt_version 'v1'); upsert glossary_terms (canonical_key = lower(canonical); n'écrase pas une définition existante) et story_terms.
5. Compte llm_calls dans ingestion_runs. DRY_RUN: affiche les entrées qui seraient envoyées, sans appel.
6. Tests Vitest avec un faux Summarizer: sortie valide; invalide puis valide; invalide deux fois; terme absent du texte; plafond d'appels respecté.
Critères: tests OK; avec la vraie clé, `npm run ingest` publie des brèves lisibles et exactes (je relirai 5 brèves face aux sources); jamais plus de LLM_MAX_CALLS_PER_RUN appels.
```

## P10 · Score d'importance (Act)
```text
Lis docs/PROJECT.md (section Score d'importance).
Fais dans ingest/src/score.ts: computeImportance({sourceCount, maxAuthority, llmImportance}) et computeHot(importance, lastSourceAt, now), fonctions pures, exactement selon la formule documentée. Après le résumé, calcule `importance`. À chaque exécution, recalcule hot_score pour les brèves publiées de moins de 72 h (mises à jour par lots); ne recalcule plus celles de plus de 14 jours. Ajoute MIN_PUBLISH_IMPORTANCE (variable d'environnement, défaut 0): en dessous, la brève reste draft. Tests Vitest: bornes 0 et 100, 1 source contre 5 sources, décroissance dans le temps.
Critères: tests OK; sur la base, le tri « À la une » du site donne un ordre cohérent.
```

## P11 · GitHub Actions (Act)
```text
Prérequis (moi): secrets et variables GitHub créés (docs/SETUP.md §E).
Objectif: vérifier et fiabiliser l'automatisation.
Fais: relis .github/workflows/ingest.yml et ci.yml; vérifie les versions d'actions et de Node avec la documentation actuelle et corrige si nécessaire, sans changer le cron (7 * * * *). Ajoute en fin d'exécution un résumé dans $GITHUB_STEP_SUMMARY (flux OK/KO, nouveaux articles, brèves créées/mises à jour, appels IA, erreurs). Le job échoue seulement si TOUS les flux échouent ou si l'écriture en base échoue. Documente tes changements dans docs/SETUP.md. Ne touche à aucun secret.
Critères: `npm run check && npm test && npm run build` passent. Je lancerai le workflow à la main (dry run puis réel).
```

## P12 · Stats, SEO, pages, accessibilité (Plan → Act)
```text
Prérequis (moi): PUBLIC_POSTHOG_KEY et PUBLIC_POSTHOG_HOST dans .env et dans Cloudflare.
Lis design/DESIGN-SPEC.md sections 7 (#20 à #26), 11, 12, 14, 15 et docs/SETUP.md §F.
Fais:
1. PostHog: posthog-js initialisé côté client seulement, `persistence: "memory"`, `autocapture: false`, `person_profiles: "identified_only"`; ne fait rien si la clé est absente. Événements: filter_changed, sort_changed, term_opened, source_clicked, story_opened, theme_changed (propriétés minimales; jamais le texte libre d'une recherche).
2. Page /b/[slug] (rendue côté client, lit la brève par slug dans feed_stories; 404 propre si absente) avec métadonnées complètes et « Copier le lien ». Lien depuis chaque brève.
3. Pages /methode, /a-propos, /mentions-legales, /confidentialite: brouillons marqués « À relire » (aucun conseil juridique); formule du score d'importance en clair dans /methode.
4. SEO: meta/OG/Twitter par page (image par défaut /logo/og-default.png si présente), canonical, sitemap.xml et robots.txt (@astrojs/sitemap), données ItemList sur le fil.
5. Audit accessibilité et performance (sections 11 et 15): corrige ce que tu trouves; lance Lighthouse ou équivalent si possible et résume les scores.
Critères: build OK; aucune requête tierce hormis Supabase, PostHog et favicons; aucun cookie posé (vérifie l'onglet Application).
```

## P13 · Finition + QA (Act)
```text
Lis design/DESIGN-SPEC.md sections 7 (#14, #17, #18, #26, #27) et 10.
Fais: bannière « N nouvelles brèves » (contrôle léger toutes les 5 min via une requête count head, en pause quand l'onglet est caché, animation .banner); clignotement surligneur (.is-updated) quand un temps relatif change; rafraîchissement des temps relatifs chaque minute; expander « Contexte »; raccourcis clavier (/, j, k, f, ?) avec aide; pied de page « Mis à jour il y a X min » (max(updated_at) des brèves publiées); états vide/erreur/chargement finalisés; toast « Lien copié ».
Puis passe la QA et liste ce qui échoue: 1) 375, 768 et 1280 px sans débordement 2) clair/sombre sans flash 3) clavier seul 4) reduced-motion 5) grep: aucun hex dans les composants, aucune police interdite 6) grep: aucune occurrence de SUPABASE_SECRET dans apps/web ni dans dist 7) npm run check, test, build.
```

## P14 · API de news complémentaire (option, Plan → Act)
```text
Prérequis (moi): clé NEWS_API_KEY (NewsData.io ou GNews) après lecture de leurs conditions (offre gratuite: usage non commercial, retard d'environ 12 h).
Ajoute ingest/src/newsApi.ts: un adaptateur qui renvoie le même format que fetchFeeds (titre, URL, extrait, date, source), quota journalier respecté (compteur par exécution, plafond configurable), actif seulement si NEWS_API_KEY est défini. Aucun changement du clustering ni de l'IA. Tests avec fixtures.
```

---
## Prompts utilitaires
**Reprise (nouvelle conversation, mode Plan)**
```text
Lis .clinerules/ et docs/PLAN.md. J'en suis au prompt P__ (phase __). État actuel: [colle `git log --oneline -5` et le résultat de `npm run check`, `npm test`, `npm run build`]. Résume ce qui existe et ce qui manque, puis propose un plan court. N'écris aucun code avant mon accord.
```
**Debug (mode Plan)**
```text
Erreur: [colle le message complet]. Commande lancée: [commande]. Avant toute modification: explique la cause probable en 3 lignes, liste les fichiers concernés et propose le correctif minimal. Ne touche à rien d'autre.
```
**Revue (mode Plan)**
```text
Relis `git diff HEAD~1` selon .clinerules/. Liste les écarts: secrets, hex ou polices interdites, fichiers > 300 lignes, tests manquants, accessibilité. Ne corrige rien, classe par gravité.
```
**Commit**
```text
Propose un message de commit Conventional Commits pour les changements en cours (feat:, fix:, chore:, docs:, test:). N'exécute pas git push.
```
