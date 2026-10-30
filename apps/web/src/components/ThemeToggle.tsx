// Bouton de bascule de thème : 3 états auto / clair / sombre.
// Mémorisé dans localStorage("theme"). Cible tactile >= 44px, focus visible.
// Respecte prefers-reduced-motion.
// Spéc : DESIGN-SPEC §3 (thème manuel + auto).

"use client";

import { useState } from "react";
import { Icon, type IconProps } from "./Icon";

type Theme = "auto" | "light" | "dark";

const THEME_ORDER: Theme[] = ["auto", "light", "dark"];

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "auto";
    try {
      const stored = localStorage.getItem("theme") as Theme | null;
      if (stored === "auto" || stored === "light" || stored === "dark") return stored;
    } catch {
      /* localStorage introuvable */
    }
    return getSystemTheme();
  });

  const nextTheme = (): Theme => {
    const idx = THEME_ORDER.indexOf(theme);
    return THEME_ORDER[(idx + 1) % THEME_ORDER.length]!;
  };

  function cycleTheme() {
    const next = nextTheme();
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore */
    }
  }

  const themes: Record<Theme, { label: string; icon: IconProps["name"] }> = {
    auto: { label: "Suivant (système)", icon: "sun" },
    light: { label: "Clair", icon: "sun" },
    dark: { label: "Sombre", icon: "moon" },
  };

  // Pour l'état "auto", on affiche l'icône du thème suivant pour indiquer le sens
  const displayIcon: IconProps["name"] = theme === "auto" ? "sun" : themes[theme].icon;

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={cycleTheme}
      aria-label={`Bascule vers le thème ${themes[theme].label}`}
      aria-pressed={theme !== "auto"}
      data-theme-value={theme}
      style={{
        minWidth: "44px",
        minHeight: "44px",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name={displayIcon} className={className} />
    </button>
  );
}

export type { Theme };


