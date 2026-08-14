import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react'
import { useAppSelector } from '../../app/hooks'
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

export function Board({ session, inputMode = 'reveal-first', onCommand, onPrimary, onSecondary }: Props) {
    const [focused, setFocused] = useState(0)
    const sessionKey = `${session.config.kind}:${session.config.rows}x${session.config.columns}:${session.config.mines}:${session.seed}`
    const [focusedSessionKey, setFocusedSessionKey] = useState(sessionKey)
    const pointer = useRef<PointerSession | null>(null)
    const suppressPrimary = useRef(false)
    const touchGestureCompleted = useRef(false)
    const blockingSheet = useAppSelector((state) => state.app.blockingSheet)
    const t = useTranslate()

    const primary = (index: number) => {
        if (suppressPrimary.current) {
            suppressPrimary.current = false
            touchGestureCompleted.current = false
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

    const contextMenu = (event: MouseEvent<HTMLButtonElement>, index: number) => {
        event.preventDefault()
        const nativeEvent = event.nativeEvent as MouseEvent<HTMLButtonElement>['nativeEvent'] & {
            pointerType?: string
        }
        const isTouch =
            nativeEvent.pointerType === 'touch' ||
            pointer.current !== null ||
            touchGestureCompleted.current ||
            (nativeEvent.pointerType === undefined && event.button === 0 && navigator.maxTouchPoints > 0)
        if (isTouch) {
            if (touchGestureCompleted.current) {
                suppressPrimary.current = true
                return
            }
            touchGestureCompleted.current = true
            const activePointer = pointer.current
            if (activePointer?.longPressCompleted) {
                suppressPrimary.current = true
                return
            }
            if (activePointer) {
                activePointer.longPressCompleted = true
                cancelPointerSession(activePointer)
            }
            suppressPrimary.current = true
        }
        secondary(index)
    }

    const scrollCellIntoView = (index: number) => {
        const cell = document.getElementById(`board-cell-${index}`)
        const viewport = cell?.closest('.board-viewport') as HTMLElement | null
        if (!cell || !viewport) return
        const cellRect = cell.getBoundingClientRect()
        const viewportRect = viewport.getBoundingClientRect()
        if (cellRect.top < viewportRect.top) viewport.scrollTop -= viewportRect.top - cellRect.top
        if (cellRect.bottom > viewportRect.bottom) viewport.scrollTop += cellRect.bottom - viewportRect.bottom
        if (cellRect.left < viewportRect.left) viewport.scrollLeft -= viewportRect.left - cellRect.left
        if (cellRect.right > viewportRect.right) viewport.scrollLeft += cellRect.right - viewportRect.right
    }

    const keyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        const next = BoardKeyboardController(event, index, session, primary, secondary)
        if (next !== null) scrollCellIntoView(next)
    }

    const pointerDown = (event: PointerEvent<HTMLButtonElement>, index: number) => {
        suppressPrimary.current = false
        touchGestureCompleted.current = false
        if (event.pointerType !== 'touch') return
        event.currentTarget.setPointerCapture?.(event.pointerId)
        pointer.current = createPointerSession(event.clientX, event.clientY, () => {
            suppressPrimary.current = true
            touchGestureCompleted.current = true
            secondary(index)
        })
    }

    const pointerMove = (event: PointerEvent<HTMLButtonElement>) => {
        if (pointer.current && shouldCancelForMovement(pointer.current, event.clientX, event.clientY)) {
            cancelPointerSession(pointer.current)
            pointer.current = null
            event.currentTarget.releasePointerCapture?.(event.pointerId)
        }
    }

    const pointerUp = (event: PointerEvent<HTMLButtonElement>) => {
        cancelPointerSession(pointer.current)
        pointer.current = null
        event.currentTarget.releasePointerCapture?.(event.pointerId)
    }

    useEffect(() => {
        cancelPointerSession(pointer.current)
        pointer.current = null
        return () => {
            cancelPointerSession(pointer.current)
            pointer.current = null
        }
    }, [blockingSheet, session.config.columns, session.config.rows])

    useEffect(() => {
        document.getElementById('board-cell-0')?.focus()
    }, [sessionKey])

    const rows = Array.from({ length: session.config.rows }, (_, row) => (
        <div className="board-row" role="row" key={row}>
            {Array.from({ length: session.config.columns }, (_, column) => {
                const index = row * session.config.columns + column
                return (
                    <BoardCell
                        key={index}
                        session={session}
                        index={index}
                        tabIndex={(focusedSessionKey === sessionKey ? focused : 0) === index ? 0 : -1}
                        onPrimary={primary}
                        onKeyDown={keyDown}
                        onFocus={(index) => {
                            setFocusedSessionKey(sessionKey)
                            setFocused(index)
                        }}
                        onPointerDown={pointerDown}
                        onPointerUp={pointerUp}
                        onPointerMove={pointerMove}
                        onPointerCancel={pointerUp}
                        onContextMenu={contextMenu}
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
            onScroll={() => {
                cancelPointerSession(pointer.current)
                pointer.current = null
            }}
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
