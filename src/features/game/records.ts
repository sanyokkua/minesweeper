import { canonicalConfigKey } from '../../domain/config'
import type { GameConfig } from '../../domain/gameTypes'
import type { BestRecord } from '../persistence/recordCodec'

export type RecordsState = {
    standardRecords: Partial<Record<'beginner' | 'intermediate' | 'expert', BestRecord>>
    customRecords: Record<string, BestRecord>
}

export function updateRecords(
    records: RecordsState,
    config: GameConfig,
    elapsedMs: number,
    startedAt: number,
): RecordsState {
    const seconds = Math.ceil(Math.max(0, elapsedMs) / 1000)
    const record: BestRecord = { bestSeconds: seconds, lastStartedAt: startedAt }
    if (config.kind !== 'custom') {
        const previous = records.standardRecords[config.kind]
        return !previous || seconds < previous.bestSeconds
            ? { ...records, standardRecords: { ...records.standardRecords, [config.kind]: record } }
            : records
    }
    const key = canonicalConfigKey(config)
    const previous = records.customRecords[key]
    const customRecords = {
        ...records.customRecords,
        [key]: previous && previous.bestSeconds <= seconds ? { ...previous, lastStartedAt: startedAt } : record,
    }
    const entries = Object.entries(customRecords).sort(
        (left, right) => left[1].lastStartedAt - right[1].lastStartedAt || left[0].localeCompare(right[0]),
    )
    while (entries.length > 100) delete customRecords[entries.shift()?.[0] ?? '']
    return { ...records, customRecords }
}

export function secondsFor(elapsedMs: number): number {
    return Math.ceil(Math.max(0, elapsedMs) / 1000)
}
