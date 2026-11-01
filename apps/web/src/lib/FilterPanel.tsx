/**
 * Composant Panneau de filtres.
 *
 * Structure :
 * - <fieldset><legend> pour chaque section (Période, Catégorie, Importance, Pays, Source, Langue)
 * - Compteurs de facettes alignés à droite du legend
 * - Bouton "Réinitialiser" en bas
 *
 * Desktop : colonne sticky à gauche
 * Mobile : bouton "Filtrer" qui ouvre une feuille plein écran
 */
import { useFilters } from '../lib/useFilters'
import type { Filters } from './filters'
import type { Facets } from '../lib/api'

export function FilterPanel({ facets, storiesCount, onReset }: { facets: Facets; storiesCount: number; onReset: () => void }) {
  const { updateFilter } = useFilters()

  return (
    <fieldset
      style={{
        border: '1px var(--c-line) solid',
        borderRadius: '4px',
        padding: '12px',
        marginBottom: '16px',
      }}
    >
      <legend style={{ fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' }}>
        Filtres
        <span style={{ float: 'right', marginLeft: '8px', fontSize: '0.75rem', color: 'var(--c-ink-2)' }}>
          {facets.periode['24h']} sur {storiesCount}
        </span>
      </legend>

      <div style={{ margin: '8px 0' }}>
        <select
          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px var(--c-line) solid' }}
          onChange={(e) => updateFilter('periode', e.target.value as Filters['periode'])}
        >
          <option value="24h">24h</option>
          <option value="7j">7j</option>
          <option value="1m">1 mois</option>
          <option value="3m">3 mois</option>
          <option value="6m">6 mois</option>
          <option value="1a">1 an</option>
        </select>
      </div>

      <div style={{ margin: '8px 0' }}>
        <select
          multiple
          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px var(--c-line) solid' }}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((o) => o.value)
            updateFilter('cat', selected)
          }}
        >
          <option value="Environnement">Environnement</option>
          <option value="Science">Science</option>
          <option value="Tech">Tech</option>
          <option value="Culture">Culture</option>
        </select>
      </div>

      <div style={{ margin: '8px 0' }}>
        <select
          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px var(--c-line) solid' }}
          onChange={(e) => updateFilter('imp', e.target.value as Filters['imp'])}
        >
          <option value="">Tous</option>
          <option value="essential">Essentiel (≥85)</option>
          <option value="important">Important (≥65)</option>
          <option value="follow">Suivre (≥40)</option>
          <option value="brief">Bref (&lt;40)</option>
        </select>
      </div>

      <div style={{ margin: '8px 0' }}>
        <select
          multiple
          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px var(--c-line) solid' }}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((o) => o.value.toUpperCase())
            updateFilter('pays', selected)
          }}
        >
          <option value="FR">France</option>
          <option value="CH">Suisse</option>
          <option value="US">États-Unis</option>
          <option value="GB">Royaume-Uni</option>
        </select>
      </div>

      <div style={{ margin: '8px 0' }}>
        <select
          multiple
          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px var(--c-line) solid' }}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((o) => o.value)
            updateFilter('src', selected)
          }}
        >
          <option value="Le Monde">Le Monde</option>
          <option value="BBC">BBC</option>
          <option value="Rue Libre">Rue Libre</option>
          <option value="Ocean Report">Ocean Report</option>
        </select>
      </div>

      <div style={{ margin: '8px 0' }}>
        <select
          multiple
          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px var(--c-line) solid' }}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((o) => o.value)
            updateFilter('lang', selected)
          }}
        >
          <option value="fr">Français</option>
          <option value="en">Anglais</option>
          <option value="es">Espagnol</option>
        </select>
      </div>

      <div style={{ margin: '16px 0', textAlign: 'right' }}>
        <button
          onClick={() => onReset()}
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
          Réinitialiser
        </button>
      </div>
    </fieldset>
  )
}