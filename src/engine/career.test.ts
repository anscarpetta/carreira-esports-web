import { describe, expect, it } from 'vitest'
import { CATALOG } from '../data/catalog.ts'
import { createCareer, decide, isImportIn, residentRegions, retire, RESIDENCY_SPLITS, type NewCareerInput } from './career.ts'
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

  it('começa aos 16 anos, sem time, com 3 propostas fora do tier 1', () => {
    for (let i = 0; i < 30; i += 1) {
      const state = createCareer({ ...INPUT, seed: `inicio-${i}` }, CATALOG)
      expect(state.next.year - state.player.birthYear).toBe(16)
      expect(state.teamId).toBeNull()
      const decision = state.decision!
      expect(decision.kind).toBe('initial_offer')
      const teams = decision.options.map(teamOf)
      expect(new Set(teams).size).toBe(3)
      for (const teamId of teams) {
        const league = CATALOG.leagues[state.teams[teamId!].leagueId!]
        expect(league.tier).toBeGreaterThan(1)
      }
    }
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

  it('as ligas mantêm o tamanho, mesmo quando uma organização sai', () => {
    for (const career of careers) {
      for (const league of Object.values(CATALOG.leagues)) {
        const inLeague = Object.values(career.teams).filter((t) => t.leagueId === league.id)
        expect(inLeague).toHaveLength(league.teamIds.length)
      }
    }
  })

  it('ninguém joga o tier 1 antes dos 18 anos', () => {
    for (const career of careers) {
      for (const record of career.history) {
        // Pode estar no elenco (o time subiu de divisão), mas sem entrar em quadra.
        if (record.leagueId && CATALOG.leagues[record.leagueId].tier === 1 && record.age < 18) {
          expect(record.stats.games).toBe(0)
          expect(record.titles).toHaveLength(0)
        }
      }
    }
  })

  it('o resumo soma as estatísticas de todos os splits', () => {
    for (const career of careers.slice(0, 10)) {
      const summary = summarize(career)
      const games = career.history.reduce((sum, r) => sum + r.stats.games + (r.international?.stats.games ?? 0), 0)
      expect(summary.totals.games).toBe(games)
      const titles = career.history.reduce((sum, r) => sum + r.titles.length + (r.international?.titles.length ?? 0), 0)
      expect(summary.titles.length).toBe(titles)
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

  it('quem espera sem time não joga e pode voltar quando chega uma proposta', () => {
    let waited = 0
    let returned = 0
    for (let i = 0; i < 40; i += 1) {
      // Prefere esperar sempre que dá; senão, a primeira opção.
      const career = playToEnd(createCareer({ ...INPUT, seed: `pausa-${i}`, mode: 'intense' }, CATALOG), (s) => {
        const options = s.decision!.options
        const wait = options.find((o) => o.type === 'wait')
        const join = options.find((o) => o.type === 'join')
        if (s.paused && join && s.paused.splits >= 2) return join.id
        return (wait ?? options[0]).id
      })
      const paused = career.history.filter((r) => r.squadRole === 'paused' && r.teamId === null)
      for (const record of paused) expect(record.stats.games).toBe(0)
      if (paused.length > 0) waited += 1
      const idx = career.history.findIndex((r) => r.teamId === null && r.squadRole === 'paused')
      if (idx >= 0 && career.history.slice(idx).some((r) => r.teamId !== null)) returned += 1
    }
    expect(waited).toBeGreaterThan(5)
    expect(returned).toBeGreaterThan(0)
  })

})

describe('regiões', () => {
  const START: Record<string, string> = { BR: 'BR', KR: 'KR', CN: 'CN', FR: 'EU', US: 'NA', AR: 'LATAM', MX: 'LATAM', VN: 'PAC', JP: 'PAC', TW: 'PAC' }

  it('cada nacionalidade começa nos tiers de base da própria região', () => {
    for (const [nationality, region] of Object.entries(START)) {
      for (let i = 0; i < 10; i += 1) {
        const state = createCareer({ ...INPUT, nationality, seed: `regiao-${nationality}-${i}` }, CATALOG)
        for (const option of state.decision!.options) {
          const league = CATALOG.leagues[state.teams[teamOf(option)!].leagueId!]
          // Latino-americanos também podem começar no Brasil ou na América do Norte (dupla residência).
          const allowed = region === 'LATAM' ? ['LATAM', 'BR', 'NA'] : [region]
          expect(allowed).toContain(league.region)
          expect(league.tier).toBeGreaterThan(1)
        }
      }
    }
  })

  it('três anos numa região dão residência', () => {
    const state = createCareer(INPUT, CATALOG)
    expect(isImportIn(state, CATALOG, 'lcs')).toBe(true)
    const resident = { ...state, residency: { NA: RESIDENCY_SPLITS } }
    expect(residentRegions(resident, CATALOG)).toContain('NA')
    expect(isImportIn(resident, CATALOG, 'lcs')).toBe(false)
    expect(isImportIn(state, CATALOG, 'cblol')).toBe(false)
  })

  it('latino-americanos têm dupla residência (CBLOL e LCS) até 2027', () => {
    const state = createCareer({ ...INPUT, nationality: 'AR' }, CATALOG)
    expect(isImportIn(state, CATALOG, 'cblol')).toBe(false)
    expect(isImportIn(state, CATALOG, 'lcs')).toBe(false)
    expect(isImportIn(state, CATALOG, 'lck')).toBe(true)
    // Em 2028 a regra acaba: fica a região onde mais jogou.
    const later = { ...state, next: { year: 2028, index: 0 as const }, residency: { BR: 4, NA: 1 } }
    expect(isImportIn(later, CATALOG, 'cblol')).toBe(false)
    expect(isImportIn(later, CATALOG, 'lcs')).toBe(true)
  })

  it('chineses quase nunca jogam fora da China', () => {
    let abroad = 0
    for (let i = 0; i < 60; i += 1) {
      const career = playToEnd(createCareer({ ...INPUT, nationality: 'CN', seed: `china-${i}` }, CATALOG))
      if (career.history.some((r) => r.leagueId && CATALOG.leagues[r.leagueId].region !== 'CN')) abroad += 1
    }
    expect(abroad).toBeLessThanOrEqual(3)
  })

  it('internacionais só para quem se classificou e com campanha coerente', () => {
    const sample = ['BR', 'KR', 'FR'].flatMap((nationality) =>
      Array.from({ length: 15 }, (_, i) => playToEnd(createCareer({ ...INPUT, nationality, seed: `intl-${nationality}-${i}` }, CATALOG))),
    )
    let seen = 0
    for (const career of sample) {
      for (const record of career.history) {
        const intl = record.international
        if (!intl) continue
        expect(['first_stand', 'msi', 'worlds'][record.splitIndex]).toBe(intl.id)
        expect(CATALOG.leagues[record.leagueId!].tier).toBe(1)
        if (intl.titles.length > 0) expect(intl.placement).toBe(1)
        expect(intl.stats.wins).toBeLessThanOrEqual(intl.stats.games)
        seen += 1
      }
    }
    expect(seen).toBeGreaterThan(0)
  })
})
