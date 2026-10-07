// Prêmios individuais do split: seleção do split (melhor da rota),
// MVP do split e MVP da final.

import { chance, float, type Rng, type Roll } from './rng.ts'
import type { Standing } from './league.ts'
import type { Award, LeagueData, SplitIndex } from './types.ts'

// Desempenho de um jogador rival: perto da força do time, com variação.
function noisy(rng: Rng, center: number, spread: number): Roll<number> {
  const a = float(rng, -spread, spread)
  const b = float(a.rng, -spread, spread)
  return { rng: b.rng, value: center + (a.value + b.value) / 2 }
}

export interface AwardsInput {
  readonly league: LeagueData
  readonly year: number
  readonly splitIndex: SplitIndex
  readonly ratings: Readonly<Record<string, number>>
  readonly standings: readonly Standing[]
  readonly championId: string
  readonly playerTeamId: string
  readonly playerOvr: number
  readonly playerGames: number
  readonly playerTeamGames: number
  readonly playerInFinal: boolean
}

export function computeAwards(rng: Rng, input: AwardsInput): Roll<Award[]> {
  const awards: Award[] = []
  let r = rng
  const splitName = input.league.splitNames[input.splitIndex]
  const base = { leagueId: input.league.id, year: input.year, splitIndex: input.splitIndex }

  const winRate = (teamId: string): number => {
    const s = input.standings.find((x) => x.teamId === teamId)
    if (!s) return 0.5
    return s.seriesWins / Math.max(1, s.seriesWins + s.seriesLosses)
  }

  // Só concorre quem jogou a maior parte do split.
  const regular = input.playerTeamGames > 0 && input.playerGames / input.playerTeamGames >= 0.6
  if (regular) {
    const mine = noisy(r, input.playerOvr + (winRate(input.playerTeamId) - 0.5) * 4, 2)
    r = mine.rng

    // Seleção do split: melhor da rota entre os times da liga.
    let bestRival = -Infinity
    for (const teamId of Object.keys(input.ratings).sort()) {
      if (teamId === input.playerTeamId) continue
      const rival = noisy(r, input.ratings[teamId] + (winRate(teamId) - 0.5) * 4, 3)
      r = rival.rng
      bestRival = Math.max(bestRival, rival.value)
    }
    if (mine.value > bestRival) {
      awards.push({ ...base, kind: 'all_pro', name: `Seleção do ${splitName}` })

      // MVP do split: o melhor da seleção, pesando mais a campanha do time.
      const mvpScore = mine.value + (winRate(input.playerTeamId) - 0.5) * 4
      let bestOther = -Infinity
      for (const teamId of Object.keys(input.ratings).sort()) {
        // 4 rotas dos outros times e as outras 4 rotas do próprio time.
        for (let slot = 0; slot < 4; slot += 1) {
          const rival = noisy(r, input.ratings[teamId] + (winRate(teamId) - 0.5) * 8, 3)
          r = rival.rng
          bestOther = Math.max(bestOther, rival.value)
        }
      }
      if (mvpScore > bestOther) awards.push({ ...base, kind: 'split_mvp', name: `MVP do ${splitName}` })
    }
  }

  // MVP da final: o campeão tem 5 candidatos, e o destaque do time tem mais chance.
  if (input.championId === input.playerTeamId && input.playerInFinal) {
    const teamRating = input.ratings[input.playerTeamId]
    const probability = Math.min(0.7, Math.max(0.05, 0.2 * Math.exp((input.playerOvr - teamRating) / 4)))
    const roll = chance(r, probability)
    r = roll.rng
    if (roll.value) awards.push({ ...base, kind: 'finals_mvp', name: `MVP da final do ${splitName}` })
  }

  return { rng: r, value: awards }
}
