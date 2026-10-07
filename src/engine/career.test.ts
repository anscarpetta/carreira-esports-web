import { describe, expect, it } from 'vitest'
import { CATALOG } from '../data/catalog.ts'
import {
  createCareer,
  decide,
  isImportIn,
  residentRegions,
  retire,
  RESIDENCY_SPLITS,
  SECRET_BOOST,
  secretBoost,
  type NewCareerInput,
} from './career.ts'
import { EVENTS_BY_KEY, SECRET_EVENT_KEY, struggling, type EventContext } from './events.ts'
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
      // O teto inicial é mais baixo: são os ganhos dos eventos que o empurram para cima.
      expect(player.potential).toBeGreaterThanOrEqual(55)
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

describe('janelas com 3 cards', () => {
  it('toda janela tem 3 opções, nas combinações combinadas', async () => {
    const { VETERAN_AGE } = await import('./career.ts')
    const { chance, createRng, int } = await import('./rng.ts')
    const seen: Record<string, number> = {}
    let rng = createRng('cards')
    for (let i = 0; i < 80; i += 1) {
      const nationality = ['BR', 'KR', 'FR', 'AR', 'VN'][i % 5]
      let state = createCareer({ ...INPUT, nationality, mode: i % 2 ? 'intense' : 'normal', seed: `cards-${i}` }, CATALOG)
      for (let guard = 0; guard < 300 && state.phase === 'career'; guard += 1) {
        const decision = state.decision!
        const types = decision.options.map((o) => o.type)
        const joins = types.filter((t) => t === 'join').length
        const age = state.next.year - state.player.birthYear
        if (decision.kind === 'transfer_window') {
          expect(types).toHaveLength(3)
          expect(joins).toBe(2)
          expect(types).toContain('stay')
          seen.window = (seen.window ?? 0) + 1
        } else if (decision.kind === 'released') {
          expect(types).toHaveLength(3)
          if (age >= VETERAN_AGE) {
            expect(joins).toBe(2)
            expect(types).toContain('retire')
            seen.veteran = (seen.veteran ?? 0) + 1
          } else {
            expect(joins).toBe(3)
            seen.released = (seen.released ?? 0) + 1
          }
        } else if (decision.kind === 'paused') {
          expect(types).toHaveLength(3)
          expect(types).toContain('wait')
          seen.paused = (seen.paused ?? 0) + 1
        } else if (decision.kind === 'org_left') {
          expect(joins).toBe(3)
        }
        // Escolhas aleatórias, com chance de se aposentar quando o card aparece.
        const pickIndex = int(rng, 0, decision.options.length - 1)
        rng = pickIndex.rng
        const quit = chance(rng, 0.5)
        rng = quit.rng
        const retireCard = decision.options.find((o) => o.type === 'retire')
        const option = retireCard && quit.value ? retireCard : decision.options[pickIndex.value]
        state = decide(state, option.id, CATALOG)
      }
    }
    expect(seen.window).toBeGreaterThan(100)
    expect(seen.released).toBeGreaterThan(0)
    expect(seen.veteran).toBeGreaterThan(0)
  })
})

describe('tier 1 só com titulares', () => {
  async function randomCareers(count: number, seedPrefix: string, onDecision?: (s: CareerState, next: CareerState) => void) {
    const { createRng, int } = await import('./rng.ts')
    let rng = createRng(seedPrefix)
    const careers: CareerState[] = []
    for (let i = 0; i < count; i += 1) {
      const nationality = ['BR', 'KR', 'FR', 'US'][i % 4]
      let state = createCareer({ ...INPUT, nationality, mode: i % 2 ? 'intense' : 'normal', seed: `${seedPrefix}-${i}` }, CATALOG)
      for (let guard = 0; guard < 300 && state.phase === 'career'; guard += 1) {
        const roll = int(rng, 0, state.decision!.options.length - 1)
        rng = roll.rng
        const next = decide(state, state.decision!.options[roll.value].id, CATALOG)
        onDecision?.(state, next)
        state = next
      }
      careers.push(state)
    }
    return careers
  }

  it('no tier 1 ninguém joga como reserva: ou é titular, ou está fora (no academy, o registro é do academy)', async () => {
    const careers = await randomCareers(60, 'titular')
    for (const career of careers) {
      for (const record of career.history) {
        if (!record.leagueId || CATALOG.leagues[record.leagueId].tier !== 1) continue
        expect(record.squadRole).not.toBe('reserve')
        if (record.squadRole === 'bench') expect(record.stats.games).toBe(0)
      }
    }
  })

  it('propostas de times de tier 1 são sempre para titular', async () => {
    let seen = 0
    await randomCareers(60, 'propostas', (state) => {
      for (const option of state.decision!.options) {
        if (!('teamId' in option) || option.type === 'stay') continue
        const leagueId = state.teams[option.teamId]?.leagueId
        if (leagueId && CATALOG.leagues[leagueId].tier === 1) {
          expect(option.expectedRole).toBe('starter')
          seen += 1
        }
      }
    })
    expect(seen).toBeGreaterThan(50)
  })

  it('evento na pré-temporada é seguido pela janela, sem simular splits no meio', async () => {
    let chained = 0
    await randomCareers(60, 'cadeia', (state, next) => {
      const decision = state.decision!
      if (decision.kind !== 'event' || decision.window !== '3-1' || next.phase !== 'career') return
      if (next.teamId !== state.teamId || state.paused) return
      const chose = next.history.length === state.history.length
      if (chose) {
        expect(['transfer_window', 'released', 'demoted', 'org_left']).toContain(next.decision!.kind)
        chained += 1
      }
    })
    expect(chained).toBeGreaterThan(5)
  })

  it('quem perde a vaga no tier 1 pode descer para o academy do próprio time', async () => {
    let demoted = 0
    await randomCareers(80, 'rebaixado', (state) => {
      const decision = state.decision!
      if (decision.kind !== 'demoted') return
      demoted += 1
      expect(decision.options).toHaveLength(3)
      const academy = decision.options[0]
      expect('teamId' in academy && CATALOG.teams[academy.teamId].parentId).toBe(state.teamId)
    })
    expect(demoted).toBeGreaterThan(0)
  })
})

describe('titular estabelecido', () => {
  it('reforço do time não derruba quem foi titular no split anterior', async () => {
    const { roleAt } = await import('./career.ts')
    const base = createCareer(INPUT, CATALOG)
    const team = { ...base.teams.loud, rating: 82 }
    const state: CareerState = {
      ...base,
      teamId: 'loud',
      teams: { ...base.teams, loud: team },
      player: { ...base.player, ovr: 78 },
    }
    // Recém-chegado: 4 abaixo da força do time não é titular.
    expect(roleAt(state, 'loud')).not.toBe('starter')
    // Titular no split anterior: segue titular (só cai se ficar mais de 5 abaixo).
    const last = { ...state, history: [{ ...({} as CareerState['history'][number]), teamId: 'loud', squadRole: 'starter' as const }] }
    expect(roleAt(last, 'loud')).toBe('starter')
    expect(roleAt({ ...last, player: { ...last.player, ovr: 76 } }, 'loud')).not.toBe('starter')
  })
})

describe('viradas', () => {
  it('o código secreto sobe OVR e teto uma vez só e marca a carreira', () => {
    const start = createCareer(INPUT, CATALOG)
    const boosted = secretBoost(start)
    expect(boosted.player.ovr).toBe(start.player.ovr + SECRET_BOOST)
    expect(boosted.player.potential).toBe(start.player.potential + SECRET_BOOST)
    expect(boosted.secretBoost).toBe(true)
    expect(secretBoost(boosted)).toBe(boosted)
    expect(secretBoost(retire(start)).secretBoost).toBeUndefined()
  })

  it('o evento secreto dá o maior salto, e aparece mais quando a carreira trava', () => {
    const secret = EVENTS_BY_KEY[SECRET_EVENT_KEY]
    const base = { age: 21, squadRole: 'starter', league: { tier: 1 } } as unknown as EventContext
    const stuck = { ...base, squadRole: 'bench' } as EventContext
    expect(struggling(base)).toBe(false)
    expect(struggling(stuck)).toBe(true)
    const weight = (ctx: EventContext) => (typeof secret.weight === 'function' ? secret.weight(ctx) : secret.weight)
    expect(weight(stuck)).toBeGreaterThan(weight(base))
    const bestGain = (key: string) =>
      Math.max(0, ...EVENTS_BY_KEY[key].choices(base).flatMap((choice) => choice.outcomes.map((o) => o.effects.ovr ?? 0)))
    const others = Object.keys(EVENTS_BY_KEY).filter((key) => key !== SECRET_EVENT_KEY)
    expect(bestGain(SECRET_EVENT_KEY)).toBeGreaterThan(Math.max(...others.map(bestGain)))
  })

  it('todo ganho de OVR por evento sobe o teto na mesma medida', () => {
    // A mentoria do veterano só tem resultados positivos (+5 ou +2).
    for (let i = 0; i < 400; i += 1) {
      let state = createCareer({ ...INPUT, seed: `teto-${i}` }, CATALOG)
      for (let step = 0; step < 40 && state.phase === 'career'; step += 1) {
        const decision = state.decision!
        if (decision.eventKey === 'veteran_mentor') {
          const accept = decision.options.find((o) => 'choiceKey' in o && o.choiceKey === 'accept')!
          const after = decide(state, accept.id, CATALOG)
          expect([2, 5]).toContain(after.player.potential - state.player.potential)
          return
        }
        state = decide(state, decision.options[0].id, CATALOG)
      }
    }
    throw new Error('nenhuma mentoria encontrada em 400 carreiras')
  })

  it('a virada do evento secreto passa do teto antigo', () => {
    // Procura uma carreira em que o convite aparece e aceita.
    for (let i = 0; i < 400; i += 1) {
      let state = createCareer({ ...INPUT, seed: `virada-${i}` }, CATALOG)
      for (let step = 0; step < 40 && state.phase === 'career'; step += 1) {
        const decision = state.decision!
        if (decision.eventKey === SECRET_EVENT_KEY) {
          const before = state.player
          const accept = decision.options.find((o) => 'choiceKey' in o && o.choiceKey === 'accept')!
          const after = decide(state, accept.id, CATALOG)
          if (after.player.potential > before.potential) {
            expect(after.player.ovr).toBeGreaterThan(before.ovr)
            return
          }
          break
        }
        state = decide(state, decision.options[0].id, CATALOG)
      }
    }
    throw new Error('nenhuma virada encontrada em 400 carreiras')
  })
})
