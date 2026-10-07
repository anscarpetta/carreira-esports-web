// Dinâmica dos times: força = estrutura da organização + momento do elenco.
//
// - A estrutura (0 a 5) define o nível "natural" do time na liga e muda devagar.
// - O momento oscila a cada pré-temporada e tende a voltar ao nível natural.
// - Projetos ambiciosos são raros: o time sobe na hora e, um ano depois,
//   ou se consolida ou desmorona (podendo até sair da liga).
// Base: docs/pesquisa-ciclos-e-forca.md.

import { chance, float, pick, type Rng } from './rng.ts'
import type { Catalog, LeagueData, TeamState } from './types.ts'

export type Trend = 'up' | 'rising' | 'stable' | 'falling' | 'down'

export interface LeagueChange {
  readonly leagueId: string
  readonly leftTeamId: string
  readonly joinedTeamId: string
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

export function initialTeams(catalog: Catalog): Record<string, TeamState> {
  const teams: Record<string, TeamState> = {}
  for (const team of Object.values(catalog.teams)) {
    teams[team.id] = { id: team.id, leagueId: null, rating: team.rating, structure: team.structure, ambitiousSince: null }
  }
  for (const league of Object.values(catalog.leagues)) {
    for (const teamId of league.teamIds) {
      teams[teamId] = { ...teams[teamId], leagueId: league.id }
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
}

export interface OffseasonResult {
  readonly rng: Rng
  readonly teams: Record<string, TeamState>
  readonly changes: readonly LeagueChange[]
}

const AMBITIOUS_CHANCE_SMALL = 0.08
const AMBITIOUS_CHANCE_BIG = 0.03

// Pré-temporada (janela 3 → 1): reformulação dos elencos.
export function offseasonUpdate(
  rng: Rng,
  current: Readonly<Record<string, TeamState>>,
  catalog: Catalog,
  context: OffseasonContext,
): OffseasonResult {
  let r = rng
  const teams: Record<string, TeamState> = { ...current }
  const changes: LeagueChange[] = []

  for (const league of Object.values(catalog.leagues)) {
    const members = leagueTeams(teams, league.id).sort((a, b) => a.id.localeCompare(b.id))
    for (const team of members) {
      let { rating, structure, ambitiousSince } = team
      let leaves = false

      // 1. Resolve o projeto ambicioso do ano anterior.
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
          if (structure <= 1) {
            const exit = chance(r, 0.5)
            r = exit.rng
            leaves = exit.value
          }
        }
        ambitiousSince = null
      }

      // 2. Reformulação: o momento volta parcialmente ao nível natural, com sorte.
      const target = structureTarget(league, structure)
      const persistence = structure >= 4 ? 0.4 : 0.55
      const noise = normal(r)
      r = noise.rng
      rating = target + (rating - target) * persistence + noise.value * 2.2

      // 3. "Projeto em volta de você": um titular acima do nível do time puxa o time para cima.
      if (team.id === context.playerTeamId && context.playerSurplus > 0) {
        rating += Math.min(2.5, 0.25 * context.playerSurplus)
      }

      // 4. Um novo projeto ambicioso começa (raro).
      if (!leaves) {
        const starts = chance(r, structure >= 4 ? AMBITIOUS_CHANCE_BIG : AMBITIOUS_CHANCE_SMALL)
        r = starts.rng
        if (starts.value) {
          const boost = float(r, 3, 5)
          r = boost.rng
          rating += boost.value
          ambitiousSince = context.year
        }
      }

      teams[team.id] = { ...team, rating: clampRating(league, rating), structure, ambitiousSince }

      if (leaves) {
        const available = league.reserveTeamIds.filter((id) => teams[id] && teams[id].leagueId === null)
        if (available.length > 0) {
          const newcomer = pick(r, available)
          r = newcomer.rng
          const start = float(r, 0, 3)
          r = start.rng
          teams[team.id] = { ...teams[team.id], leagueId: null, ambitiousSince: null }
          teams[newcomer.value] = {
            ...teams[newcomer.value],
            leagueId: league.id,
            rating: league.ratingRange[0] + start.value,
            ambitiousSince: null,
          }
          changes.push({ leagueId: league.id, leftTeamId: team.id, joinedTeamId: newcomer.value })
        }
      }
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
  for (const league of Object.values(catalog.leagues)) {
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
