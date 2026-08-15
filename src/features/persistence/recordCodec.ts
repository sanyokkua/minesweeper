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
    | {
          ok: false
          value: PlayerRecordV1
          reason: 'empty' | 'malformed' | 'future' | 'invalid'
          recovered?: boolean
      }

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

function hasExactKeys(value: object, required: readonly string[], optional: readonly string[] = []) {
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
    if (!hasExactKeys(session, ['config', 'cells', 'seed', 'minesPlaced', 'status', 'elapsedMs'], ['detonatedIndex']))
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
    if (flags > config.value.mines || session.cells.some((cell) => cell.revealed && cell.flagged)) return false
    if (
        session.status === 'ready' &&
        (session.minesPlaced ||
            session.elapsedMs !== 0 ||
            session.cells.some((cell) => cell.hasMine || cell.neighborMines !== 0 || cell.revealed))
    )
        return false
    if (
        session.status === 'playing' &&
        (!session.minesPlaced ||
            Object.prototype.hasOwnProperty.call(session, 'detonatedIndex') ||
            session.cells.some((cell) => cell.hasMine && cell.revealed) ||
            session.cells.every((cell) => cell.hasMine || cell.revealed))
    )
        return false
    if (Object.prototype.hasOwnProperty.call(session, 'detonatedIndex')) {
        if (!Number.isInteger(session.detonatedIndex) || (session.detonatedIndex ?? -1) < 0) return false
        return false
    }
    if (
        session.minesPlaced &&
        (session.cells.filter((cell) => cell.hasMine).length !== config.value.mines ||
            session.cells.some(
                (cell, index) =>
                    cell.neighborMines !==
                    neighborsOf(config.value, index).filter((neighbor) => session.cells[neighbor].hasMine).length,
            ))
    )
        return false
    return true
}

function validRecordCore(value: unknown): value is Omit<PlayerRecordV1, 'resumableGame'> & { resumableGame?: unknown } {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false
    const record = value as PlayerRecordV1
    const preferences = record.preferences
    if (!hasExactKeys(record, ['version', 'preferences', 'standardRecords', 'customRecords'], ['resumableGame']))
        return false
    if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) return false
    if (!hasExactKeys(preferences, ['locale', 'appearance', 'inputMode', 'selectedConfig'])) return false
    const standardValid =
        !!record.standardRecords &&
        typeof record.standardRecords === 'object' &&
        !Array.isArray(record.standardRecords) &&
        Object.keys(record.standardRecords).every((key) => ['beginner', 'intermediate', 'expert'].includes(key)) &&
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
        customValid
    )
}

function validRecord(value: unknown): value is PlayerRecordV1 {
    return validRecordCore(value) && (!value.resumableGame || validSession(value.resumableGame))
}

function recoverRecordWithoutResume(value: unknown): PlayerRecordV1 | null {
    if (!validRecordCore(value)) return null
    const record = value as PlayerRecordV1
    if (!Object.prototype.hasOwnProperty.call(record, 'resumableGame') || validSession(record.resumableGame))
        return null
    return {
        version: 1,
        preferences: record.preferences,
        standardRecords: record.standardRecords,
        customRecords: record.customRecords,
    }
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
        if (validRecord(parsed)) return { ok: true, value: parsed }
        const recovered = recoverRecordWithoutResume(parsed)
        return recovered
            ? { ok: false, value: recovered, reason: 'invalid', recovered: true }
            : { ok: false, value: defaultRecord(), reason: 'invalid' }
    } catch {
        return { ok: false, value: defaultRecord(), reason: 'malformed' }
    }
}

function encodeConfig(config: unknown): GameConfig | null {
    if (!config || typeof config !== 'object' || Array.isArray(config)) return null
    const value = config as Partial<GameConfig>
    const result = validateConfig({ kind: value.kind, rows: value.rows, columns: value.columns, mines: value.mines })
    return result.ok ? result.value : null
}

function encodeSession(session: unknown): GameSession | undefined {
    if (!session || typeof session !== 'object' || Array.isArray(session)) return undefined
    const candidate = session as Partial<GameSession>
    const config = encodeConfig(candidate.config)
    if (!config || !Array.isArray(candidate.cells)) return undefined
    const sanitized: GameSession = {
        config,
        cells: candidate.cells.map((cell) => {
            const value = cell as Partial<Cell>
            return {
                hasMine: value.hasMine === true,
                neighborMines: typeof value.neighborMines === 'number' ? value.neighborMines : -1,
                revealed: value.revealed === true,
                flagged: value.flagged === true,
            }
        }),
        seed: candidate.seed ?? -1,
        minesPlaced: candidate.minesPlaced === true,
        status: candidate.status ?? 'ready',
        elapsedMs: candidate.elapsedMs ?? -1,
    }
    if (typeof candidate.detonatedIndex === 'number') sanitized.detonatedIndex = candidate.detonatedIndex
    return validSession(sanitized) ? sanitized : undefined
}

export function encodeRecord(record: PlayerRecordV1): PlayerRecordV1 {
    const fallback = defaultRecord()
    const preferences = record.preferences ?? fallback.preferences
    const selectedConfig = encodeConfig(preferences.selectedConfig) ?? fallback.preferences.selectedConfig
    const standardRecords: PlayerRecordV1['standardRecords'] = {}
    for (const kind of ['beginner', 'intermediate', 'expert'] as const) {
        const entry = record.standardRecords?.[kind]
        if (entry && validRecordEntry(entry)) standardRecords[kind] = { ...entry }
    }
    const customRecords: PlayerRecordV1['customRecords'] = {}
    for (const [key, entry] of Object.entries(record.customRecords ?? {})) {
        const match = /^(\d+)x(\d+):(\d+)$/.exec(key)
        if (!match || !validRecordEntry(entry)) continue
        const config = {
            kind: 'custom' as const,
            rows: Number(match[1]),
            columns: Number(match[2]),
            mines: Number(match[3]),
        }
        if (validateConfig(config).ok && canonicalConfigKey(config) === key) customRecords[key] = { ...entry }
    }
    const encoded: PlayerRecordV1 = {
        version: 1,
        preferences: {
            locale: preferences.locale === 'uk' ? 'uk' : 'en',
            appearance: ['light', 'dark', 'system'].includes(preferences.appearance)
                ? preferences.appearance
                : 'system',
            inputMode: ['reveal-first', 'flag-first'].includes(preferences.inputMode)
                ? preferences.inputMode
                : 'reveal-first',
            selectedConfig,
        },
        standardRecords,
        customRecords,
    }
    const resumableGame = encodeSession(record.resumableGame)
    if (resumableGame) encoded.resumableGame = resumableGame
    return encoded
}

export function statusCanResume(status: GameStatus): boolean {
    return status === 'ready' || status === 'playing'
}
