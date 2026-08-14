import { coordinateForIndex, indexOf, neighborsOf, validateConfig } from './config'
import { createSeededRandom, sampleUnique } from './prng'
import type { Cell, CellPresentation, Coordinate, GameCommand, GameSession } from './gameTypes'

function blankCells(config: GameSession['config']): Cell[] {
  return Array.from({ length: config.rows * config.columns }, () => ({
    hasMine: false,
    neighborMines: 0,
    revealed: false,
    flagged: false,
  }))
}

export function createGame(config: GameSession['config'], seed: number): GameSession {
  const validated = validateConfig(config)
  if (!validated.ok) throw new Error(validated.errors.join(' '))
  return {
    config: validated.value,
    cells: blankCells(validated.value),
    seed: seed >>> 0,
    minesPlaced: false,
    status: 'ready',
    elapsedMs: 0,
  }
}

function clone(session: GameSession): Cell[] {
  return session.cells.map((cell) => ({ ...cell }))
}

function placeMines(session: GameSession, safeIndex: number): GameSession {
  const cells = clone(session)
  const candidates = cells.map((_, index) => index).filter((index) => index !== safeIndex)
  for (const index of sampleUnique(
    candidates,
    session.config.mines,
    createSeededRandom(session.seed),
  )) {
    cells[index].hasMine = true
  }
  for (let index = 0; index < cells.length; index += 1) {
    cells[index].neighborMines = neighborsOf(session.config, index).filter(
      (neighbor) => cells[neighbor].hasMine,
    ).length
  }
  return { ...session, cells, minesPlaced: true, status: 'playing' }
}

function reveal(session: GameSession, target: number): GameSession {
  let working = session.minesPlaced ? session : placeMines(session, target)
  const cells = clone(working)
  if (cells[target].hasMine) {
    return {
      ...working,
      cells: cells.map((cell) => (cell.hasMine ? { ...cell, revealed: true } : cell)),
      status: 'lost',
      detonatedIndex: target,
    }
  }

  const queue = [target]
  const visited = new Set<number>()
  while (queue.length > 0) {
    const index = queue.shift()
    if (index === undefined || visited.has(index)) continue
    visited.add(index)
    const cell = cells[index]
    if (cell.revealed || cell.flagged || cell.hasMine) continue
    cell.revealed = true
    if (cell.neighborMines === 0) {
      queue.push(...neighborsOf(working.config, index))
    }
  }

  const safeCells = cells.filter((cell) => !cell.hasMine)
  const revealedSafe = safeCells.filter((cell) => cell.revealed).length
  if (revealedSafe === safeCells.length) {
    return {
      ...working,
      cells: cells.map((cell) => (cell.hasMine ? { ...cell, flagged: true } : cell)),
      status: 'won',
    }
  }
  working = { ...working, cells, status: 'playing' }
  return working
}

function toggleFlag(session: GameSession, target: number): GameSession {
  const cells = clone(session)
  const cell = cells[target]
  if (cell.revealed) return session
  const flags = cells.filter((item) => item.flagged).length
  if (!cell.flagged && flags >= session.config.mines) return session
  cell.flagged = !cell.flagged
  return { ...session, cells }
}

export function applyCommand(session: GameSession, command: GameCommand): GameSession {
  if (session.status === 'won' || session.status === 'lost') return session
  const target = indexOf(session.config, command.coordinate)
  if (target === null) return session
  if (command.type === 'toggleFlag') return toggleFlag(session, target)
  if (session.cells[target].revealed) return session
  if (session.cells[target].flagged) {
    const cells = clone(session)
    cells[target].flagged = false
    return { ...session, cells }
  }
  return reveal(session, target)
}

export function cellPresentation(session: GameSession, index: number): CellPresentation {
  const cell = session.cells[index]
  if (!cell) return { kind: 'hidden' }
  if (session.status === 'lost' && cell.flagged && !cell.hasMine) return { kind: 'incorrect-flag' }
  if (session.status === 'lost' && cell.hasMine) {
    return index === session.detonatedIndex ? { kind: 'detonated-mine' } : { kind: 'mine' }
  }
  if (cell.flagged) return { kind: 'flagged' }
  if (!cell.revealed) return { kind: 'hidden' }
  return cell.neighborMines === 0
    ? { kind: 'open-zero' }
    : { kind: 'open-number', number: cell.neighborMines }
}

export function flagsUsed(session: GameSession): number {
  return session.cells.filter((cell) => cell.flagged).length
}

export function flagsRemaining(session: GameSession): number {
  return session.config.mines - flagsUsed(session)
}

export function cellCoordinate(session: GameSession, index: number): Coordinate {
  return coordinateForIndex(session.config, index)
}
