import type { PropsWithChildren } from 'react'
type Props = PropsWithChildren<{ selected: boolean; onSelect: () => void; className?: string }>
export function SelectableOption({ selected, onSelect, children, className = '' }: Props) {
    return (
        <button
            type="button"
            className={`selectable-option ${selected ? 'is-selected' : ''} ${className}`}
            aria-pressed={selected}
            onClick={onSelect}
        >
            {children}
        </button>
    )
}
