# Méthode de travail
- Mode Plan: propose le plan (fichiers à créer/modifier, commandes, risques) en moins de 15 lignes et attends la validation. Mode Act: exécute le plan validé, sans élargir le périmètre.
- Commande non interactive uniquement (ajoute les flags `--yes`, `--no-git`, etc.). Si un CLI interactif bloque, crée les fichiers à la main.
- Après chaque tâche réussie, propose un message de commit au format Conventional Commits (feat:, fix:, chore:, docs:, test:). Ne fais pas `git push`.
- Si une erreur persiste après 3 tentatives, arrête-toi, explique ce que tu as essayé et demande la marche à suivre. Ne boucle pas.
- Tests: Vitest. Toute fonction pure (formatage, filtres, clustering, score, parsing glossaire, typographie) a des tests.
- Réponds de façon concise: liste des fichiers touchés, commandes lancées et leur résultat, points ouverts.
