# Stack (coût: 0 €). Limites vérifiées le 29/10/2026 par recherche; reconfirme sur les pages officielles avant de t'y fier.

| Couche | Choix | Pourquoi / limites |
|---|---|---|
| Code assisté | Cline (VS Code) + modèles gratuits | Cline propose des modèles marqués gratuits dans son sélecteur; sinon clé Gemini (AI Studio) ou modèles `:free` d'OpenRouter. Limites de débit fréquentes: prévoir de relancer plus tard. |
| Frontend | Astro + îlots React + TypeScript + CSS (tokens) | Site statique: 0 € et 0 CPU serveur. Pas de Tailwind: la marque passe par des tokens CSS. |
| UI | Radix Popover (bulle de glossaire), `lucide-react` (icônes), `zod` | accessibilité prête à l'emploi |
| Hébergement web | Cloudflare (Pages ou Workers + assets statiques) | Les assets statiques sont gratuits; tu as déjà un compte. Les Workers gratuits sont limités (100 000 requêtes/jour, 10 ms de CPU, 50 sous-requêtes par exécution): **ne pas y faire l'ingestion**. |
| Ingestion horaire | GitHub Actions (cron) + Node 22 | Pas de limite de CPU des Workers. Minutes gratuites généreuses (illimitées en dépôt public; quota mensuel en privé). Le cron peut avoir quelques minutes de retard. Dépôt public: workflows planifiés désactivés après ~60 jours sans activité. |
| Base de données | Supabase (Postgres, RLS) | Gratuit: 2 projets actifs par organisation, 500 Mo de base, ~5 Go de sortie/mois, mise en pause après une semaine d'inactivité (l'ingestion horaire l'évite). |
| IA runtime | Google Gemini API, modèle Flash/Flash-Lite (`LLM_MODEL`) | Le palier gratuit couvre les modèles Flash; quotas par modèle et par projet, visibles dans AI Studio. Les contenus du palier gratuit peuvent servir à améliorer les produits Google (ici: titres publics). Usage commercial = palier payant. |
| Flux d'actus | RSS de médias (principal) | Temps réel et gratuit. Les API de news gratuites (GNews, NewsData.io…) ont ~12 h de retard et un usage non commercial: optionnelles. |
| Stats | PostHog (compte existant), mode sans cookies | `persistence: "memory"`, pas d'autocapture. |
| Tests/qualité | Vitest, `astro check`, `tsc`, Prettier, GitHub Actions CI | |

## Si tu dépasses les quotas ou monétises
IA payante (Gemini paid tier, ou autre), Supabase Pro (25 $/mois environ), contrats avec les médias/API licenciées. Rien dans l'architecture ne change.
