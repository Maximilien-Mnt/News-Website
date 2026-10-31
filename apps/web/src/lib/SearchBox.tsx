/**
 * Composant SearchBox - Barre de recherche visible en-tête.
 *
 * Features :
 * - Input de recherche avec icône Lucide "Search"
 * - Raccourci clavier " / " pour focuser l'input
 * - Gestion du focus et fermeture Escape
 * - Accessible avec aria-label
 */
import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'

export function SearchBox({ onSearch, onKeyDown }: { onSearch: (query: string) => void; onKeyDown?: (event: KeyboardEvent) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')

  // Gestion du raccourci " / " au chargement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/') {
        event.preventDefault()
        if (inputRef.current) {
          inputRef.current.focus()
          setValue('')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Fermeture Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (inputRef.current) {
          inputRef.current.blur()
          setValue('')
        }
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setValue(query)
    onSearch(query)
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Icon name="search" style={{ marginRight: '8px', color: 'var(--c-ink-2)' }} />
      <input
        ref={inputRef}
        type="search"
        placeholder="Rechercher..."
        value={value}
        onChange={handleInputChange}
        style={{
          padding: '6px 12px',
          borderRadius: '4px',
          border: '1px var(--c-line) solid',
          fontSize: '0.875rem',
          width: '250px',
        }}
        aria-label="Rechercher des brèves"
        autoFocus
      />
    </div>
  )
}
