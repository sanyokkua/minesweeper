import type { KeyboardEvent } from 'react'
import type { GameSession } from '../../domain/gameTypes'

export function handleBoardKeyDown(
  event: KeyboardEvent<HTMLButtonElement>,
  index: number,
  session: GameSession,
  onPrimary: (index: number) => void,
  onSecondary: (index: number) => void,
): number | null {
  const { row, column } = {
    row: Math.floor(index / session.config.columns),
    column: index % session.config.columns,
  }
  let target: { row: number; column: number } | null = null
  if (event.key === 'ArrowUp') target = { row: row - 1, column }
  if (event.key === 'ArrowDown') target = { row: row + 1, column }
  if (event.key === 'ArrowLeft') target = { row, column: column - 1 }
  if (event.key === 'ArrowRight') target = { row, column: column + 1 }
  if (target) {
    event.preventDefault()
    if (
      target.row >= 0 &&
      target.column >= 0 &&
      target.row < session.config.rows &&
      target.column < session.config.columns
    ) {
      const next = target.row * session.config.columns + target.column
      document.getElementById(`board-cell-${next}`)?.focus()
      return next
    }
    return index
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    onPrimary(index)
  }
  if (event.key.toLowerCase() === 'f') {
    event.preventDefault()
    onSecondary(index)
  }
  return null
}

export const BoardKeyboardController = handleBoardKeyDown
