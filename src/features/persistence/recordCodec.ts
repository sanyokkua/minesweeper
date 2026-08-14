import { PRESETS, neighborsOf, validateConfig } from '../../domain/config'
import type { Cell, GameConfig, GameSession, GameStatus } from '../../domain/gameTypes'
import type { Locale } from '../../i18n/catalog'

export const STORAGE_KEY = 'minesweeper.local-state'
export const RECORD_VERSION = 1
export type Appearance = 'light' | 'dark' | 'system'
export type InputMode = 'reveal-first' | 'flag-first'
export type BestRecord = { bestSeconds: number; lastStartedAt: number }
export type PlayerRecordV1 = {
  version: 1
  preferences: {
    locale: Locale
    appearance: Appearance
    inputMode: InputMode
    selectedConfig: GameConfig
  }
  standardRecords: Partial<Record<'beginner' | 'intermediate' | 'expert', BestRecord>>
  customRecords: Record<string, BestRecord>
  resumableGame?: GameSession
}
export type DecodeResult =
  | { ok: true; value: PlayerRecordV1 }
  | { ok: false; value: PlayerRecordV1; reason: 'empty' | 'malformed' | 'future' | 'invalid' }

export function defaultRecord(): PlayerRecordV1 {
  return {
    version: 1,
    preferences: {
      locale: 'en',
      appearance: 'system',
      inputMode: 'reveal-first',
      selectedConfig: PRESETS.beginner,
    },
    standardRecords: {},
    customRecords: {},
  }
}

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function validCell(value: unknown): value is Cell {
  if (!value || typeof value !== 'object') return false
  const cell = value as Cell
  return (
    typeof cell.hasMine === 'boolean' &&
    Number.isInteger(cell.neighborMines) &&
    cell.neighborMines >= 0 &&
    cell.neighborMines <= 8 &&
    typeof cell.revealed === 'boolean' &&
    typeof cell.flagged === 'boolean'
  )
}

function validRecordEntry(value: unknown): value is BestRecord {
  return (
    !!value &&
    typeof value === 'object' &&
    isFiniteNonNegative((value as BestRecord).bestSeconds) &&
    isFiniteNonNegative((value as BestRecord).lastStartedAt)
  )
}

function validSession(value: unknown): value is GameSession {
  if (!value || typeof value !== 'object') return false
  const session = value as GameSession
  const config = validateConfig(session.config)
  if (!config.ok || !Number.isInteger(session.seed) || !isFiniteNonNegative(session.elapsedMs))
    return false
  if (!['ready', 'playing'].includes(session.status)) return false
  if (
    typeof session.minesPlaced !== 'boolean' ||
    !Array.isArray(session.cells) ||
    session.cells.length !== config.value.rows * config.value.columns ||
    !session.cells.every(validCell)
  )
    return false
  const flags = session.cells.filter((cell) => cell.flagged).length
  if (flags > config.value.mines) return false
  if (
    session.status === 'ready' &&
    (session.minesPlaced ||
      session.elapsedMs !== 0 ||
      session.cells.some((cell) => cell.hasMine || cell.neighborMines !== 0))
  )
    return false
  if (session.status === 'playing' && !session.minesPlaced) return false
  if (
    session.minesPlaced &&
    (session.cells.filter((cell) => cell.hasMine).length !== config.value.mines ||
      session.cells.some(
        (cell, index) =>
          cell.neighborMines !==
          neighborsOf(config.value, index).filter((neighbor) => session.cells[neighbor].hasMine)
            .length,
      ))
  )
    return false
  return true
}

function validRecord(value: unknown): value is PlayerRecordV1 {
  if (!value || typeof value !== 'object') return false
  const record = value as PlayerRecordV1
  const preferences = record.preferences
  const standardValid =
    !!record.standardRecords &&
    Object.values(record.standardRecords).every((entry) => validRecordEntry(entry))
  const customValid =
    !!record.customRecords &&
    Object.keys(record.customRecords).length <= 100 &&
    Object.entries(record.customRecords).every(
      ([key, entry]) => /^\d+x\d+:\d+$/.test(key) && validRecordEntry(entry),
    )
  return (
    record.version === 1 &&
    !!preferences &&
    ['en', 'uk'].includes(preferences.locale) &&
    ['light', 'dark', 'system'].includes(preferences.appearance) &&
    ['reveal-first', 'flag-first'].includes(preferences.inputMode) &&
    validateConfig(preferences.selectedConfig).ok &&
    standardValid &&
    customValid &&
    (!record.resumableGame || validSession(record.resumableGame))
  )
}

export function decodeStoredRecord(raw: string | null): DecodeResult {
  if (!raw) return { ok: false, value: defaultRecord(), reason: 'empty' }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && (parsed as { version?: unknown }).version !== 1) {
      return {
        ok: false,
        value: defaultRecord(),
        reason:
          (parsed as { version?: number }).version && (parsed as { version: number }).version > 1
            ? 'future'
            : 'invalid',
      }
    }
    return validRecord(parsed)
      ? { ok: true, value: parsed }
      : { ok: false, value: defaultRecord(), reason: 'invalid' }
  } catch {
    return { ok: false, value: defaultRecord(), reason: 'malformed' }
  }
}

export function encodeRecord(record: PlayerRecordV1): PlayerRecordV1 {
  return JSON.parse(JSON.stringify(record)) as PlayerRecordV1
}

export function statusCanResume(status: GameStatus): boolean {
  return status === 'ready' || status === 'playing'
}
