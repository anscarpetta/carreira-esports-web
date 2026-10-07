import { describe, expect, it } from 'vitest'
import type { CareerState, SplitRecord } from '../engine/types.ts'
import { partyFor } from './celebrate.ts'

// Só o que partyFor lê de cada split.
function record(titles: number, intl: string[] = []): SplitRecord {
  return {
    titles: Array.from({ length: titles }, () => ({ kind: 'league' })),
    international: intl.length ? { titles: intl.map((kind) => ({ kind })) } : null,
  } as unknown as SplitRecord
}
const career = (history: SplitRecord[]) => ({ history }) as unknown as CareerState

describe('partyFor', () => {
  it('festeja a maior conquista entre os splits novos', () => {
    const prev = career([record(1)])
    expect(partyFor(prev, career([record(1), record(0)]))).toBeNull()
    expect(partyFor(prev, career([record(1), record(1)]))).toBe('league')
    expect(partyFor(prev, career([record(1), record(1, ['msi'])]))).toBe('international')
    expect(partyFor(prev, career([record(1), record(0, ['msi']), record(1, ['worlds'])]))).toBe('worlds')
  })
})
