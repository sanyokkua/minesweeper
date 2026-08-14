import { PRESETS, canonicalConfigKey, neighborsOf, validateConfig } from '../../domain/config'
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

export function defaultRecord(locale: Locale = 'en'): PlayerRecordV1 {
  return {
    version: 1,
    preferences: {
      locale,
      appearance: 'system',
      inputMode: 'reveal-first',
      selectedConfig: PRESETS.beginner,
    },
    standardRecords: {},
    customRecords: {},
  }
}

function hasExactKeys(
  value: object,
  required: readonly string[],
  optional: readonly string[] = [],
) {
  const keys = Object.keys(value)
  return (
    required.every((key) => Object.prototype.hasOwnProperty.call(value, key)) &&
    keys.every((key) => required.includes(key) || optional.includes(key))
  )
}

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function validCell(value: unknown): value is Cell {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const cell = value as Cell
  return (
    hasExactKeys(cell, ['hasMine', 'neighborMines', 'revealed', 'flagged']) &&
    typeof cell.hasMine === 'boolean' &&
    Number.isInteger(cell.neighborMines) &&
    cell.neighborMines >= 0 &&
    cell.neighborMines <= 8 &&
    typeof cell.revealed === 'boolean' &&
    typeof cell.flagged === 'boolean'
  )
}

function validRecordEntry(value: unknown): value is BestRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return (
    hasExactKeys(value, ['bestSeconds', 'lastStartedAt']) &&
    Number.isInteger((value as BestRecord).bestSeconds) &&
    isFiniteNonNegative((value as BestRecord).bestSeconds) &&
    isFiniteNonNegative((value as BestRecord).lastStartedAt)
  )
}

function validSession(value: unknown): value is GameSession {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const session = value as GameSession
  if (
    !hasExactKeys(
      session,
      ['config', 'cells', 'seed', 'minesPlaced', 'status', 'elapsedMs'],
      ['detonatedIndex'],
    )
  )
    return false
  const config = validateConfig(session.config)
  if (
    !config.ok ||
    !Number.isInteger(session.seed) ||
    session.seed < 0 ||
    session.seed > 0xffffffff ||
    !isFiniteNonNegative(session.elapsedMs)
  )
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
  if (flags > config.value.mines || session.cells.some((cell) => cell.revealed && cell.flagged))
    return false
  if (
    session.status === 'ready' &&
    (session.minesPlaced ||
      session.elapsedMs !== 0 ||
      session.cells.some((cell) => cell.hasMine || cell.neighborMines !== 0 || cell.revealed))
  )
    return false
  if (
    session.status === 'playing' &&
    (!session.minesPlaced || Object.prototype.hasOwnProperty.call(session, 'detonatedIndex'))
  )
    return false
  if (Object.prototype.hasOwnProperty.call(session, 'detonatedIndex')) {
    if (!Number.isInteger(session.detonatedIndex) || (session.detonatedIndex ?? -1) < 0)
      return false
    return false
  }
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
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as PlayerRecordV1
  const preferences = record.preferences
  if (
    !hasExactKeys(
      record,
      ['version', 'preferences', 'standardRecords', 'customRecords'],
      ['resumableGame'],
    )
  )
    return false
  if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) return false
  if (!hasExactKeys(preferences, ['locale', 'appearance', 'inputMode', 'selectedConfig']))
    return false
  const standardValid =
    !!record.standardRecords &&
    typeof record.standardRecords === 'object' &&
    !Array.isArray(record.standardRecords) &&
    Object.keys(record.standardRecords).every((key) =>
      ['beginner', 'intermediate', 'expert'].includes(key),
    ) &&
    Object.values(record.standardRecords).every((entry) => validRecordEntry(entry))
  const customValid =
    !!record.customRecords &&
    typeof record.customRecords === 'object' &&
    !Array.isArray(record.customRecords) &&
    Object.keys(record.customRecords).length <= 100 &&
    Object.entries(record.customRecords).every(([key, entry]) => {
      const match = /^(\d+)x(\d+):(\d+)$/.exec(key)
      if (!match || !validRecordEntry(entry)) return false
      const config = {
        kind: 'custom' as const,
        rows: Number(match[1]),
        columns: Number(match[2]),
        mines: Number(match[3]),
      }
      return validateConfig(config).ok && canonicalConfigKey(config) === key
    })
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
