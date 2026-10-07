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
  return Math.min(high + 2, 99, Math.max(low - 2, rating))
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
// Usa a força da temporada que acabou (antes dos reforços da pré-temporada) e, quando há
// colocações reais (liga do jogador), a campanha pesa bastante: 1º lugar médio vale ~+9.
function seasonScore(
  rng: Rng,
  team: TeamState,
  placements: Readonly<Record<string, readonly number[]>> | undefined,
  seasonRating: number,
): { rng: Rng; value: number } {
  const noise = normal(rng)
  const places = placements?.[team.id]
  const bonus = places && places.length > 0 ? (4.5 - places.reduce((a, b) => a + b, 0) / places.length) * 2.5 : 0
  return { rng: noise.rng, value: seasonRating + noise.value * 1.5 + bonus }
}

// O convidado mantém a vaga sem série se foi campeão de algum split do ano ou terminou,
// na média, entre os 3 primeiros. Sem colocações (liga que o jogador não acompanha),
// vale a força: entre as 3 mais fortes da liga.
export function guestKeepsSpot(
  guest: TeamState,
  members: readonly TeamState[],
  placements: Readonly<Record<string, readonly number[]>> | undefined,
): boolean {
  const places = placements?.[guest.id]
  if (places && places.length > 0) {
    const average = places.reduce((a, b) => a + b, 0) / places.length
    return places.includes(1) || average <= 3
  }
  const rank = [...members].sort((a, b) => b.rating - a.rating).findIndex((t) => t.id === guest.id)
  return rank >= 0 && rank < 3
}

// Liga de origem de um time (nos dados de 2026), se for uma das ligas desafiantes da liga de cima.
function originLeague(catalog: Catalog, teamId: string, upper: LeagueData): LeagueData | null {
  const allowed = upper.challengerLeagueIds ?? (upper.lowerLeagueId ? [upper.lowerLeagueId] : [])
  for (const id of allowed) {
    const league = catalog.leagues[id]
    if (league && (league.teamIds.includes(teamId) || league.reserveTeamIds.includes(teamId))) return league
  }
  return null
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
          if (structure <= 1 && !isAcademy(catalog, team.id) && !league.franchised) {
            const exit = chance(r, 0.5)
            r = exit.rng
            leaves = exit.value
          }
        }
        ambitiousSince = null
      }

      // Reformulação: o momento volta parcialmente ao nível natural, com sorte.
      const target = structureTarget(league, structure)
      // Time muito acima do nível natural perde peças (os rivais contratam do campeão).
      const persistence = rating - target > 2 ? 0.3 : structure >= 4 ? 0.4 : 0.55
      const noise = normal(r)
      r = noise.rng
      rating = target + (rating - target) * persistence + noise.value * 2.2

      // "Projeto em volta de você": um titular acima do nível do time puxa o time para cima.
      if (team.id === context.playerTeamId && context.playerSurplus > 0) {
        rating += Math.min(1.5, 0.15 * context.playerSurplus)
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
      const score = seasonScore(r, team, context.placements, current[team.id]?.rating ?? team.rating)
      r = score.rng
      scored.push({ team, score: score.value })
    }
    scored.sort((a, b) => b.score - a.score)

    if (upper.promotion === 'guest_series') {
      // O desafiante pode vir de mais de uma liga (Desafiante e Liga Regional Sur).
      const extra = (upper.challengerLeagueIds ?? [lower.id]).filter((id) => id !== lower.id && catalog.leagues[id])
      for (const leagueId of extra) {
        for (const team of leagueTeams(teams, leagueId)
          .filter((t) => !isAcademy(catalog, t.id))
          .sort((a, b) => a.id.localeCompare(b.id))) {
          const score = seasonScore(r, team, context.placements, current[team.id]?.rating ?? team.rating)
          r = score.rng
          scored.push({ team, score: score.value })
        }
      }
      scored.sort((a, b) => b.score - a.score)
      const guests = leagueTeams(teams, upper.id)
        .filter((t) => t.guest)
        .sort((a, b) => a.id.localeCompare(b.id))
      // Força do time na série, contando o jogador se ele for titular ali.
      const seriesRating = (team: TeamState) =>
        team.id === context.playerTeamId ? team.rating + 0.2 * context.playerSurplus : team.rating
      const challengers = scored.map((x) => x.team)
      let next = 0
      for (const guest of guests) {
        // Campanha forte garante a vaga: campeão de algum split ou média entre os 3 primeiros.
        if (guestKeepsSpot(guest, leagueTeams(teams, upper.id), context.placements)) continue
        const challenger = challengers[next]
        next += 1
        if (!challenger) continue
        const series = playSeries(r, seriesRating(guest), seriesRating(challenger), 5)
        r = series.rng
        if (series.value.aWon) continue
        const challengerLeague = catalog.leagues[challenger.leagueId ?? lower.id] ?? lower
        // O convidado rebaixado volta para a liga de origem (ex.: a 9z volta para a Liga Regional Sur);
        // se não veio de uma das ligas desafiantes, cai para a liga logo abaixo.
        const home = originLeague(catalog, guest.id, upper)
        const destination = home ?? lower
        const down = moveTeam(r, guest, destination, false)
        r = down.rng
        const up = moveTeam(r, challenger, upper, true)
        r = up.rng
        teams[guest.id] = down.team
        teams[challenger.id] = up.team
        changes.push({ kind: 'relegated', teamId: guest.id, from: upper.id, to: destination.id })
        changes.push({ kind: 'promoted', teamId: challenger.id, from: challengerLeague.id, to: upper.id })
      }
    } else {
      const upperScored: { team: TeamState; score: number }[] = []
      for (const team of leagueTeams(teams, upper.id)
        .filter((t) => !isAcademy(catalog, t.id))
        .sort((a, b) => a.id.localeCompare(b.id))) {
        const score = seasonScore(r, team, context.placements, current[team.id]?.rating ?? team.rating)
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

  // 3. Liga com time a mais (o convidado rebaixado voltou para a liga de origem, e o
  // desafiante veio de outra): o pior time cai para a liga de baixo ou sai da pirâmide.
  for (const league of leagues) {
    let extra = leagueTeams(teams, league.id).length - league.teamIds.length
    while (extra > 0) {
      const weakest = leagueTeams(teams, league.id)
        .filter((t) => !isAcademy(catalog, t.id) && !t.guest)
        .sort((a, b) => a.rating - b.rating || a.id.localeCompare(b.id))[0]
      if (!weakest) break
      const lower = league.lowerLeagueId ? catalog.leagues[league.lowerLeagueId] : null
      if (lower) {
        const down = moveTeam(r, weakest, lower, false)
        r = down.rng
        teams[weakest.id] = down.team
        changes.push({ kind: 'relegated', teamId: weakest.id, from: league.id, to: lower.id })
      } else {
        teams[weakest.id] = { ...weakest, leagueId: null, guest: false, ambitiousSince: null }
        changes.push({ kind: 'left', teamId: weakest.id, from: league.id, to: null })
      }
      extra -= 1
    }
  }

  // 4. Vagas abertas por organizações que saíram: sobe o melhor de baixo, em cascata.
  for (const league of leagues) {
    while (leagueTeams(teams, league.id).length < league.teamIds.length) {
      const lower = league.lowerLeagueId ? catalog.leagues[league.lowerLeagueId] : null
      const pool = lower
        ? leagueTeams(teams, lower.id).filter((t) => !isAcademy(catalog, t.id))
        : outsiders(catalog, teams, league)
      if (pool.length === 0) break
      let picked: TeamState
      if (lower) {
        // Sobe quem fez a melhor temporada (campanha real, quando há; senão, a força).
        const merit = (t: TeamState) => {
          const places = context.placements?.[t.id]
          const bonus = places && places.length > 0 ? (4.5 - places.reduce((a, b) => a + b, 0) / places.length) * 2.5 : 0
          return (current[t.id]?.rating ?? t.rating) + bonus
        }
        picked = [...pool].sort((a, b) => merit(b) - merit(a) || a.id.localeCompare(b.id))[0]
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
