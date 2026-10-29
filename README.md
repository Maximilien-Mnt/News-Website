# Brève: kit de démarrage

Copie le **contenu** de ce dossier (fichiers cachés inclus: `.clinerules`, `.github`, `.env.example`) **à la racine de ton dépôt GitHub**, puis suis `docs/TODO-USER.md` et envoie les prompts de `docs/PROMPTS.md` à Cline, un par un.

| Dossier / fichier | Rôle |
|---|---|
| `.clinerules/` | Règles chargées automatiquement par Cline (projet, méthode, design, données/IA) |
| `docs/PROJECT.md` | Produit, périmètre, flux, score, droit d'auteur |
| `docs/PLAN.md` | Phases et critères de fin |
| `docs/STACK.md` | Outils, limites gratuites, plan B |
| `docs/TODO-USER.md` | **Ce que tu fais toi-même**, dans l'ordre |
| `docs/SETUP.md` | Pas à pas: GitHub, Supabase, Gemini, Cloudflare, Actions, PostHog |
| `docs/PROMPTS.md` | **Les prompts P0 à P14**, modes Plan/Act, réglages Cline |
| `design/DESIGN-SPEC.md` | Spécification design/UX exhaustive |
| `design/ICONS.md` | Icônes (Lucide) et correspondances |
| `design/tokens.css`, `fonts.css`, `base.css`, `animations.css`, `fonts/` | Design system prêt à l'emploi |
| `design/logo/README.md` | Liste des fichiers de logo à fournir |
| `supabase/` | Schéma SQL (`0001_init.sql`) et données de démo |
| `ingest/` | Prompt IA, schéma JSON, liste de flux RSS |
| `.github/workflows/` | `ingest.yml` (cron horaire), `ci.yml` |
| `.env.example`, `package.json`, `tsconfig.base.json`, `.gitignore`, `.nvmrc`, `.prettierrc`, `.editorconfig` | Configuration |
| `apps/web/public/_headers` | En-têtes de sécurité/cache Cloudflare |
| `scripts/sync-design.mjs` | Copie `design/` vers `apps/web` (`npm run sync:design`) |
