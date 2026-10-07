// Estatísticas por jogo (abates, mortes, assistências) conforme a rota,
// o resultado e a diferença de nível para o adversário.

import { next, type Rng, type Roll } from './rng.ts'
import type { PlayedGame } from './league.ts'
import type { GameStats, Role } from './types.ts'

// Médias por jogo de cada rota num jogo "neutro".
const ROLE_BASE: Record<Role, { kills: number; deaths: number; assists: number }> = {
  top: { kills: 2.6, deaths: 2.6, assists: 4.6 },
  jungle: { kills: 3.0, deaths: 2.6, assists: 6.6 },
  mid: { kills: 3.8, deaths: 2.3, assists: 5.6 },
  adc: { kills: 4.5, deaths: 2.2, assists: 5.0 },
  support: { kills: 0.8, deaths: 2.9, assists: 9.2 },
}

// Sorteio de Poisson (método de Knuth): bom para contagens pequenas.
function poisson(rng: Rng, mean: number): Roll<number> {
  const limit = Math.exp(-mean)
  let product = 1
  let count = -1
  let current = rng
  do {
    const roll = next(current)
    current = roll.rng
    product *= roll.value
    count += 1
  } while (product > limit && count < 50)
  return { rng: current, value: count }
}

export const EMPTY_STATS: GameStats = { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0 }

export function addStats(a: GameStats, b: GameStats): GameStats {
  return {
    games: a.games + b.games,
    wins: a.wins + b.wins,
    kills: a.kills + b.kills,
    deaths: a.deaths + b.deaths,
    assists: a.assists + b.assists,
  }
}

export function kda(stats: GameStats): number {
  return (stats.kills + stats.assists) / Math.max(1, stats.deaths)
}

export function generateStats(rng: Rng, role: Role, playerOvr: number, games: readonly PlayedGame[]): Roll<GameStats> {
  let current = rng
  let stats: GameStats = EMPTY_STATS
  const base = ROLE_BASE[role]
  for (const game of games) {
    const skill = Math.max(0.6, Math.min(1.5, 1 + (playerOvr - game.opponentRating) / 40))
    const result = game.won ? { k: 1.35, d: 0.6, a: 1.3 } : { k: 0.65, d: 1.45, a: 0.7 }
    const kills = poisson(current, base.kills * result.k * skill)
    const deaths = poisson(kills.rng, (base.deaths * result.d) / skill)
    const assists = poisson(deaths.rng, base.assists * result.a * skill)
    current = assists.rng
    stats = addStats(stats, {
      games: 1,
      wins: game.won ? 1 : 0,
      kills: kills.value,
      deaths: deaths.value,
      assists: assists.value,
    })
  }
  return { rng: current, value: stats }
}
