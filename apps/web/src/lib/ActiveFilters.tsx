/**
 * Composant ActiveFilters - Affiche les filtres actifs sous forme de puces.
 *
 * Affiche chaque filtre actif sous forme de puce style "pilule" avec:
 * - Le nom du filtre
 * - La valeur actuelle
 * - Bouton "×" pour retirer ce filtre
 * - Bouton "Tout effacer" en bas
 */
import { useFilters } from '../lib/useFilters'
import type { Filters } from './filters'

export function ActiveFilters({ onFilterRemove, onReset }: { onFilterRemove: (key: string) => void; onReset: () => void }) {
  const { filters } = useFilters()

  const activeKeys = Object.entries(filters).filter(([key, value]) => {
    // Considérer comme actif si ce n'est pas la valeur par défaut
    const defaults: Record<string, string | string[]> = {
      q: '',
      periode: '24h',
      cat: [],
      imp: '',
      pays: [],
      src: [],
      lang: [],
      tri: 'une',
    }
    const defaultVal = defaults[key as keyof typeof defaults]
    if (Array.isArray(defaultVal)) return (value as string[]).length > 0
    return value !== defaultVal
  }) as [string, Filters[keyof Filters]][]

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '16px',
        padding: '8px',
        borderRadius: '4px',
        background: 'var(--c-surface)',
        border: '1px var(--c-line) solid',
      }}
    >
      {activeKeys.map(([key, value], index) => {
        const keyLabels: Record<string, string> = {
          q: 'Recherche',
          periode: 'Période',
          cat: 'Catégorie',
          imp: 'Importance',
          pays: 'Pays',
          src: 'Source',
          lang: 'Langue',
          tri: 'Tri',
        }

        return (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--c-ink)',
              borderRadius: '4px', // pilule radius
              padding: '4px 8px',
              fontSize: '0.75rem',
            }}
          >
            <span style={{ marginRight: '4px' }}>{keyLabels[key]}</span>
            <span>{value}</span>
            <button
              onClick={() => onFilterRemove(key)}
              style={{
                marginLeft: '8px',
                background: 'none',
                border: 'none',
                color: 'var(--c-ink)',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.875rem',
              }}
            >
              ×
            </button>
          </div>
        )
      })}

      <div style={{ marginTop: '8px', textAlign: 'right' }}>
        <button
          onClick={onReset}
          style={{
            margin: '0 4px',
            padding: '6px 12px',
            borderRadius: '4px',
            border: '1px var(--c-line) solid',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Tout effacer
        </button>
      </div>
    </div>
  )
}