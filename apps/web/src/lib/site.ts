// Site metadata: single source of truth for the brand name, tagline and URL.
// Spec: DESIGN-SPEC §1 (Identité), docs/PROJECT.md.

export const site = {
  name: "Brève",
  tagline: "L'essentiel en quelques lignes.",
  url: import.meta.env.PUBLIC_SITE_URL || "https://breve.app",
  contactEmail: "",
} as const;

export type Site = typeof site;
