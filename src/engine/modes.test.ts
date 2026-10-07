import { describe, expect, it } from 'vitest'
import { SPLITS_PER_DECISION, SPLITS_PER_YEAR } from './modes.ts'

describe('modos de simulação', () => {
  it('Intensa decide a cada split', () => {
    expect(SPLITS_PER_DECISION.intense).toBe(1)
  })

  it('Normal decide uma vez por ano', () => {
    expect(SPLITS_PER_DECISION.normal).toBe(SPLITS_PER_YEAR)
  })

  it('Expressa decide a cada 2 anos', () => {
    expect(SPLITS_PER_DECISION.express).toBe(SPLITS_PER_YEAR * 2)
  })
})
