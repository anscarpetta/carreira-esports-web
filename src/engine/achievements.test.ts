import { describe, expect, it } from 'vitest'
import { CATALOG } from '../data/catalog.ts'
import { ACHIEVEMENTS, achievedIds } from './achievements.ts'
import { createCareer, decide } from './career.ts'
import { EMPTY_STATS } from './stats.ts'
import type { CareerState, SplitRecord, Title } from './types.ts'

function base(nationality = 'BR'): CareerState {
  return createCareer({ seed: 'conquistas', mode: 'normal', nick: 'X', role: 'mid', nationality }, CATALOG)
}

function record(partial: Partial<SplitRecord>): SplitRecord {
  return {
    year: 2030,
    splitIndex: 0,
    splitName: 'CBLOL Cup',
    leagueId: 'cblol',
    teamId: 'loud',
    age: 20,
    ovr: 80,
    ovrAfter: 80,
    squadRole: 'starter',
    stats: EMPTY_STATS,
    placement: 1,
    titles: [],
    awards: [],
    marketValue: 1_000_000,
    international: null,
    ...partial,
  }
}

const title = (partial: Partial<Title>): Title => ({
  kind: 'league',
  leagueId: 'cblol',
  name: 'CBLOL Cup',
  year: 2030,
  splitIndex: 0,
  teamId: 'loud',
  ...partial,
})

describe('conquistas', () => {
  it('os ids são únicos', () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length)
  })

  it('"O impossível": time do CBLOL campeão do Worlds', () => {
    const worlds = title({ kind: 'worlds', leagueId: 'worlds', name: 'Worlds', splitIndex: 2 })
    const state = {
      ...base(),
      history: [
        record({
          splitIndex: 2,
          international: {
            id: 'worlds',
            name: 'Worlds',
            placement: 1,
            stage: 'Campeão',
            stats: EMPTY_STATS,
            titles: [worlds],
            awards: [],
          },
        }),
      ],
    }
    const ids = achievedIds(state, CATALOG)
    expect(ids).toContain('impossible')
    expect(ids).toContain('world_champion')
  })

  it('"Rota do Ceos" só para brasileiros no tier 1 de outra região', () => {
    const abroad = [record({ leagueId: 'lcs', teamId: 'sr' })]
    expect(achievedIds({ ...base('BR'), history: abroad }, CATALOG)).toContain('ceos_route')
    expect(achievedIds({ ...base('US'), history: abroad }, CATALOG)).not.toContain('ceos_route')
  })

  it('"Ringless": 3 anos de titular no tier 1 sem títulos', () => {
    const history = Array.from({ length: 9 }, (_, i) =>
      record({ year: 2030 + Math.floor(i / 3), splitIndex: (i % 3) as 0 | 1 | 2, placement: 5 }),
    )
    expect(achievedIds({ ...base(), history }, CATALOG)).toContain('ringless')
    const withTitle = history.map((r, i) => (i === 0 ? { ...r, titles: [title({})] } : r))
    expect(achievedIds({ ...base(), history: withTitle }, CATALOG)).not.toContain('ringless')
  })

  it('carreiras simuladas desbloqueiam conquistas sem erro', () => {
    const unlocked = new Set<string>()
    for (let i = 0; i < 40; i += 1) {
      let state = createCareer({ seed: `c${i}`, mode: 'normal', nick: 'X', role: 'mid', nationality: i % 2 ? 'KR' : 'BR' }, CATALOG)
      for (let guard = 0; guard < 300 && state.phase === 'career'; guard += 1) {
        state = decide(state, state.decision!.options[0].id, CATALOG)
      }
      for (const id of achievedIds(state, CATALOG)) unlocked.add(id)
    }
    expect(unlocked.size).toBeGreaterThan(2)
  })
})
