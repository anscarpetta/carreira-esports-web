import { describe, expect, it } from 'vitest'
import { chance, createRng, float, int, next, pick, pickWeighted, type Rng } from './rng.ts'

function sequence(rng: Rng, length: number): number[] {
  const values: number[] = []
  let current = rng
  for (let i = 0; i < length; i += 1) {
    const roll = next(current)
    values.push(roll.value)
    current = roll.rng
  }
  return values
}

describe('rng', () => {
  it('produz a mesma sequência para a mesma semente', () => {
    expect(sequence(createRng('faker'), 20)).toEqual(sequence(createRng('faker'), 20))
  })

  it('produz sequências diferentes para sementes diferentes', () => {
    expect(sequence(createRng('faker'), 20)).not.toEqual(sequence(createRng('brtt'), 20))
  })

  it('não altera o rng original', () => {
    const rng = createRng('imutavel')
    const before = { ...rng }
    next(rng)
    expect(rng).toEqual(before)
  })

  it('sorteia valores no intervalo [0, 1)', () => {
    for (const value of sequence(createRng('intervalo'), 10_000)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('float respeita o intervalo [min, max)', () => {
    let rng = createRng('float')
    for (let i = 0; i < 1_000; i += 1) {
      const roll = float(rng, 5, 10)
      expect(roll.value).toBeGreaterThanOrEqual(5)
      expect(roll.value).toBeLessThan(10)
      rng = roll.rng
    }
  })

  it('int inclui os dois extremos e nada fora deles', () => {
    let rng = createRng('int')
    const seen = new Set<number>()
    for (let i = 0; i < 1_000; i += 1) {
      const roll = int(rng, 1, 6)
      seen.add(roll.value)
      rng = roll.rng
    }
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('chance 0 nunca acontece e chance 1 sempre acontece', () => {
    let rng = createRng('chance')
    for (let i = 0; i < 1_000; i += 1) {
      const never = chance(rng, 0)
      const always = chance(never.rng, 1)
      expect(never.value).toBe(false)
      expect(always.value).toBe(true)
      rng = always.rng
    }
  })

  it('chance segue a probabilidade informada', () => {
    let rng = createRng('probabilidade')
    let hits = 0
    for (let i = 0; i < 10_000; i += 1) {
      const roll = chance(rng, 0.3)
      if (roll.value) hits += 1
      rng = roll.rng
    }
    expect(hits / 10_000).toBeCloseTo(0.3, 1)
  })

  it('pick falha numa lista vazia', () => {
    expect(() => pick(createRng('vazio'), [])).toThrow()
  })

  it('pickWeighted respeita os pesos e ignora peso zero', () => {
    let rng = createRng('pesos')
    const counts = { top: 0, mid: 0, nunca: 0 }
    const options = [
      { item: 'top' as const, weight: 3 },
      { item: 'mid' as const, weight: 1 },
      { item: 'nunca' as const, weight: 0 },
    ]
    for (let i = 0; i < 10_000; i += 1) {
      const roll = pickWeighted(rng, options)
      counts[roll.value] += 1
      rng = roll.rng
    }
    expect(counts.nunca).toBe(0)
    expect(counts.top / 10_000).toBeCloseTo(0.75, 1)
  })

  it('pickWeighted falha sem nenhum peso positivo', () => {
    expect(() => pickWeighted(createRng('zero'), [{ item: 'x', weight: 0 }])).toThrow()
  })
})
