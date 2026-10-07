// Resumo da carreira: totais, títulos, prêmios e trajetória por time.

import { addStats, EMPTY_STATS } from './stats.ts'
import type { Award, CareerState, GameStats, Title } from './types.ts'

export interface TeamSpell {
  readonly teamId: string
  readonly from: { readonly year: number; readonly splitIndex: number }
  readonly to: { readonly year: number; readonly splitIndex: number }
  readonly splits: number
  readonly stats: GameStats
  readonly titles: number
}

export interface CareerSummary {
  readonly totals: GameStats
  readonly titles: readonly Title[]
  readonly awards: readonly Award[]
  readonly spells: readonly TeamSpell[]
  readonly peakOvr: number
  readonly peakMarketValue: number
  readonly splitsPlayed: number
  readonly starterSplits: number
  readonly firstYear: number | null
  readonly lastYear: number | null
}

export function summarize(state: CareerState): CareerSummary {
  let totals = EMPTY_STATS
  const titles: Title[] = []
  const awards: Award[] = []
  const spells: TeamSpell[] = []
  let peakOvr = state.player.ovr
  let peakMarketValue = state.player.marketValue
  let starterSplits = 0

  for (const record of state.history) {
    totals = addStats(totals, record.stats)
    titles.push(...record.titles)
    awards.push(...record.awards)
    peakOvr = Math.max(peakOvr, record.ovr, record.ovrAfter)
    peakMarketValue = Math.max(peakMarketValue, record.marketValue)
    if (record.squadRole === 'starter') starterSplits += 1
    if (!record.teamId) continue
    const last = spells.at(-1)
    const at = { year: record.year, splitIndex: record.splitIndex }
    if (last && last.teamId === record.teamId) {
      spells[spells.length - 1] = {
        ...last,
        to: at,
        splits: last.splits + 1,
        stats: addStats(last.stats, record.stats),
        titles: last.titles + record.titles.length,
      }
    } else {
      spells.push({ teamId: record.teamId, from: at, to: at, splits: 1, stats: record.stats, titles: record.titles.length })
    }
  }

  return {
    totals,
    titles,
    awards,
    spells,
    peakOvr,
    peakMarketValue,
    splitsPlayed: state.history.length,
    starterSplits,
    firstYear: state.history[0]?.year ?? null,
    lastYear: state.history.at(-1)?.year ?? null,
  }
}
