# Mise en place pas à pas: dépôt, base, IA, hébergement, CI, stats

Les noms de menus changent parfois: si un libellé diffère, cherche l'équivalent. Ne colle jamais une clé secrète dans le chat de Cline ni dans un fichier commité.

## A. GitHub
1. github.com > New repository > nom `breve` > **sans** README/.gitignore/licence > Create.
2. `git clone <url> && cd breve`, copie le kit à la racine, `git add -A && git commit -m "chore: add starter kit" && git push -u origin main`.
3. Settings > Actions > General: vérifie que les Actions sont autorisées.

## B. Supabase (base de données)
Limite gratuite: 2 projets actifs par organisation. Si ton autre projet occupe déjà un des deux emplacements, il en reste un; au besoin crée une nouvelle organisation (gratuite) pour celui-ci.
1. Dashboard > New project. Nom `breve`. Région **Frankfurt (eu-central)** (la plus proche de Luxembourg). Génère un mot de passe de base fort et enregistre-le dans ton gestionnaire de mots de passe.
2. Attends la fin de la création. Ouvre **SQL Editor** > New query > colle tout `supabase/migrations/0001_init.sql` > Run. Résultat attendu: « Success ».
3. (Développement) Nouvelle requête > colle `supabase/seed.sql` > Run.
4. Vérifie: Table Editor montre `stories`, `sources`… ; SQL Editor: `select count(*) from public.feed_stories;` renvoie 6 (avec le seed).
5. **Settings > API Keys** (ou « API »): copie
   - Project URL → `.env`: `PUBLIC_SUPABASE_URL` **et** `SUPABASE_URL`
   - clé **publishable** (anciennes interfaces: « anon ») → `PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - clé **secret** (anciennes interfaces: « service_role ») → `SUPABASE_SECRET_KEY` (jamais dans le navigateur, jamais commitée)
6. Sécurité: Database > Tables: chaque table doit afficher « RLS enabled ». `raw_articles` et `ingestion_runs` n'ont volontairement aucune politique.
7. Test d'accès public (remplace les valeurs): `curl "$PUBLIC_SUPABASE_URL/rest/v1/feed_stories?select=headline&limit=2" -H "apikey: $PUBLIC_SUPABASE_PUBLISHABLE_KEY"` doit renvoyer 2 titres. Même test sur `raw_articles` doit renvoyer `[]` ou une erreur de droits: c'est voulu.

## C. Google AI Studio (IA)
Quotas par **projet**: crée **deux projets** pour ne pas mélanger Cline et l'ingestion.
1. aistudio.google.com > Get API key > Create API key **dans un nouveau projet** « breve-cline » → à coller dans Cline (provider Google Gemini).
2. Recommence avec un second projet « breve-ingest » → `.env` et secrets GitHub: `GEMINI_API_KEY`.
3. Dans AI Studio, ouvre la page des limites de débit (Rate limits / Usage) de « breve-ingest ». Repère un modèle **Flash ou Flash-Lite** qui affiche un palier gratuit, note son **nom exact** → `LLM_MODEL`. Note ses requêtes par minute (RPM) et par jour (RPD).
4. Règle `LLM_MAX_CALLS_PER_RUN` ≤ (RPD × 0,5) / 24. Exemple: 1 000 RPD → 20 par exécution. Commence à 20.
5. Les modèles et quotas gratuits évoluent: revérifie ce réglage une fois par mois.

## D. Cloudflare (hébergement du site)
Fais cette étape **après P3**, quand `npm run build` réussit.
Option recommandée: **Pages** (si ton menu ne l'offre plus, utilise le flux Workers avec assets statiques: demande à Cline de générer `wrangler.jsonc` avec `assets.directory = apps/web/dist`).
1. Dashboard > Workers & Pages > Create > Pages > **Connect to Git** > autorise GitHub > choisis `breve`.
2. Réglages de build (monorepo): Production branch `main` · Framework preset *Astro* (ou None) · **Root directory** vide (racine) · **Build command** `npm ci && npm run build -w apps/web` · **Build output directory** `apps/web/dist`.
3. Variables d'environnement (Production **et** Preview): `NODE_VERSION=22`, `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `PUBLIC_SITE_URL` (l'URL `*.pages.dev` pour l'instant), `PUBLIC_POSTHOG_KEY`, `PUBLIC_POSTHOG_HOST`. **Pas** de clé secrète ici.
4. Save and Deploy. Ouvre l'URL `*.pages.dev`, vérifie le fil.
5. Plus tard: Custom domains > ajoute ton domaine (si DNS chez Cloudflare, c'est automatique).

## E. GitHub Actions (ingestion horaire)
Repo > Settings > Secrets and variables > Actions.
- **Secrets**: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `GEMINI_API_KEY`.
- **Variables**: `LLM_MODEL`, `LLM_MAX_CALLS_PER_RUN` (ex. 20), `INGEST_WINDOW_HOURS` (48).
- Onglet Actions > workflow `ingest` > **Run workflow** (coche *Dry run* pour le premier essai) > lis les logs. Puis relance sans dry run.
- Le cron tourne à la minute 7 de chaque heure; des retards de quelques minutes sont normaux.

## F. PostHog (statistiques sans cookies)
1. Dans ton compte existant: crée un **nouveau projet** « breve » (ne réutilise pas celui de ton autre projet).
2. Project settings: copie la **Project API key** (publique, `phc_…`) → `PUBLIC_POSTHOG_KEY`; note la région (US/EU) → `PUBLIC_POSTHOG_HOST` (`https://eu.i.posthog.com` ou `https://us.i.posthog.com`).
3. Le code doit initialiser avec `persistence: "memory"`, `autocapture: false`, `person_profiles: "identified_only"`: aucune donnée stockée côté visiteur. Vérifie la conformité de ta situation (UE): le kit ne donne pas d'avis juridique.
4. Événements prévus: `filter_changed`, `sort_changed`, `term_opened`, `source_clicked`, `story_opened`, `theme_changed`.

## G. Domaine (optionnel)
Registrar au choix (ou Cloudflare Registrar au prix coûtant). Gratuit tant que tu restes en `*.pages.dev`.

## H. Tests de bout en bout
1. `npm run dev` → le fil montre les brèves de démo.
2. `npm run ingest -- --dry-run` (local, `.env` rempli) → affiche flux lus, articles, clusters, appels IA prévus; rien n'est écrit.
3. `npm run ingest` → `select count(*) from stories where status='published'` augmente; `ingestion_runs` a une ligne sans erreur.
4. Supprime la démo: `delete from public.stories where slug like 'demo-%';`
5. Lance le workflow GitHub à la main, puis attends l'exécution planifiée suivante.
6. Ouvre le site public: les nouvelles brèves apparaissent (ou la bannière « nouvelles brèves »).

## I. Maintenance et incidents
- **Fuite d'une clé**: Supabase > API Keys > régénère la clé; AI Studio > supprime/recrée la clé; mets à jour `.env` et les secrets GitHub.
- **Supabase en pause**: bouton Restore dans le Dashboard (n'arrive pas tant que l'ingestion tourne).
- **Cron arrêté** (dépôt public inactif 60 jours): réactive le workflow depuis l'onglet Actions; fais un commit.
- **429 de Gemini**: baisse `LLM_MAX_CALLS_PER_RUN`; les brèves restantes sont traitées à l'exécution suivante.
- **Flux RSS cassé**: `sources.consecutive_failures` ≥ 5 ⇒ désactivé automatiquement; corrige l'URL puis `update sources set active = true, consecutive_failures = 0 where slug = '…'`.
