/**
 * Brèves factices pour le fil, les tests et les exemples.
 *
 * Règles respectées :
 *  - 4 niveaux (flash / high / mid / low)
 *  - 1 à 6 sources par brève
 *  - 0 à 3 termes dont la `surface` figure dans le texte
 *  - 2 brèves sans lieu
 *  - uniquement du fictif (pas d'organisation ni de personne réelle)
 */
import type { Story, StorySource, StoryTerm } from "../types.js";

export const SOURCES: StorySource[] = [
  { name: "Agence Horizon", domain: "horizon-info.fr", icon_url: "https://cdn.horizon-info.fr/agence-horizon.svg", url: "https://horizon-info.fr/actu/nouvelle-vague-de-froid", title: "Nouvelle vague de froid en Europe centrale", published_at: "2026-10-30T08:12:00Z" },
  { name: "Bureau du Monde", domain: "monde-quotidien.fr", icon_url: "https://cdn.monde-quotidien.fr/bureau-du-monde.svg", url: "https://monde-quotidien.fr/economics/market-bear", title: "Marché boursier différemment", published_at: "2026-10-30T06:45:00Z" },
  { name: "Cercle Atlantique", domain: "atlantique-journal.fr", icon_url: null, url: "https://atlantique-journal.fr/tech/nouveau-modele-industrie", title: "Nouveau modèle présenté", published_at: "2026-10-29T22:10:00Z" },
  { name: "Rue Libre", domain: "rue-libre.fr", icon_url: "https://cdn.rue-libre.fr/rue-libre.svg", url: "https://rue-libre.fr/culture/estival", title: "Événement culturel", published_at: null },
  { name: "Northline News", domain: "northline.news", icon_url: null, url: "https://northline.news/sport/fete-sportive", title: "Fête sportive", published_at: null },
  { name: "Ocean Report", domain: "ocean-report.org", icon_url: "https://cdn.ocean-report.org/ocean-report.svg", url: "https://ocean-report.org/science/bec/sardine", title: "Pêche sardine", published_at: "2026-10-28T14:30:00Z" },
];

export const WORDS: StoryTerm[] = [
  { surface: "jet stream", term: "jet stream", definition: "Courant d'air haut qui influence les températures." },
  { surface: "actionneurs", term: "actionneurs", definition: "Entreprise qui pilote un marché." },
  { surface: "modèle", term: "modèle", definition: "Procédé répété pour produire un objet." },
  { surface: "glacière", term: "glacière", definition: "Protection froide dans un bâtiment." },
  { surface: "pont", term: "pont", definition: "Structure reliant deux rives." },
  { surface: "cap", term: "cap", definition: "Limite ou but d'une action." },
];

function story(over: Partial<Story>): Story {
  const base: Story = {
    id: 0,
    slug: "",
    headline: "",
    summary: "",
    explainer: null,
    category: "Monde",
    importance: 0,
    hot_score: 0,
    event_at: null,
    first_seen_at: "",
    last_source_at: "",
    updated_at: "",
    source_count: 0,
    locations: [],
    countries: [],
    languages: [],
    sources: [],
    terms: [],
  };
  return { ...base, ...over };
}
export const STORIES: Story[] = [

]