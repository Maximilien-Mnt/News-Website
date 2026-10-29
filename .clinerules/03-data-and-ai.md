# Données, droit d'auteur, IA
- Stocker uniquement: titre, URL, extrait court du flux (<= 500 caractères), date, source. Jamais le texte intégral d'un article, jamais d'images des sources.
- Les résumés sont originaux (reformulation, pas de citation) et chaque brève affiche ses sources liées. Mention visible « Résumé généré par IA » avec lien vers la page Méthode.
- Le LLM ne reçoit que titres + extraits. Prompt: ingest/prompts/summarize.system.md. Schéma: ingest/prompts/summary.schema.json. Toute sortie est validée avec zod avant écriture; sinon 1 nouvelle tentative, puis la brève reste `draft`.
- Idempotence: relancer l'ingestion ne crée jamais de doublon (clé `url_hash`, upsert).
- Quotas gratuits: respecter `LLM_MAX_CALLS_PER_RUN`; sur erreur 429, attendre avec backoff exponentiel puis reporter à l'exécution suivante (`needs_resummary = true`). Ne jamais boucler sans limite.
- Mode `DRY_RUN=true`: aucune écriture en base, aucun appel LLM facturable; affiche ce qui serait fait.
- Chaque exécution écrit une ligne dans `ingestion_runs` (compteurs et erreurs).
- Les noms de modèles viennent de variables d'environnement (`LLM_MODEL`), jamais codés en dur.
