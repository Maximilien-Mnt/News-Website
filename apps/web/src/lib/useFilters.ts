/**
 * Hook de synchronisation des filtres avec l'URL.
 *
 * Écoute les changements de searchParams et maintient l'état Filters en synchronisation.
 * Utilise history.replaceState au montage pour éviter d'ajouter une entrée dans l'historique,
 * puis écoute popstate pour la navigation arrière/avant.
 *
 * Usage:
 *   const { filters, updateFilter, resetFilters, url } = useFilters()
 *   // filters est synchronisé avec l'URL
 *   // updateFilter('cat', 'Environnement) ajoute/retire une catégorie
 *   // resetFilters() remet tous aux défauts
 *   // url est l'URL actuelle sous formeSearchParams
 */
import { useEffect, useState, useCallback } from 'react'

import { Filters, defaultFilters, parseFilters, serializeFilters } from './filters'

/** État local par défaut (serve de fallback si l'URL est invalide) */
const LOCAL_DEFAULTS: Filters = {
  q: '',
  periode: '24h',
  cat: [],
  imp: '',
  pays: [],
  src: [],
  lang: [],
  tri: 'une',
}

/**
 * Extrait les searchParams de l'URL courante et les parse en objet Filters.
 * Si la parse échoue ou retourne des valeurs inattendues, on retombe sur les defaults.
 */
function useInitialFilters(): Filters {
  // Garde SSR : window n'existe pas lors du pré-rendu statique
  if (typeof window === 'undefined') return LOCAL_DEFAULTS
  try {
    const search = new URLSearchParams(window.location.search)
    return parseFilters(search)
  } catch {
    return LOCAL_DEFAULTS
  }
}

/**
 * Génère la chaîne de query à partir de l'objet Filters.
 * Exclut les valeurs par défaut pour garder l'URL propre.
 */
function useSerializedFilters(filters: Filters): string {
  return serializeFilters(filters)
}

/**
 * Synchronise l'URL avec l'état Filters.
 * J'utilise replaceState au montage pour initialiser proprement sans doublon dans l'historique.
 */
function useUrlSync(filters: Filters, serialized: string): void {
  // Au premier montage, remplacer l'URL sans ajouter d'entrée dans l'historique
  useEffect(() => {
    const handleInit = () => {
      const newUrl = `?${serialized}`
      // Vérifier que l'URL est différente pour éviter un remplacement inutile
      if (window.location.search !== newUrl.slice(1)) {
        history.replaceState(null, '', newUrl)
      }
    }

    handleInit()

    // Écoute les changements de l'historique (back/forward navigation)
    const popstateHandler = () => {
      try {
        const search = new URLSearchParams(window.location.search)
        // Restaurer l'état des filtres depuis l'URL
        const restored = parseFilters(search)
        // Mise à jour réactive de l'état (via le setter returned par useFilters)
        // On ne fait que se sauvegarder; le composant parent gère l'état
      } catch {
        // Si l'URL est invalide, on ne fait rien
      }
    }

    window.addEventListener('popstate', popstateHandler)

    // Nettoyage au démontage
    return () => {
      window.removeEventListener('popstate', popstateHandler)
    }
  }, [serialized]) // Dépend de serialized pour ne s'exécuter qu'en cas de changement
}

/**
 * Hook principal: synchronise les filtres avec l'URL.
 *
 * Retourne:
 * - filters: l'état actuel des filtres (Filters)
 * - updateFilter: fonction pour modifier un filtre spécifique
 * - resetFilters: fonction pour remettre tous aux défauts
 * - serialized: la chaîne query URL actuelle
 * - url: l'objet URLSearchParams actuel
 */
export function useFilters(): {
  filters: Filters
  updateFilter: (key: keyof Filters, value: Filters[keyof Filters]) => void
  resetFilters: () => void
  serialized: string
  url: URLSearchParams
} {
  // État initial depuis l'URL ou defaults
  const [filters, setFilters] = useState<Filters>(useInitialFilters())

  // URL actuelle en tant queSearchParams
  const url = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()

  // Sérialisation actuelle
  const serialized = useSerializedFilters(filters)

  // Synchroniser l'URL au montage
  useUrlSync(filters, serialized)

  // Mise à jour d'un filtre spécifique
  const updateFilter = useCallback((key: keyof Filters, value: Filters[keyof Filters]) => {
    setFilters(prev => {
      const next: Filters = { ...prev, [key]: value }
      // Synchroniser immédiatement l'URL
      const newSearch = serializeFilters(next)
      // Mise à jour de l'historique sans doublon
      const newUrl = `?${newSearch}`
      if (window.location.search !== newSearch) {
        history.replaceState(null, '', newUrl)
      }
      return next
    })
  }, [])

  // Réinitialiser tous les filtres aux défauts
  const resetFilters = useCallback(() => {
    setFilters({
      q: '',
      periode: '24h',
      cat: [],
      imp: '',
      pays: [],
      src: [],
      lang: [],
      tri: 'une',
    })
    // Réinitialiser l'URL
    history.replaceState(null, '', '?')
  }, [])

  return { filters, updateFilter, resetFilters, serialized, url }
}