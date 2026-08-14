import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import { cellPresentation, cellCoordinate } from '../../domain/gameEngine'
import type { GameSession } from '../../domain/gameTypes'
import { useTranslate } from '../../i18n/useTranslate'

type Props = {
  session: GameSession
  index: number
  tabIndex: number
  onPrimary: (index: number) => void
  onSecondary: (index: number) => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void
  onFocus: (index: number) => void
  onPointerDown: (event: PointerEvent<HTMLButtonElement>, index: number) => void
  onPointerUp: (event: PointerEvent<HTMLButtonElement>, index: number) => void
  onPointerMove: (event: PointerEvent<HTMLButtonElement>, index: number) => void
}

export function BoardCell({
  session,
  index,
  tabIndex,
  onPrimary,
  onSecondary,
  onKeyDown,
  onFocus,
  onPointerDown,
  onPointerUp,
  onPointerMove,
}: Props) {
  const t = useTranslate()
  const coordinate = cellCoordinate(session, index)
  const presentation = cellPresentation(session, index)
  const label =
    presentation.kind === 'open-number'
      ? `${t('game.cellOpen')} ${presentation.number}`
      : t(
          presentation.kind === 'open-zero'
            ? 'game.cellOpen'
            : presentation.kind === 'flagged'
              ? 'game.cellFlagged'
              : presentation.kind === 'mine'
                ? 'game.cellMine'
                : presentation.kind === 'detonated-mine'
                  ? 'game.cellDetonated'
                  : presentation.kind === 'incorrect-flag'
                    ? 'game.cellIncorrect'
                    : 'game.cellHidden',
        )
  const handleContext = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    onSecondary(index)
  }
  return (
    <button
      type="button"
      role="gridcell"
      id={`board-cell-${index}`}
      className={`board-cell board-cell--${presentation.kind}`}
      aria-label={`${t('game.row')} ${coordinate.row + 1}, ${t('game.column')} ${coordinate.column + 1}, ${label}`}
      aria-keyshortcuts="Enter Space F"
      tabIndex={tabIndex}
      onClick={() => onPrimary(index)}
      onContextMenu={handleContext}
      onKeyDown={(event) => onKeyDown(event, index)}
      onFocus={() => onFocus(index)}
      onPointerDown={(event) => onPointerDown(event, index)}
      onPointerUp={(event) => onPointerUp(event, index)}
      onPointerMove={(event) => onPointerMove(event, index)}
    >
      {presentation.kind === 'flagged'
        ? '⚑'
        : presentation.kind === 'mine' || presentation.kind === 'detonated-mine'
          ? '✹'
          : presentation.kind === 'open-number'
            ? presentation.number
            : ''}
    </button>
  )
}
