import type { PropsWithChildren } from 'react'
export function BoardViewport({
  children,
  rows,
  columns,
  ariaLabel = 'Scrollable board viewport',
}: PropsWithChildren<{ rows: number; columns: number; ariaLabel?: string }>) {
  return (
    <div className="board-viewport" data-rows={rows} data-columns={columns} aria-label={ariaLabel}>
      <div className="board-viewport__content">{children}</div>
    </div>
  )
}
