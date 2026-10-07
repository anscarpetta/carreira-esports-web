// Teste de estresse: carreiras com escolhas aleatórias, em todas as nacionalidades e modos,
// conferindo que nada quebra e que as regras gerais sempre valem.

import { describe, expect, it } from 'vitest'
import { CATALOG } from '../data/catalog.ts'
import { achievedIds } from './achievements.ts'
import { createCareer, decide, retire } from './career.ts'
import { chance, createRng, int } from './rng.ts'
import { summarize } from './summary.ts'

const NATIONALITIES = Object.keys(CATALOG.countries)
const MODES = ['intense', 'normal', 'express'] as const
const ROLES = ['top', 'jungle', 'mid', 'adc', 'support'] as const

describe('estresse', () => {
  it('200 carreiras aleatórias terminam sem erro e respeitam as regras', () => {
    let rng = createRng('estresse')
    const sizes = Object.values(CATALOG.leagues).map((league) => [league.id, league.teamIds.length] as const)
    for (let i = 0; i < 200; i += 1) {
      const n = int(rng, 0, NATIONALITIES.length - 1)
      const m = int(n.rng, 0, MODES.length - 1)
      const r = int(m.rng, 0, ROLES.length - 1)
      rng = r.rng
      let state = createCareer(
        { seed: `estresse-${i}`, mode: MODES[m.value], nick: 'E', role: ROLES[r.value], nationality: NATIONALITIES[n.value] },
        CATALOG,
      )
      for (let guard = 0; guard < 400 && state.phase === 'career'; guard += 1) {
        const quit = chance(rng, 0.003)
        rng = quit.rng
        if (quit.value) {
          state = retire(state)
          break
        }
        const options = state.decision!.options
        // Toda decisão tem escolha de verdade: pelo menos 2 opções.
        expect(options.length, state.decision!.title).toBeGreaterThanOrEqual(2)
        const pickIndex = int(rng, 0, options.length - 1)
        rng = pickIndex.rng
        state = decide(state, options[pickIndex.value].id, CATALOG)
      }

      expect(state.phase).toBe('summary')
      for (const [leagueId, size] of sizes) {
        expect(Object.values(state.teams).filter((t) => t.leagueId === leagueId)).toHaveLength(size)
      }
      for (const team of Object.values(state.teams)) expect(Number.isFinite(team.rating)).toBe(true)
      for (const record of state.history) {
        expect(record.ovrAfter).toBeGreaterThanOrEqual(40)
        expect(record.ovrAfter).toBeLessThanOrEqual(99)
        if (record.leagueId && CATALOG.leagues[record.leagueId].tier === 1 && record.age < 18) {
          expect(record.stats.games).toBe(0)
        }
      }
      expect(() => summarize(state)).not.toThrow()
      expect(() => achievedIds(state, CATALOG)).not.toThrow()
      expect(JSON.parse(JSON.stringify(state))).toEqual(state)
    }
  }, 60_000)
})
