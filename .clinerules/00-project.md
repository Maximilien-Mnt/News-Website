# Projet: Brève (nom provisoire)
Site de news en français, monde entier: articles ultra-courts (1 à 3 phrases), vulgarisés, avec sources liées, glossaire au survol, score d'importance et métadonnées riches, tris/filtres. Budget infra: 0 €.

Lis d'abord: docs/PROJECT.md (produit), docs/STACK.md (outils), design/DESIGN-SPEC.md (UI/UX), docs/PLAN.md (phases).

## Structure (ne pas la changer sans demander)
- apps/web      Astro + îlots React + TypeScript strict. Site statique (hébergé Cloudflare). Lit Supabase côté navigateur (clé publique + RLS).
- ingest        Node 22 + TypeScript (tsx), lancé par GitHub Actions toutes les heures. Écrit dans Supabase avec la clé secrète.
- supabase      migrations SQL (source de vérité du schéma) + seed.sql
- design        tokens, polices, specs. Copiés vers apps/web par `npm run sync:design`. Ne jamais éditer les copies dans apps/web, éditer design/.
- docs          documentation. Mets-la à jour quand tu changes l'architecture.

## Règles d'or
1. Une tâche à la fois. Fais uniquement ce que le prompt demande, puis arrête-toi et résume.
2. Ne jamais commiter de secret. Les clés vont dans `.env` (ignoré par git) ou dans les secrets GitHub. La clé secrète Supabase n'est JAMAIS utilisée dans apps/web.
3. N'invente pas d'API ni de nom de package. Si tu n'es pas sûr, lis la documentation officielle ou `npm view <package>` avant d'écrire du code.
4. Avant d'ajouter une dépendance non listée dans docs/STACK.md, demande.
5. Après chaque tâche: `npm run check`, `npm test` et `npm run build` doivent passer. Sinon, corrige avant de conclure.
6. Textes d'interface en français. Identifiants, commentaires de code et noms de fichiers en anglais.
7. Pas de code mort, pas de TODO sans explication, fichiers < 300 lignes (découpe sinon).
