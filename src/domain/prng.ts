export type RandomSource = () => number

export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function sampleUnique<T>(items: readonly T[], count: number, random: RandomSource): T[] {
  const pool = [...items]
  const result: T[] = []
  const limit = Math.min(Math.max(count, 0), pool.length)
  for (let index = 0; index < limit; index += 1) {
    const selected = Math.floor(random() * pool.length)
    result.push(pool[selected])
    pool.splice(selected, 1)
  }
  return result
}
