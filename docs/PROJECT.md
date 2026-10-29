# Brève: document produit

## Vision
Un site d'actualité où chaque info tient en 1 à 3 paragraphes, en français, pour le monde entier. Chaque brève renvoie aux sources d'origine, explique les mots difficiles au survol, porte un score d'importance et un maximum de métadonnées, et se filtre/trie finement. Mise à jour toutes les heures.

## Principes (non exhaustifs)
1. Court d'abord. Si ça ne tient pas en 300 caractères, on coupe.
2. Transparent: sources visibles, IA signalée, méthode publique.
3. Fiable avant d'être rapide: pas de fait inventé; en cas de doute, ne pas publier.
4. Sobre: pas de pub, pas de pistage individuel, pas de dark patterns.

## Périmètre MVP (dans le périmètre)
Ingestion RSS (≈13 sources fr/en) · clustering par événement · résumé FR par IA (JSON validé) · glossaire · score d'importance + hot_score · fil avec filtres/tris/URL partageables · page brève · pages Glossaire/Méthode/À propos/Légal · thème clair/sombre · stats sans cookies · déploiement gratuit.
## Hors périmètre MVP
Comptes utilisateurs, commentaires, notifications push, appli mobile native, newsletter, SSR/SEO avancé, embeddings, recherche plein texte avancée, images, monétisation, multilingue (UI uniquement FR).

## Flux de données
```
RSS (13 flux)  ──►  ingest (GitHub Actions, 1×/h)
                     1. fetch + normalise + dédoublonne  → raw_articles
                     2. cluster (similarité des titres)   → stories + story_sources
                     3. résumé IA (Gemini, JSON + zod)    → headline/summary/glossaire/lieux/score
                     4. score + hot_score, publication    → stories.status = published
                                   │
                     Supabase (Postgres + RLS, lecture publique de `feed_stories`)
                                   │
                     apps/web (Astro statique, Cloudflare) ── supabase-js dans le navigateur
```

## Règles de contenu et droit d'auteur
- On stocke titre, URL, date et extrait court (≤ 500 car.) fournis par les flux. Jamais le texte intégral, jamais les images.
- Résumés reformulés, sans citation. Sources toujours affichées et liées.
- Chaque média a ses conditions d'usage des flux: les lire avant la mise en ligne publique; retirer un flux sur demande. Une page de contact permet les demandes de retrait.
- Les offres gratuites (IA, API de news) limitent souvent l'usage commercial: OK pour un projet perso; à revoir avant toute monétisation.
- Les API de news gratuites ont en général 12 à 24 h de retard et un usage non commercial: **le RSS est la source principale**, les API sont un complément optionnel (prompt P14).

## Score d'importance
- `llm_importance` (0-100): jugement du modèle (rubrique dans `ingest/prompts/summarize.system.md`).
- `S` = min(1, (source_count − 1) / 4) · `A` = max(authority des sources) / 5 · `L` = llm_importance / 100.
- `importance` = round(100 × (0,45·S + 0,20·A + 0,35·L)).
- `hot_score` = importance × exp(−âge_en_heures / 18), recalculé à chaque exécution pour les brèves de moins de 72 h. Âge = depuis `last_source_at`.
- Niveaux d'affichage: ≥ 85 essentiel · 65-84 important · 40-64 à suivre · < 40 en bref.

## Clustering (MVP)
Tokens normalisés du titre (minuscules, sans accents, sans mots vides fr/en, lemmatisation légère). Deux articles de la même fenêtre de 48 h sont du même événement si Jaccard ≥ 0,45 ou si ≥ 2 entités (mots capitalisés) en commun et Jaccard ≥ 0,30. Le titre traduit n'est pas disponible avant l'IA: les articles en langues différentes se regroupent mal au MVP. Phase 2: embeddings (pgvector).

## Résumé IA: cycle
Nouvelle brève ou nouvelle source ⇒ `needs_resummary = true` ⇒ résumé à la prochaine exécution, dans la limite `LLM_MAX_CALLS_PER_RUN` (priorité aux brèves les plus couvertes). Publication = résumé valide. Échec = reste `draft`.

## Métadonnées (stockées → affichées)
titre, résumé, contexte, catégorie, importance (+ niveau), hot_score (tri), sources (nom, domaine, icône, URL, titre original, date), nombre de sources, `event_at` (date de l'événement, absolue), `first_seen_at`, `last_source_at`, `updated_at` (relatives dans le fil, absolues dans la page brève), lieux (nom + pays), pays (filtre), langues d'origine, termes de glossaire, modèle + version du prompt (page brève uniquement).
