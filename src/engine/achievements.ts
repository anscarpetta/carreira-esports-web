// Conquistas: desafios que atravessam carreiras (como no Copero). Cada uma é verificada
// no fim da carreira, a partir do estado final.

import { regionOf } from './career.ts'
import { summarize } from './summary.ts'
import type { CareerState, Catalog, SplitRecord, Title } from './types.ts'

export interface AchievementDef {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly icon: string
  readonly check: (ctx: AchievementContext) => boolean
}

interface AchievementContext {
  readonly state: CareerState
  readonly catalog: Catalog
  readonly titles: readonly Title[]
  readonly history: readonly SplitRecord[]
  readonly home: string
}

const tierOf = (ctx: AchievementContext, leagueId: string | null) =>
  leagueId ? (ctx.catalog.leagues[leagueId]?.tier ?? 9) : 9
const regionOfLeague = (ctx: AchievementContext, leagueId: string | null) =>
  leagueId ? (ctx.catalog.leagues[leagueId]?.region ?? '') : ''
const count = (ctx: AchievementContext, kind: Title['kind']) => ctx.titles.filter((t) => t.kind === kind).length
const leagueTitlesIn = (ctx: AchievementContext, leagueId: string) =>
  ctx.titles.filter((t) => t.kind === 'league' && t.leagueId === leagueId).length
const played = (ctx: AchievementContext) => ctx.history.filter((r) => r.teamId && r.squadRole !== 'paused')

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  {
    id: 'world_champion',
    title: 'Campeão mundial',
    description: 'Ganhe o Worlds.',
    icon: '🌍',
    check: (ctx) => count(ctx, 'worlds') >= 1,
  },
  {
    id: 'impossible',
    title: 'O impossível',
    description: 'Ganhe o Worlds com um time do CBLOL.',
    icon: '🇧🇷',
    check: (ctx) =>
      ctx.titles.some((t) => t.kind === 'worlds' && ctx.history.some((r) => r.year === t.year && r.splitIndex === t.splitIndex && r.leagueId === 'cblol')),
  },
  {
    id: 'grand_slam',
    title: 'Grand Slam',
    description: 'Ganhe First Stand, MSI e Worlds na mesma carreira.',
    icon: '💎',
    check: (ctx) => count(ctx, 'first_stand') >= 1 && count(ctx, 'msi') >= 1 && count(ctx, 'worlds') >= 1,
  },
  {
    id: 'golden_year',
    title: 'Ano de ouro',
    description: 'Ganhe a liga, o MSI e o Worlds no mesmo ano.',
    icon: '👑',
    check: (ctx) => {
      const years = new Set(ctx.titles.filter((t) => t.kind === 'worlds').map((t) => t.year))
      return [...years].some(
        (year) =>
          ctx.titles.some((t) => t.kind === 'msi' && t.year === year) &&
          ctx.titles.some((t) => t.kind === 'league' && t.year === year && tierOf(ctx, t.leagueId) === 1),
      )
    },
  },
  {
    id: 'king_of_brazil',
    title: 'Rei do Brasil',
    description: 'Ganhe 5 títulos do CBLOL.',
    icon: '🏆',
    check: (ctx) => leagueTitlesIn(ctx, 'cblol') >= 5,
  },
  {
    id: 'one_club',
    title: 'Lenda de um time só',
    description: 'Jogue todo o tier 1 por um só time (pelo menos 4 anos) e ganhe a liga e um internacional.',
    icon: '🛡️',
    check: (ctx) => {
      const tier1 = played(ctx).filter((r) => tierOf(ctx, r.leagueId) === 1)
      const teams = new Set(tier1.map((r) => r.teamId))
      const intl = ctx.titles.some((t) => t.kind !== 'league')
      const league = ctx.titles.some((t) => t.kind === 'league' && tierOf(ctx, t.leagueId) === 1)
      return teams.size === 1 && tier1.length >= 12 && intl && league
    },
  },
  {
    id: 'from_the_bottom',
    title: 'Do tier 3 ao topo',
    description: 'Comece no tier 3 e ganhe uma liga de tier 1.',
    icon: '🪜',
    check: (ctx) =>
      tierOf(ctx, played(ctx)[0]?.leagueId ?? null) === 3 &&
      ctx.titles.some((t) => t.kind === 'league' && tierOf(ctx, t.leagueId) === 1),
  },
  {
    id: 'ceos_route',
    title: 'Rota do Ceos',
    description: 'Sendo brasileiro, jogue um tier 1 fora do Brasil.',
    icon: '✈️',
    check: (ctx) =>
      ctx.state.player.nationality === 'BR' &&
      played(ctx).some((r) => tierOf(ctx, r.leagueId) === 1 && regionOfLeague(ctx, r.leagueId) !== 'BR'),
  },
  {
    id: 'brazilian_in_lck',
    title: 'Primeiro brasileiro na LCK',
    description: 'Sendo brasileiro, jogue a LCK.',
    icon: '🇰🇷',
    check: (ctx) => ctx.state.player.nationality === 'BR' && played(ctx).some((r) => r.leagueId === 'lck'),
  },
  {
    id: 'globetrotter',
    title: 'Andarilho',
    description: 'Jogue em 3 regiões diferentes.',
    icon: '🧭',
    check: (ctx) => new Set(played(ctx).map((r) => regionOfLeague(ctx, r.leagueId))).size >= 3,
  },
  {
    id: 'journeyman',
    title: 'Mala de viagem',
    description: 'Jogue por 8 times diferentes.',
    icon: '🧳',
    check: (ctx) => new Set(played(ctx).map((r) => r.teamId)).size >= 8,
  },
  {
    id: 'mvp_machine',
    title: 'Máquina de MVP',
    description: 'Seja MVP de 5 splits.',
    icon: '⭐',
    check: (ctx) => summarize(ctx.state).awards.filter((a) => a.kind === 'split_mvp').length >= 5,
  },
  {
    id: 'giant_slayer',
    title: 'Mata-gigantes',
    description: 'Ganhe o MSI ou o Worlds com um time de estrutura pequena.',
    icon: '🗡️',
    check: (ctx) =>
      ctx.titles.some((t) => (t.kind === 'msi' || t.kind === 'worlds') && (ctx.catalog.teams[t.teamId]?.structure ?? 5) <= 2),
  },
  {
    id: 'prodigy',
    title: 'Prodígio',
    description: 'Seja titular no tier 1 aos 18 anos.',
    icon: '🌟',
    check: (ctx) => ctx.history.some((r) => r.age === 18 && r.squadRole === 'starter' && tierOf(ctx, r.leagueId) === 1),
  },
  {
    id: 'veteran',
    title: 'Veterano',
    description: 'Jogue profissionalmente até os 30 anos.',
    icon: '🧓',
    check: (ctx) => played(ctx).some((r) => r.age >= 30),
  },
  {
    id: 'comeback',
    title: 'A volta do streamer',
    description: 'Largue o competitivo para fazer lives e volte a jogar depois.',
    icon: '🎥',
    check: (ctx) => {
      const pausedAt = ctx.history.findIndex((r) => r.squadRole === 'paused' && !r.teamId)
      return pausedAt >= 0 && ctx.history.slice(pausedAt).some((r) => r.teamId)
    },
  },
  {
    id: 'ringless',
    title: 'Ringless',
    description: 'Seja titular no tier 1 por 3 anos sem ganhar nenhum título.',
    icon: '💍',
    check: (ctx) =>
      ctx.titles.length === 0 && ctx.history.filter((r) => r.squadRole === 'starter' && tierOf(ctx, r.leagueId) === 1).length >= 9,
  },
  {
    id: 'export_product',
    title: 'Produto de exportação',
    description: 'Ganhe um título de liga de tier 1 fora da sua região.',
    icon: '📦',
    check: (ctx) =>
      ctx.titles.some((t) => t.kind === 'league' && tierOf(ctx, t.leagueId) === 1 && regionOfLeague(ctx, t.leagueId) !== ctx.home),
  },
]

export function achievedIds(state: CareerState, catalog: Catalog): string[] {
  const summary = summarize(state)
  const ctx: AchievementContext = {
    state,
    catalog,
    titles: summary.titles,
    history: state.history,
    home: regionOf(catalog, state.player.nationality),
  }
  return ACHIEVEMENTS.filter((a) => a.check(ctx)).map((a) => a.id)
}
