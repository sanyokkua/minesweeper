import type { Coordinate, GameConfig, PresetKind, ValidationResult } from './gameTypes'

export const PRESETS: Record<PresetKind, GameConfig> = {
    beginner: { kind: 'beginner', rows: 9, columns: 9, mines: 10 },
    intermediate: { kind: 'intermediate', rows: 16, columns: 16, mines: 40 },
    expert: { kind: 'expert', rows: 24, columns: 24, mines: 99 },
}

export function validateConfig(input: unknown): ValidationResult<GameConfig> {
    if (!input || typeof input !== 'object' || Array.isArray(input))
        return { ok: false, errors: ['Configuration is required.'] }
    const keys = Object.keys(input)
    if (keys.length !== 4 || !['kind', 'rows', 'columns', 'mines'].every((key) => keys.includes(key))) {
        return { ok: false, errors: ['Configuration contains unsupported fields.'] }
    }
    const candidate = input as Partial<GameConfig>
    if (!['beginner', 'intermediate', 'expert', 'custom'].includes(candidate.kind ?? '')) {
        return { ok: false, errors: ['Choose a valid difficulty.'] }
    }
    const rows = candidate.rows
    const columns = candidate.columns
    const mines = candidate.mines
    if (![rows, columns, mines].every((value) => Number.isInteger(value))) {
        return { ok: false, errors: ['Rows, columns, and mines must be whole numbers.'] }
    }
    if (candidate.kind !== 'custom') {
        const preset = PRESETS[candidate.kind as PresetKind]
        return preset.rows === rows && preset.columns === columns && preset.mines === mines
            ? { ok: true, value: preset }
            : { ok: false, errors: ['Preset dimensions are invalid.'] }
    }
    if ((rows as number) < 5 || (rows as number) > 30) {
        return { ok: false, errors: ['Rows must be between 5 and 30.'] }
    }
    if ((columns as number) < 5 || (columns as number) > 30) {
        return { ok: false, errors: ['Columns must be between 5 and 30.'] }
    }
    if ((mines as number) < 1 || (mines as number) >= (rows as number) * (columns as number)) {
        return { ok: false, errors: ['Mines must be less than the board area.'] }
    }
    return {
        ok: true,
        value: {
            kind: 'custom',
            rows: rows as number,
            columns: columns as number,
            mines: mines as number,
        },
    }
}

export function canonicalConfigKey(config: GameConfig): string {
    return `${config.rows}x${config.columns}:${config.mines}`
}

export function indexOf(config: GameConfig, coordinate: Coordinate): number | null {
    if (
        !Number.isInteger(coordinate.row) ||
        !Number.isInteger(coordinate.column) ||
        coordinate.row < 0 ||
        coordinate.column < 0 ||
        coordinate.row >= config.rows ||
        coordinate.column >= config.columns
    ) {
        return null
    }
    return coordinate.row * config.columns + coordinate.column
}

export function coordinateForIndex(config: GameConfig, index: number): Coordinate {
    return { row: Math.floor(index / config.columns), column: index % config.columns }
}

export function neighborsOf(config: GameConfig, index: number): number[] {
    const { row, column } = coordinateForIndex(config, index)
    const neighbors: number[] = []
    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
        for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
            if (rowOffset === 0 && columnOffset === 0) continue
            const neighbor = indexOf(config, { row: row + rowOffset, column: column + columnOffset })
            if (neighbor !== null) neighbors.push(neighbor)
        }
    }
    return neighbors
}

export function isGameConfig(input: unknown): input is GameConfig {
    return validateConfig(input).ok
}
