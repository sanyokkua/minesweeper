import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  rows: number
  columns: number
  ariaLabel?: string
  onScroll?: () => void
}>

export function BoardViewport({
  children,
  rows,
  columns,
  ariaLabel = 'Scrollable board viewport',
  onScroll,
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ top: false, right: false, bottom: false, left: false })
  const updateEdges = useCallback(() => {
    const element = viewportRef.current
    if (!element) return
    setEdges({
      top: element.scrollTop > 1,
      right: element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
      bottom: element.scrollTop + element.clientHeight < element.scrollHeight - 1,
      left: element.scrollLeft > 1,
    })
  }, [])

  useEffect(() => {
    updateEdges()
    window.addEventListener('resize', updateEdges)
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateEdges)
    if (viewportRef.current && observer) observer.observe(viewportRef.current)
    return () => {
      window.removeEventListener('resize', updateEdges)
      observer?.disconnect()
    }
  }, [columns, rows, updateEdges])

  return (
    <div className="board-viewport-frame" data-rows={rows} data-columns={columns}>
      <div
        className="board-viewport"
        ref={viewportRef}
        aria-label={ariaLabel}
        onScroll={() => {
          updateEdges()
          onScroll?.()
        }}
      >
        <div className="board-viewport__content">{children}</div>
      </div>
      {(['top', 'right', 'bottom', 'left'] as const).map((edge) => (
        <span
          key={edge}
          className={`board-edge-cue board-edge-cue--${edge}`}
          data-edge-cue={edge}
          data-visible={edges[edge]}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}
