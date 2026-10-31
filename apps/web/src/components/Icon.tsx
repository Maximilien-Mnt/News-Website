// Composant icône unique : <Icon name="clock" />.
// Source de vérité : design/ICONS.md (Lucide, licence ISC, grille 24px,
// traits carrés/angulaires forcés par base.css).
// Taille 1.125em (aligne sur le texte), currentColor, aria-hidden="true"
// si décoratif.
//
// Allelité réseau : Lucide renomme parfois ses composants (ex. `ClockArrow`
// → `Clock`). Si un nom d'icône n'existe pas, utiliser l'alias réseau
// correspondant du composant installé : npm ls lucide-react, puis
// importer le composant réseau.

import {
  ArrowUpRight,
  Clock,
  MapPin,
  Layers,
  Signal,
  BookOpenText,
  ListFilter,
  ArrowUpDown,
  Search,
  Sun,
  Moon,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  Globe,
  Languages,
  RefreshCw,
  Calendar,
  Menu,
  Info,
  Link,
  Rss,
  Keyboard,
  TriangleAlert,
} from "lucide-react";

export interface IconProps {
  name:
    | "external"
    | "clock"
    | "pin"
    | "layers"
    | "importance"
    | "glossary"
    | "filter"
    | "sort"
    | "search"
    | "sun"
    | "moon"
    | "close"
    | "check"
    | "chevron-down"
    | "chevron-right"
    | "globe"
    | "languages"
    | "refresh"
    | "calendar"
    | "menu"
    | "info"
    | "link"
    | "rss"
    | "keyboard"
    | "alert";
  "aria-label"?: string; // requis si l'icône est interactive ou informative
  className?: string;
}

const NAMED_ICONS: Record<
  IconProps["name"],
  React.ComponentType<{ className?: string }>
> = {
  external: ArrowUpRight,
  clock: Clock,
  pin: MapPin,
  layers: Layers,
  importance: Signal,
  glossary: BookOpenText,
  filter: ListFilter,
  sort: ArrowUpDown,
  search: Search,
  sun: Sun,
  moon: Moon,
  close: X,
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  globe: Globe,
  languages: Languages,
  refresh: RefreshCw,
  calendar: Calendar,
  menu: Menu,
  info: Info,
  link: Link,
  rss: Rss,
  keyboard: Keyboard,
  alert: TriangleAlert,
};

/**
 * Vérifie à l'exécution que chaque nom est rendu par un composant Lucide
 * existant. Si un nom est absent, lève immédiatement pour signaler le repli
 * (ré-énumérer la version installée de lucide-react).
 */
export function Icon({ name, className }: IconProps) {
  const LucideIcon = NAMED_ICONS[name];
  if (!LucideIcon) {
    // Repli : nommer le composant réseau et re-mapper.
    const aliases: Record<string, string> = {
      glossary: "BookOpen",
      filter: "SlidersHorizontal",
    };
    const fallback = aliases[name];
    if (fallback) {
      throw new Error(`Icône "${name}" manuelle fallback non implémentée - vérifiez lucide-react.`);
    }
    throw new Error(`Icône "${name}" manquante dans lucide-react.`);
  }
  return (
    <LucideIcon
      className={className}
      aria-hidden="true"
    />
  );
}

export default Icon;

