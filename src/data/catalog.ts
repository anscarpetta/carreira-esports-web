import type { Catalog, LeagueData, TeamData } from '../engine/types.ts'
import { BRAZIL_TEAMS, CBLOL } from './brazil.ts'

function indexById<T extends { id: string }>(items: readonly T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]))
}

const LEAGUES: readonly LeagueData[] = [CBLOL]
const TEAMS: readonly TeamData[] = [...BRAZIL_TEAMS]

export const CATALOG: Catalog = {
  leagues: indexById(LEAGUES),
  teams: indexById(TEAMS),
  // A carreira começa na temporada seguinte à de referência dos dados (2026).
  startYear: 2027,
}
