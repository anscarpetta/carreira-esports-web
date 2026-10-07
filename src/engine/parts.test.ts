import { describe, expect, it } from 'vitest'
import { CATALOG } from '../data/catalog.ts'
import { computeAwards } from './awards.ts'
import { EVENTS, planEvents } from './events.ts'
import { simulateSplit } from './league.ts'
import { generateOffers } from './offers.ts'
import { createPlayer, marketValue, rollYearlyDevelopment, shiftRole, squadRoleFor } from './player.ts'
import { createRng } from './rng.ts'
import { generateStats, kda } from './stats.ts'
import { initialTeams, leagueTeams, offseasonUpdate, structureTarget, trendOf } from './teams.ts'

const CBLOL = CATALOG.leagues.cblol
const TEAMS = CBLOL.teamIds.map((id) => ({ id, rating: CATALOG.teams[id].rating }))

describe('liga', () => {
  it('distribui colocações de 1 a 8 e o campeão é o 1º', () => {
    let rng = createRng('liga')
    for (let i = 0; i < 50; i += 1) {
      const result = simulateSplit(rng, CBLOL, TEAMS, null)
      rng = result.rng
      expect(Object.values(result.placements).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
      expect(result.placements[result.championId]).toBe(1)
      expect(result.placements[result.runnerUpId]).toBe(2)
    }
  })

  it('times mais fortes ganham mais títulos', () => {
    let rng = createRng('fortes')
    const titles: Record<string, number> = {}
    for (let i = 0; i < 400; i += 1) {
      const result = simulateSplit(rng, CBLOL, TEAMS, null)
      rng = result.rng
      titles[result.championId] = (titles[result.championId] ?? 0) + 1
    }
    expect(titles.furia ?? 0).toBeGreaterThan(titles.leviatan ?? 0)
  })

  it('a call do Barão pode forçar ou impedir o título', () => {
    const base = { teamId: 'leviatan', ratingWithPlayer: 74, ratingWithoutPlayer: 74, playChance: 1 }
    const forced = simulateSplit(createRng('forca'), CBLOL, TEAMS, { ...base, titleOverride: 'force' })
    expect(forced.championId).toBe('leviatan')
    const skipped = simulateSplit(createRng('impede'), CBLOL, TEAMS, { ...base, teamId: 'furia', titleOverride: 'skip' })
    expect(skipped.championId).not.toBe('furia')
  })

  it('registra os jogos do jogador quando ele joga', () => {
    const result = simulateSplit(createRng('jogos'), CBLOL, TEAMS, {
      teamId: 'loud',
      ratingWithPlayer: 79,
      ratingWithoutPlayer: 78,
      playChance: 1,
      titleOverride: null,
    })
    expect(result.playerGames.length).toBe(result.playerTeamGames)
    expect(result.playerGames.length).toBeGreaterThanOrEqual(14)
  })
})

describe('times', () => {
  it('a tendência segue a forma do time', () => {
    expect(trendOf(3)).toBe('up')
    expect(trendOf(1.5)).toBe('rising')
    expect(trendOf(0)).toBe('stable')
    expect(trendOf(-1.5)).toBe('falling')
    expect(trendOf(-3)).toBe('down')
  })

  it('a paiN começa em baixa e a FURIA em alta (dados de 2026)', () => {
    const teams = initialTeams(CATALOG)
    const formOf = (id: string) => teams[id].rating - structureTarget(CBLOL, teams[id].structure)
    expect(trendOf(formOf('pain'))).toBe('down')
    expect(['up', 'rising', 'stable']).toContain(trendOf(formOf('furia')))
  })

  it('acesso e rebaixamento mantêm o tamanho de cada liga', () => {
    let rng = createRng('acesso')
    const initial = initialTeams(CATALOG)
    let teams = initial
    let promoted = 0
    for (let year = 2027; year < 2077; year += 1) {
      const result = offseasonUpdate(rng, teams, CATALOG, { year, playerTeamId: null, playerSurplus: 0 })
      rng = result.rng
      teams = result.teams
      promoted += result.changes.filter((c) => c.kind === 'promoted').length
      for (const league of Object.values(CATALOG.leagues)) {
        expect(leagueTeams(teams, league.id), `${league.id} em ${year}`).toHaveLength(league.teamIds.length)
      }
      // Academies nunca sobem nem caem: ficam na liga em que começaram.
      for (const team of Object.values(teams)) {
        if (CATALOG.teams[team.id].parentId) expect(team.leagueId).toBe(initial[team.id].leagueId)
      }
      // O CBLOL tem sempre exatamente uma vaga de convidado.
      expect(leagueTeams(teams, 'cblol').filter((t) => t.guest)).toHaveLength(1)
    }
    expect(promoted).toBeGreaterThan(20)
  })

  it('a pré-temporada mantém 8 times na liga e forças dentro da faixa', () => {
    let rng = createRng('offseason')
    let teams = initialTeams(CATALOG)
    let changes = 0
    let ambitious = 0
    for (let year = 2027; year < 2127; year += 1) {
      const result = offseasonUpdate(rng, teams, CATALOG, { year, playerTeamId: null, playerSurplus: 0 })
      rng = result.rng
      teams = result.teams
      changes += result.changes.length
      const members = leagueTeams(teams, 'cblol')
      expect(members).toHaveLength(8)
      ambitious += members.filter((t) => t.ambitiousSince === year).length
      for (const team of members) {
        expect(team.rating).toBeGreaterThanOrEqual(CBLOL.ratingRange[0] - 2)
        expect(team.rating).toBeLessThanOrEqual(CBLOL.ratingRange[1] + 2)
      }
    }
    // Em 100 anos, projetos ambiciosos acontecem, mas são raros.
    expect(ambitious).toBeGreaterThan(5)
    expect(ambitious).toBeLessThan(150)
    expect(changes).toBeGreaterThanOrEqual(0)
  })
})

describe('jogador', () => {
  it('o papel depende da diferença para a força do time', () => {
    expect(squadRoleFor(80, 78)).toBe('starter')
    expect(squadRoleFor(75, 78)).toBe('starter')
    expect(squadRoleFor(73, 78)).toBe('reserve')
    expect(squadRoleFor(65, 78)).toBe('bench')
    expect(shiftRole('starter', -1)).toBe('reserve')
    expect(shiftRole('bench', -1)).toBe('bench')
    expect(shiftRole('reserve', 1)).toBe('starter')
  })

  it('o valor de mercado cresce com o OVR e cai com a idade', () => {
    expect(marketValue(80, 22)).toBeGreaterThan(marketValue(70, 22))
    expect(marketValue(80, 30)).toBeLessThan(marketValue(80, 22))
  })

  it('a evolução respeita o potencial', () => {
    const player = { ...createPlayer(createRng('pot'), { nick: 'x', role: 'top', nationality: 'BR', startYear: 2027 }).value, ovr: 70, potential: 71 }
    let rng = createRng('evo')
    for (let i = 0; i < 100; i += 1) {
      const roll = rollYearlyDevelopment(rng, player, 18)
      rng = roll.rng
      expect(roll.value.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(1)
    }
  })
})

describe('estatísticas e prêmios', () => {
  it('suporte tem mais assistências e menos abates que o ADC', () => {
    const games = Array.from({ length: 200 }, (_, i) => ({ won: i % 2 === 0, opponentRating: 78, stage: 'regular' as const }))
    const support = generateStats(createRng('sup'), 'support', 78, games).value
    const adc = generateStats(createRng('adc'), 'adc', 78, games).value
    expect(support.assists).toBeGreaterThan(adc.assists)
    expect(support.kills).toBeLessThan(adc.kills)
    expect(kda(support)).toBeGreaterThan(0)
  })

  it('MVP da final só vai para o campeão', () => {
    const standings = TEAMS.map((t, i) => ({ teamId: t.id, seriesWins: 7 - i, seriesLosses: i, gameDiff: 7 - 2 * i }))
    const ratings = Object.fromEntries(TEAMS.map((t) => [t.id, t.rating]))
    let rng = createRng('premios')
    for (let i = 0; i < 100; i += 1) {
      const roll = computeAwards(rng, {
        league: CBLOL,
        year: 2027,
        splitIndex: 0,
        ratings,
        standings,
        championId: 'furia',
        playerTeamId: 'loud',
        playerOvr: 90,
        playerGames: 20,
        playerTeamGames: 20,
        playerInFinal: true,
      })
      rng = roll.rng
      expect(roll.value.some((a) => a.kind === 'finals_mvp')).toBe(false)
    }
  })
})

describe('ofertas e eventos', () => {
  it('ofertas não repetem time nem incluem o time atual', () => {
    const teams = leagueTeams(initialTeams(CATALOG), 'cblol').map((team) => ({ team, tier: 1 }))
    let rng = createRng('ofertas')
    for (let i = 0; i < 100; i += 1) {
      const roll = generateOffers(rng, teams, 78, 22, ['loud'], 2, 1)
      rng = roll.rng
      const ids = roll.value.map((o) => o.teamId)
      expect(new Set(ids).size).toBe(ids.length)
      expect(ids).not.toContain('loud')
    }
  })

  it('jogador de banco com mais de 22 anos não recebe ofertas', () => {
    const teams = leagueTeams(initialTeams(CATALOG), 'cblol').map((team) => ({ team, tier: 1 }))
    const roll = generateOffers(createRng('banco'), teams, 60, 24, [], 2, 1)
    expect(roll.value).toHaveLength(0)
  })

  it('as probabilidades de cada opção de evento somam 100%', () => {
    for (const event of EVENTS) {
      // Contexto mínimo só para listar as opções.
      const choices = event.choices({} as never)
      for (const choice of choices) {
        if (choice.join && choice.outcomes.length === 0) continue
        const total = choice.outcomes.reduce((sum, o) => sum + o.probability, 0)
        expect(total, `${event.key}.${choice.key}`).toBeCloseTo(1)
      }
    }
  })

  it('o número de eventos planejados depende do modo', () => {
    expect(planEvents(createRng('a'), 'express').value.slotAges).toHaveLength(2)
    const normal = planEvents(createRng('b'), 'normal').value.slotAges.length
    expect(normal).toBeGreaterThanOrEqual(3)
    expect(normal).toBeLessThanOrEqual(4)
    const intense = planEvents(createRng('c'), 'intense').value.slotAges.length
    expect(intense).toBeGreaterThanOrEqual(7)
  })
})

describe('importados e residência', () => {
  it('importado só recebe proposta para ser titular', () => {
    const teams = leagueTeams(initialTeams(CATALOG), 'lck').map((team) => ({ team, tier: 1, importFactor: 0.5 }))
    let rng = createRng('importado')
    for (let i = 0; i < 200; i += 1) {
      const roll = generateOffers(rng, teams, 85, 22, [], 2, 1)
      rng = roll.rng
      for (const offer of roll.value) expect(offer.expectedRole).toBe('starter')
    }
  })
})
