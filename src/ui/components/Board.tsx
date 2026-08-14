import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { GameCommand, GameSession } from '../../domain/gameTypes'
import { primaryCommand, secondaryCommand } from '../../features/preferences/inputMode'
import type { InputMode } from '../../features/persistence/recordCodec'
import { BoardCell } from './BoardCell'
import { BoardKeyboardController } from './BoardKeyboardController'
import { BoardViewport } from './BoardViewport'
import {
  cancelPointerSession,
  createPointerSession,
  shouldCancelForMovement,
  type PointerSession,
} from './boardInteraction'
import { useTranslate } from '../../i18n/useTranslate'

type Props = {
  session: GameSession
  inputMode?: InputMode
  onCommand?: (command: GameCommand) => void
  onPrimary?: (index: number) => void
  onSecondary?: (index: number) => void
}
export function Board({
  session,
  inputMode = 'reveal-first',
  onCommand,
  onPrimary,
  onSecondary,
}: Props) {
  const [focused, setFocused] = useState(0)
  const pointer = useRef<PointerSession | null>(null)
  const suppressPrimary = useRef(false)
  const t = useTranslate()
  const primary = (index: number) => {
    if (suppressPrimary.current) {
      suppressPrimary.current = false
      return
    }
    const coordinate = {
      row: Math.floor(index / session.config.columns),
      column: index % session.config.columns,
    }
    if (onPrimary) onPrimary(index)
    else onCommand?.(primaryCommand(inputMode, coordinate))
  }
  const secondary = (index: number) =>
    onSecondary?.(index) ??
    onCommand?.(
      secondaryCommand(inputMode, {
        row: Math.floor(index / session.config.columns),
        column: index % session.config.columns,
      }),
    )
  const keyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) =>
    BoardKeyboardController(event, index, session, primary, secondary)
  const pointerDown = (event: PointerEvent<HTMLButtonElement>, index: number) => {
    if (event.pointerType !== 'touch') return
    pointer.current = createPointerSession(event.clientX, event.clientY, () => {
      suppressPrimary.current = true
      secondary(index)
    })
  }
  const pointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointer.current && shouldCancelForMovement(pointer.current, event.clientX, event.clientY))
      cancelPointerSession(pointer.current)
  }
  const pointerUp = () => {
    const session = pointer.current
    cancelPointerSession(session)
    pointer.current = null
  }
  useEffect(() => () => cancelPointerSession(pointer.current), [])
  const rows = Array.from({ length: session.config.rows }, (_, row) => (
    <div className="board-row" role="row" key={row}>
      {Array.from({ length: session.config.columns }, (_, column) => {
        const index = row * session.config.columns + column
        return (
          <BoardCell
            key={index}
            session={session}
            index={index}
            tabIndex={focused === index ? 0 : -1}
            onPrimary={primary}
            onSecondary={secondary}
            onKeyDown={keyDown}
            onFocus={setFocused}
            onPointerDown={pointerDown}
            onPointerUp={pointerUp}
            onPointerMove={pointerMove}
          />
        )
      })}
    </div>
  ))
  return (
    <BoardViewport
      rows={session.config.rows}
      columns={session.config.columns}
      ariaLabel={t('game.board')}
    >
      <div
        className="board-grid"
        role="grid"
        aria-label={t('game.board')}
        aria-rowcount={session.config.rows}
        aria-colcount={session.config.columns}
      >
        {rows}
      </div>
    </BoardViewport>
  )
}
