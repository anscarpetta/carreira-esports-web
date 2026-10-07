import type { Catalog, LeagueData, TeamData } from '../engine/types.ts'
import { BRAZIL_TEAMS, CBLOL, CIRCUITO_DESAFIANTE, QUALIFICATORIA_ABERTA } from './brazil.ts'
import { CHINA_TEAMS, LDL, LPL } from './china.ts'
import { EMEA_MASTERS, EUROPE_TEAMS, LEC } from './europe.ts'
import { KOREA_TEAMS, LCK, LCK_CL } from './korea.ts'
import { LATAM_TEAMS, LIGA_REGIONAL_NORTE, LIGA_REGIONAL_SUR } from './latam.ts'
import { LCS, NACL, NORTH_AMERICA_TEAMS } from './northAmerica.ts'
import { LCP, LJL, PACIFIC_TEAMS, PCS, VCS } from './pacific.ts'
import { COUNTRIES, LATAM_DUAL_RESIDENCY, MOBILITY, REGIONS } from './regions.ts'

function indexById<T extends { id: string }>(items: readonly T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]))
}

const LEAGUES: readonly LeagueData[] = [
  CBLOL,
  CIRCUITO_DESAFIANTE,
  QUALIFICATORIA_ABERTA,
  LCK,
  LCK_CL,
  LPL,
  LDL,
  LEC,
  EMEA_MASTERS,
  LCS,
  NACL,
  LIGA_REGIONAL_SUR,
  LIGA_REGIONAL_NORTE,
  LCP,
  VCS,
  LJL,
  PCS,
]

const TEAMS: readonly TeamData[] = [
  ...BRAZIL_TEAMS,
  ...KOREA_TEAMS,
  ...CHINA_TEAMS,
  ...EUROPE_TEAMS,
  ...NORTH_AMERICA_TEAMS,
  ...LATAM_TEAMS,
  ...PACIFIC_TEAMS,
]

export const CATALOG: Catalog = {
  leagues: indexById(LEAGUES),
  teams: indexById(TEAMS),
  regions: indexById(REGIONS),
  countries: Object.fromEntries(COUNTRIES.map((country) => [country.code, country])),
  mobility: MOBILITY,
  latamDualResidency: LATAM_DUAL_RESIDENCY,
  // A carreira começa na temporada seguinte à de referência dos dados (2026).
  startYear: 2027,
}
