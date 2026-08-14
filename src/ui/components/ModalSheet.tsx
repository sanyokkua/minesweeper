import { useEffect, useId, useRef, type KeyboardEvent, type PropsWithChildren, type ReactNode } from 'react'
import { IconAction } from './IconAction'

type Props = PropsWithChildren<{
    open: boolean
    title: string
    onClose: () => void
    closeLabel: string
    actions?: ReactNode
    className?: string
}>

export function ModalSheet({ open, title, onClose, closeLabel, actions, children, className = '' }: Props) {
    const headingRef = useRef<HTMLHeadingElement>(null)
    const dialogRef = useRef<HTMLDivElement>(null)
    const previousFocusRef = useRef<HTMLElement | null>(null)
    const wasOpenRef = useRef(false)
    const headingId = useId()

    useEffect(() => {
        if (open) {
            previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
            wasOpenRef.current = true
            headingRef.current?.focus()
        } else if (wasOpenRef.current) {
            previousFocusRef.current?.focus()
            previousFocusRef.current = null
            wasOpenRef.current = false
        }
    }, [open])

    useEffect(() => {
        if (!open) return
        const handleKey = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [onClose, open])

    const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Tab') return
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        )
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && (document.activeElement === first || document.activeElement === headingRef.current)) {
            event.preventDefault()
            last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
        }
    }

    if (!open) return null
    return (
        <div className="modal-layer modal-layer--centered" role="presentation">
            <div
                className={`modal-sheet ${className}`}
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={headingId}
                onKeyDown={trapFocus}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-sheet__header">
                    <h2 id={headingId} tabIndex={-1} ref={headingRef}>
                        {title}
                    </h2>
                    <IconAction label={closeLabel} onClick={onClose}>
                        ×
                    </IconAction>
                </div>
                <div className="modal-sheet__body">{children}</div>
                {actions ? <div className="modal-sheet__actions">{actions}</div> : null}
            </div>
        </div>
    )
}
