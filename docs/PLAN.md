# Plan par phases (chaque phase = un ou deux prompts de docs/PROMPTS.md)

| Phase | Contenu | Prompts | Fait quand… |
|---|---|---|---|
| 0 Préparation | Repo, kit copié, Cline configuré, comptes créés | (toi) docs/TODO-USER.md | `npm install` passe, premier commit poussé |
| 1 Fondations web | Monorepo, Astro, design system branché, thème, en-tête/pied | P0, P1 | site vide mais fidèle à la marque en clair/sombre |
| 2 Fil (maquette) | Types, formats FR, StoryItem ×4 niveaux, sources, skeleton | P2, P3 | 12 brèves factices bien rendues |
| 3 Interactions | Glossaire + bulles, filtres, tri, URL | P4, P5 | tout se filtre/trie, URL partageable, clavier OK |
| 4 Données | Supabase branché, lecture réelle du seed | P6 | le fil affiche `seed.sql` |
| 5 Ingestion | Fetch RSS, clustering, IA, scoring | P7, P8, P9, P10 | `npm run ingest` remplit la base de vraies brèves |
| 6 Automatisation | GitHub Actions horaire | P11 | une exécution planifiée réussit sans toi |
| 7 Mise en ligne | Cloudflare, stats, SEO, pages, légal | P12 (+ déploiement docs/SETUP.md) | site public, stats visibles dans PostHog |
| 8 Finition | Mouvement, états, bannière, raccourcis, QA | P13 | checklist QA de P13 passée |
| 9 Options | API de news complémentaire, SSR, RSS du site, embeddings | P14+ | selon envie |

Règle: ne pas passer à la phase suivante tant que `npm run check`, `npm test`, `npm run build` ne passent pas et que tu as validé à l'écran.
