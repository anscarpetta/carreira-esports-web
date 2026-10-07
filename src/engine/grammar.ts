// Artigos e contrações para nomes de ligas e splits ("do CBLOL", "da Qualificatória").

import type { LeagueData } from './types.ts'

type Gendered = Pick<LeagueData, 'feminine'> | null | undefined

export const art = (league: Gendered): string => (league?.feminine ? 'a' : 'o')
export const of = (league: Gendered): string => (league?.feminine ? 'da' : 'do')
export const in_ = (league: Gendered): string => (league?.feminine ? 'na' : 'no')
