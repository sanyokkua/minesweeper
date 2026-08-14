import { useEffect, useRef, type PropsWithChildren, type ReactNode } from 'react'
import { IconAction } from './IconAction'

type Props = PropsWithChildren<{
  open: boolean
  title: string
  onClose: () => void
  closeLabel?: string
  actions?: ReactNode
  className?: string
}>
export function ModalSheet({
  open,
  title,
  onClose,
  closeLabel = 'Close',
  actions,
  children,
  className = '',
}: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (open) headingRef.current?.focus()
  }, [open])
  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, open])
  if (!open) return null
  return (
    <div className="modal-layer" role="presentation">
      <div
        className={`modal-sheet ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-heading"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-sheet__header">
          <h2 id="modal-heading" tabIndex={-1} ref={headingRef}>
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
