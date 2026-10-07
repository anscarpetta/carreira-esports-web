import { describe, expect, it } from 'vitest'
import { CATALOG } from '../data/catalog.ts'
import { createCareer, decide, retire, type NewCareerInput } from './career.ts'
import { SPLITS_PER_DECISION } from './modes.ts'
import { summarize } from './summary.ts'
import type { CareerState, DecisionOption } from './types.ts'

const INPUT: NewCareerInput = { seed: 'teste', mode: 'normal', nick: 'Tester', role: 'mid', nationality: 'BR' }

// Escolhe sempre a primeira opção: simples e determinístico.
function playToEnd(state: CareerState, pickOption = (s: CareerState) => s.decision!.options[0].id): CareerState {
  let current = state
  for (let guard = 0; guard < 300 && current.phase === 'career'; guard += 1) {
    current = decide(current, pickOption(current), CATALOG)
  }
  return current
}

function teamOf(option: DecisionOption): string | null {
  return 'teamId' in option ? option.teamId : null
}

describe('criação da carreira', () => {
  it('é determinística: a mesma semente gera a mesma carreira', () => {
    expect(createCareer(INPUT, CATALOG)).toEqual(createCareer(INPUT, CATALOG))
  })

  it('começa aos 16 anos, sem time, com 3 propostas diferentes do CBLOL', () => {
    const state = createCareer(INPUT, CATALOG)
    expect(state.next.year - state.player.birthYear).toBe(16)
    expect(state.teamId).toBeNull()
    const decision = state.decision!
    expect(decision.kind).toBe('initial_offer')
    const teams = decision.options.map(teamOf)
    expect(new Set(teams).size).toBe(3)
    for (const teamId of teams) expect(CATALOG.leagues.cblol.teamIds).toContain(teamId)
  })

  it('o OVR inicial fica abaixo do nível do CBLOL e o potencial é um teto plausível', () => {
    for (let i = 0; i < 50; i += 1) {
      const { player } = createCareer({ ...INPUT, seed: `p${i}` }, CATALOG)
      expect(player.ovr).toBeGreaterThanOrEqual(50)
      expect(player.ovr).toBeLessThan(68)
      expect(player.potential).toBeGreaterThanOrEqual(62)
      expect(player.potential).toBeLessThanOrEqual(91)
    }
  })
})

describe('decisões', () => {
  it('cada decisão simula o número de splits do modo', () => {
    for (const mode of ['intense', 'normal', 'express'] as const) {
      const state = createCareer({ ...INPUT, mode }, CATALOG)
      const after = decide(state, state.decision!.options[0].id, CATALOG)
      expect(after.history).toHaveLength(SPLITS_PER_DECISION[mode])
      expect(after.teamId).toBe(teamOf(state.decision!.options[0]))
    }
  })

  it('opção inválida gera erro', () => {
    const state = createCareer(INPUT, CATALOG)
    expect(() => decide(state, 'nao-existe', CATALOG)).toThrow()
  })

  it('o botão de aposentadoria encerra a carreira a qualquer momento', () => {
    const state = createCareer(INPUT, CATALOG)
    const after = decide(state, state.decision!.options[0].id, CATALOG)
    const retired = retire(after)
    expect(retired.phase).toBe('summary')
    expect(retired.retirement?.reason).toBe('voluntary')
    expect(retired.decision).toBeNull()
  })

  it('a pré-temporada sempre oferece a opção de ficar no time', () => {
    const state = createCareer(INPUT, CATALOG)
    const after = decide(state, state.decision!.options[0].id, CATALOG)
    if (after.decision?.kind === 'transfer_window') {
      expect(after.decision.options.some((o) => o.type === 'stay')).toBe(true)
    }
  })
})

describe('carreira completa', () => {
  const careers = Array.from({ length: 60 }, (_, i) =>
    playToEnd(createCareer({ ...INPUT, seed: `completa-${i}`, mode: i % 3 === 0 ? 'intense' : 'normal' }, CATALOG)),
  )

  it('toda carreira termina com aposentadoria', () => {
    for (const career of careers) {
      expect(career.phase).toBe('summary')
      expect(career.retirement).not.toBeNull()
    }
  })

  it('a carreira inteira é reproduzível', () => {
    const again = playToEnd(createCareer({ ...INPUT, seed: 'completa-0', mode: 'intense' }, CATALOG))
    expect(again).toEqual(careers[0])
  })

  it('os splits avançam em ordem e a idade nunca passa do limite', () => {
    for (const career of careers) {
      for (let i = 1; i < career.history.length; i += 1) {
        const prev = career.history[i - 1]
        const curr = career.history[i]
        expect(curr.year * 3 + curr.splitIndex).toBe(prev.year * 3 + prev.splitIndex + 1)
      }
      expect(career.retirement!.age).toBeLessThanOrEqual(35)
    }
  })

  it('OVR, valor de mercado e estatísticas ficam em faixas válidas', () => {
    for (const career of careers) {
      for (const record of career.history) {
        expect(record.ovrAfter).toBeGreaterThanOrEqual(40)
        expect(record.ovrAfter).toBeLessThanOrEqual(99)
        expect(record.marketValue).toBeGreaterThan(0)
        expect(record.stats.wins).toBeLessThanOrEqual(record.stats.games)
        if (record.squadRole === 'suspended' || record.squadRole === 'paused') expect(record.stats.games).toBe(0)
      }
    }
  })

  it('título só conta para quem foi titular ou entrou nos playoffs', () => {
    for (const career of careers) {
      for (const record of career.history) {
        if (record.titles.length > 0) {
          expect(record.placement).toBe(1)
          expect(record.stats.games).toBeGreaterThan(0)
        }
      }
    }
  })

  it('o CBLOL sempre tem 8 times, mesmo quando uma organização sai', () => {
    for (const career of careers) {
      const inLeague = Object.values(career.teams).filter((t) => t.leagueId === 'cblol')
      expect(inLeague).toHaveLength(8)
    }
  })

  it('o resumo soma as estatísticas de todos os splits', () => {
    for (const career of careers.slice(0, 10)) {
      const summary = summarize(career)
      const games = career.history.reduce((sum, r) => sum + r.stats.games, 0)
      expect(summary.totals.games).toBe(games)
      expect(summary.titles.length).toBe(career.history.reduce((sum, r) => sum + r.titles.length, 0))
    }
  })

  it('eventos de carreira aparecem ao longo das carreiras', () => {
    // Joga escolhendo sempre a última opção, para variar os caminhos.
    let events = 0
    for (let i = 0; i < 20; i += 1) {
      let state = createCareer({ ...INPUT, seed: `eventos-${i}`, mode: 'intense' }, CATALOG)
      for (let guard = 0; guard < 300 && state.phase === 'career'; guard += 1) {
        if (state.decision!.kind === 'event') events += 1
        const options = state.decision!.options
        state = decide(state, options[options.length - 1].id, CATALOG)
      }
    }
    expect(events).toBeGreaterThan(20)
  })
})
