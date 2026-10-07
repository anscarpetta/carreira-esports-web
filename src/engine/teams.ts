// Dinâmica dos times: força = estrutura da organização + momento do elenco.
//
// - A estrutura (0 a 5) define o nível "natural" do time na liga e muda devagar.
// - O momento oscila a cada pré-temporada e tende a voltar ao nível natural.
// - Projetos ambiciosos são raros: o time sobe na hora e, um ano depois,
//   ou se consolida ou desmorona (podendo até sair da liga).
// - Na pré-temporada também acontecem acesso e rebaixamento entre os tiers.
// Base: docs/pesquisa-ciclos-e-forca.md.

import { chance, float, pick, type Rng } from './rng.ts'
import { playSeries } from './strength.ts'
import type { Catalog, LeagueData, TeamState } from './types.ts'

export type Trend = 'up' | 'rising' | 'stable' | 'falling' | 'down'

export type LeagueChangeKind = 'promoted' | 'relegated' | 'left' | 'joined' | 'ambitious'

export interface LeagueChange {
  readonly kind: LeagueChangeKind
  readonly teamId: string
  // Liga de origem e de destino (null = fora da pirâmide).
  readonly from: string | null
  readonly to: string | null
}

// Nível natural de um time na liga, conforme a estrutura da organização.
export function structureTarget(league: LeagueData, structure: number): number {
  const [low, high] = league.ratingRange
  return low + (high - low) * (0.1 + 0.12 * structure)
}

// Forma do momento: quanto o time está acima (+) ou abaixo (-) do seu nível natural.
export function teamForm(team: TeamState, league: LeagueData): number {
  return team.rating - structureTarget(league, team.structure)
}

export function trendOf(form: number): Trend {
  if (form >= 2.5) return 'up'
  if (form >= 1) return 'rising'
  if (form > -1) return 'stable'
  if (form > -2.5) return 'falling'
  return 'down'
}

function clampRating(league: LeagueData, rating: number): number {
  const [low, high] = league.ratingRange
  return Math.min(high + 2, Math.max(low - 2, rating))
}

export function isAcademy(catalog: Catalog, teamId: string): boolean {
  return catalog.teams[teamId]?.parentId !== undefined
}

export function initialTeams(catalog: Catalog): Record<string, TeamState> {
  const teams: Record<string, TeamState> = {}
  for (const team of Object.values(catalog.teams)) {
    teams[team.id] = {
      id: team.id,
      leagueId: null,
      rating: team.rating,
      structure: team.structure,
      ambitiousSince: null,
      guest: false,
    }
  }
  for (const league of Object.values(catalog.leagues)) {
    for (const teamId of league.teamIds) {
      teams[teamId] = { ...teams[teamId], leagueId: league.id, guest: league.guestTeamIds?.includes(teamId) ?? false }
    }
  }
  return teams
}

export function leagueTeams(teams: Readonly<Record<string, TeamState>>, leagueId: string): TeamState[] {
  return Object.values(teams).filter((team) => team.leagueId === leagueId)
}

// Aproximação de uma normal com média 0 e desvio padrão 1 (soma de uniformes).
function normal(rng: Rng): { rng: Rng; value: number } {
  let current = rng
  let sum = 0
  for (let i = 0; i < 4; i += 1) {
    const roll = float(current, -1, 1)
    sum += roll.value
    current = roll.rng
  }
  // A soma de 4 uniformes em [-1, 1] tem desvio padrão sqrt(4/3).
  return { rng: current, value: sum / Math.sqrt(4 / 3) }
}

export interface OffseasonContext {
  readonly year: number
  // Time do jogador e o quanto ele foi destaque (OVR acima da força do time), se titular.
  readonly playerTeamId: string | null
  readonly playerSurplus: number
  // Colocações do ano na liga do jogador (o resto da pirâmide usa a força).
  readonly placements?: Readonly<Record<string, readonly number[]>>
}

export interface OffseasonResult {
  readonly rng: Rng
  readonly teams: Record<string, TeamState>
  readonly changes: readonly LeagueChange[]
}

const AMBITIOUS_CHANCE_SMALL = 0.08
const AMBITIOUS_CHANCE_BIG = 0.03

function leaguesByTier(catalog: Catalog): LeagueData[] {
  return Object.values(catalog.leagues).sort((a, b) => a.tier - b.tier || a.id.localeCompare(b.id))
}

// Desempenho do ano para decidir acesso e rebaixamento.
function seasonScore(
  rng: Rng,
  team: TeamState,
  placements: Readonly<Record<string, readonly number[]>> | undefined,
): { rng: Rng; value: number } {
  const noise = normal(rng)
  const places = placements?.[team.id]
  const bonus = places && places.length > 0 ? (4.5 - places.reduce((a, b) => a + b, 0) / places.length) * 0.8 : 0
  return { rng: noise.rng, value: team.rating + noise.value * 1.5 + bonus }
}

function moveTeam(rng: Rng, team: TeamState, to: LeagueData, guest: boolean): { rng: Rng; team: TeamState } {
  const [low, high] = to.ratingRange
  const shift = float(rng, 0, 1.5)
  let rating = team.rating
  if (rating < low) rating = low + shift.value
  if (rating > high) rating = high - shift.value
  return { rng: shift.rng, team: { ...team, leagueId: to.id, rating, guest } }
}

// Organizações da região fora da pirâmide (reservas ou que saíram) que podem voltar pelo tier mais baixo.
function outsiders(catalog: Catalog, teams: Readonly<Record<string, TeamState>>, league: LeagueData): TeamState[] {
  const regional = new Set(league.reserveTeamIds)
  for (const other of Object.values(catalog.leagues)) {
    if (other.region === league.region) for (const id of other.teamIds) regional.add(id)
  }
  return [...regional]
    .map((id) => teams[id])
    .filter((t) => t && t.leagueId === null && !isAcademy(catalog, t.id))
}

// Pré-temporada (janela 3 → 1): reformulação dos elencos, acesso e rebaixamento.
export function offseasonUpdate(
  rng: Rng,
  current: Readonly<Record<string, TeamState>>,
  catalog: Catalog,
  context: OffseasonContext,
): OffseasonResult {
  let r = rng
  const teams: Record<string, TeamState> = { ...current }
  const changes: LeagueChange[] = []
  const leagues = leaguesByTier(catalog)

  // 1. Momento de cada time.
  for (const league of leagues) {
    const members = leagueTeams(teams, league.id).sort((a, b) => a.id.localeCompare(b.id))
    for (const team of members) {
      let { rating, structure, ambitiousSince } = team
      let leaves = false

      // Resolve o projeto ambicioso do ano anterior.
      if (ambitiousSince !== null && ambitiousSince < context.year) {
        const success = chance(r, 0.5)
        r = success.rng
        if (success.value) {
          structure = Math.min(5, structure + 1)
        } else {
          const drop = float(r, 4, 6)
          r = drop.rng
          rating -= drop.value
          structure = Math.max(0, structure - 1)
          if (structure <= 1 && !isAcademy(catalog, team.id)) {
            const exit = chance(r, 0.5)
            r = exit.rng
            leaves = exit.value
          }
        }
        ambitiousSince = null
      }

      // Reformulação: o momento volta parcialmente ao nível natural, com sorte.
      const target = structureTarget(league, structure)
      const persistence = structure >= 4 ? 0.4 : 0.55
      const noise = normal(r)
      r = noise.rng
      rating = target + (rating - target) * persistence + noise.value * 2.2

      // "Projeto em volta de você": um titular acima do nível do time puxa o time para cima.
      if (team.id === context.playerTeamId && context.playerSurplus > 0) {
        rating += Math.min(2.5, 0.25 * context.playerSurplus)
      }

      // Um novo projeto ambicioso começa (raro; academies não fazem).
      if (!leaves && !isAcademy(catalog, team.id)) {
        const starts = chance(r, structure >= 4 ? AMBITIOUS_CHANCE_BIG : AMBITIOUS_CHANCE_SMALL)
        r = starts.rng
        if (starts.value) {
          const boost = float(r, 3, 5)
          r = boost.rng
          rating += boost.value
          ambitiousSince = context.year
          changes.push({ kind: 'ambitious', teamId: team.id, from: league.id, to: league.id })
        }
      }

      teams[team.id] = {
        ...team,
        rating: clampRating(league, rating),
        structure,
        ambitiousSince,
        leagueId: leaves ? null : league.id,
        guest: leaves ? false : team.guest,
      }
      if (leaves) changes.push({ kind: 'left', teamId: team.id, from: league.id, to: null })
    }
  }

  // 2. Acesso e rebaixamento entre cada liga e a de baixo.
  for (const upper of leagues) {
    if (!upper.lowerLeagueId || !upper.promotion) continue
    const lower = catalog.leagues[upper.lowerLeagueId]
    if (!lower) continue
    const candidates = leagueTeams(teams, lower.id)
      .filter((t) => !isAcademy(catalog, t.id))
      .sort((a, b) => a.id.localeCompare(b.id))
    const scored: { team: TeamState; score: number }[] = []
    for (const team of candidates) {
      const score = seasonScore(r, team, context.placements)
      r = score.rng
      scored.push({ team, score: score.value })
    }
    scored.sort((a, b) => b.score - a.score)

    if (upper.promotion === 'guest_series') {
      const guests = leagueTeams(teams, upper.id)
        .filter((t) => t.guest)
        .sort((a, b) => a.id.localeCompare(b.id))
      guests.forEach((guest, i) => {
        const challenger = scored[i]?.team
        if (!challenger) return
        const series = playSeries(r, guest.rating, challenger.rating, 5)
        r = series.rng
        if (series.value.aWon) return
        const down = moveTeam(r, guest, lower, false)
        r = down.rng
        const up = moveTeam(r, challenger, upper, true)
        r = up.rng
        teams[guest.id] = down.team
        teams[challenger.id] = up.team
        changes.push({ kind: 'relegated', teamId: guest.id, from: upper.id, to: lower.id })
        changes.push({ kind: 'promoted', teamId: challenger.id, from: lower.id, to: upper.id })
      })
    } else {
      const upperScored: { team: TeamState; score: number }[] = []
      for (const team of leagueTeams(teams, upper.id)
        .filter((t) => !isAcademy(catalog, t.id))
        .sort((a, b) => a.id.localeCompare(b.id))) {
        const score = seasonScore(r, team, context.placements)
        r = score.rng
        upperScored.push({ team, score: score.value })
      }
      upperScored.sort((a, b) => a.score - b.score)
      const spots = Math.min(2, upperScored.length, scored.length)
      for (let i = 0; i < spots; i += 1) {
        const down = moveTeam(r, upperScored[i].team, lower, false)
        r = down.rng
        const up = moveTeam(r, scored[i].team, upper, false)
        r = up.rng
        teams[down.team.id] = down.team
        teams[up.team.id] = up.team
        changes.push({ kind: 'relegated', teamId: down.team.id, from: upper.id, to: lower.id })
        changes.push({ kind: 'promoted', teamId: up.team.id, from: lower.id, to: upper.id })
      }
    }
  }

  // 3. Vagas abertas por organizações que saíram: sobe o melhor de baixo, em cascata.
  for (const league of leagues) {
    while (leagueTeams(teams, league.id).length < league.teamIds.length) {
      const lower = league.lowerLeagueId ? catalog.leagues[league.lowerLeagueId] : null
      const pool = lower
        ? leagueTeams(teams, lower.id).filter((t) => !isAcademy(catalog, t.id))
        : outsiders(catalog, teams, league)
      if (pool.length === 0) break
      let picked: TeamState
      if (lower) {
        picked = [...pool].sort((a, b) => b.rating - a.rating || a.id.localeCompare(b.id))[0]
      } else {
        const choice = pick(r, [...pool].sort((a, b) => a.id.localeCompare(b.id)))
        r = choice.rng
        picked = choice.value
      }
      const moved = moveTeam(r, picked, league, false)
      r = moved.rng
      teams[picked.id] = moved.team
      changes.push({ kind: lower ? 'promoted' : 'joined', teamId: picked.id, from: lower?.id ?? null, to: league.id })
    }
  }

  return { rng: r, teams, changes }
}

// Entre splits do mesmo ano: pequenas mudanças de elenco e de forma.
export function midseasonDrift(
  rng: Rng,
  current: Readonly<Record<string, TeamState>>,
  catalog: Catalog,
): { rng: Rng; teams: Record<string, TeamState> } {
  let r = rng
  const teams: Record<string, TeamState> = { ...current }
  for (const league of leaguesByTier(catalog)) {
    const members = leagueTeams(teams, league.id).sort((a, b) => a.id.localeCompare(b.id))
    for (const team of members) {
      const noise = normal(r)
      r = noise.rng
      const target = structureTarget(league, team.structure)
      const rating = team.rating + 0.15 * (target - team.rating) + noise.value * 0.8
      teams[team.id] = { ...team, rating: clampRating(league, rating) }
    }
  }
  return { rng: r, teams }
}
