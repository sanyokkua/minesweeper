import { createSeededRandom, sampleUnique } from '../../../src/domain/prng'

describe('seeded random helpers', () => {
  it('is deterministic and samples unique candidates', () => {
    const first = createSeededRandom(123)
    const second = createSeededRandom(123)
    expect([first(), first(), first()]).toEqual([second(), second(), second()])
    const sample = sampleUnique([0, 1, 2, 3, 4], 3, createSeededRandom(7))
    expect(new Set(sample).size).toBe(3)
    expect(sample.every((item) => [0, 1, 2, 3, 4].includes(item))).toBe(true)
  })
})
