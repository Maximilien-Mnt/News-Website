# Ce que tu dois faire toi-même

Cases à cocher dans l'ordre. Détail pas à pas des étapes techniques: `docs/SETUP.md`.

## A. Avant d'envoyer le premier prompt à Cline (≈ 45 min)
- [ ] **Décider du nom** (« Brève » par défaut) et vérifier qu'il n'est pas déjà pris (INPI/EUIPO, domaine, Instagram/X). Tu peux changer plus tard: un seul fichier.
- [ ] **Installer**: Git, Node.js 22 LTS ou plus (`node -v`), VS Code, l'extension **Cline**.
- [ ] **Créer le dépôt GitHub** `breve` (vide, sans README). Visibilité: *public* = minutes Actions illimitées mais code visible; *privé* = quota mensuel (suffisant pour ~1 exécution/heure de quelques minutes). Clone-le en local.
- [ ] **Copier le kit** (ce zip) à la racine du dépôt, puis `git add -A && git commit -m "chore: add starter kit" && git push`.
- [ ] **Configurer Cline** (docs/PROMPTS.md, section « Réglages Cline »). Crée une clé Gemini **dédiée à Cline** (projet AI Studio n°1).
- [ ] **(Optionnel) Logo**: dépose les fichiers dans `design/logo/` (specs: `design/logo/README.md`). Sans logo, un texte de remplacement est utilisé.
- [ ] Ouvrir `.env.example`, le copier en `.env` (rien à remplir à ce stade).

## B. Quand créer quoi (le bon moment)
| Avant le prompt | À faire | Pourquoi |
|---|---|---|
| P0 | Section A terminée | Cline lit `.clinerules` et `docs/` |
| P6 | **Supabase**: nouveau projet, exécuter `0001_init.sql` puis `seed.sql`, copier URL + clé publique dans `.env` (SETUP.md §B) | le fil lit la base |
| P7 | Clé **secrète** Supabase dans `.env` | l'ingestion écrit en base |
| P9 | **Clé Gemini n°2** (projet AI Studio séparé, dédié à l'ingestion), choisir `LLM_MODEL` | ne pas partager le quota avec Cline |
| P11 | **Secrets et variables GitHub Actions** (SETUP.md §E) | le cron lit les secrets |
| Après P3 (site qui build) | **Projet Cloudflare** connecté au dépôt (SETUP.md §D) | déploiement automatique à chaque push |
| P12 | **Projet PostHog** « breve » dans ton compte existant (SETUP.md §F) | stats |
| Avant la mise en ligne publique | Pages légales, lecture des conditions des flux RSS, domaine éventuel | conformité |

## C. Décisions qui t'appartiennent
- [ ] Dépôt public ou privé · licence du code (MIT ?) · nom de domaine (⬜, sinon `*.pages.dev`).
- [ ] Éditeur du site (toi, personne physique?) et adresse de contact pour les mentions légales (Luxembourg/UE: fais valider par un professionnel; Cline ne donne pas de conseil juridique).
- [ ] Liste des sources: garder, retirer, ajouter (`ingest/sources.seed.json`). Vérifier les conditions de chaque flux.
- [ ] Mention IA: valider le texte de la bulle et de la page Méthode.
- [ ] Choix éditoriaux: seuil de publication (importance minimale), catégories, sujets exclus.

## D. Récurrent (≈ 10 min/semaine)
- [ ] Table `ingestion_runs`: erreurs, flux en échec, nombre d'appels IA.
- [ ] Quotas Gemini (AI Studio) et espace Supabase (Dashboard > Usage).
- [ ] Dépôt public: un commit au moins tous les 60 jours (sinon le cron est désactivé).
- [ ] Rotation des clés si une fuite est suspectée (SETUP.md §I).
