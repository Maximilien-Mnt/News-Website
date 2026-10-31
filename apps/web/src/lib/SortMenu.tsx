/**
 * Composant SortMenu - Permet de trier le fil d'actualités.
 *
 * Propose plusieurs options de tri :
 * - "À la une" (hot_score décroissant) - défaut
 * - "Récent" (par date d'événement décroissante)
 * - "Plus ancien" (par date d'événement croissante)
 *
 * Utilise un <select> avec icône Lucide pour indiquer le tri actif.
 */
import { useFilters } from '../lib/useFilters'
import { Icon } from '../components/Icon'

export function SortMenu({ onSortChange }: { onSortChange: (tri: string) => void }) {
  const { filters } = useFilters()
  const { tri } = filters

  return (
    <select
      style={{
        padding: '6px 12px',
        borderRadius: '4px',
        border: '1px var(--c-line) solid',
        fontSize: '0.875rem',
        cursor: 'pointer',
      }}
      onChange={(e) => onSortChange(e.target.value)}
    >
      <option value="une" selected={tri === 'une'}>
        À laune
        <Icon name="sort" width="1em" style={{ marginLeft: '4px', opacity: 0.7 }} />
      </option>
      <option value="recent" selected={tri === 'recent'}>
        Récent
        <Icon name="clock" width="1em" style={{ marginLeft: '4px', opacity: 0.7 }} />
      </option>
      <option value="old" selected={tri === 'old'}>
        Plus ancien
        <Icon name="chevron-down" width="1em" style={{ marginLeft: '4px', opacity: 0.7 }} />
      </option>
    </select>
  )
}