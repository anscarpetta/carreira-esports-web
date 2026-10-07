// Força e partidas. Usa a mesma ideia do Elo do Global Power Rankings:
// 1 ponto de OVR equivale a 20 pontos de Elo, então 20 pontos de OVR
// de diferença deixam o mais fraco com ~9% de chance por jogo.

import { chance, type Rng, type Roll } from './rng.ts'

export const ELO_PER_OVR = 20

export function winProbability(ratingA: number, ratingB: number): number {
  return 1 / (1 + 10 ** ((-(ratingA - ratingB) * ELO_PER_OVR) / 400))
}

export interface SeriesResult {
  readonly winsA: number
  readonly winsB: number
  readonly aWon: boolean
}

// Série "melhor de N" entre A e B.
export function playSeries(rng: Rng, ratingA: number, ratingB: number, bestOf: number): Roll<SeriesResult> {
  const needed = Math.floor(bestOf / 2) + 1
  const p = winProbability(ratingA, ratingB)
  let current = rng
  let winsA = 0
  let winsB = 0
  while (winsA < needed && winsB < needed) {
    const game = chance(current, p)
    current = game.rng
    if (game.value) winsA += 1
    else winsB += 1
  }
  return { rng: current, value: { winsA, winsB, aWon: winsA > winsB } }
}

// Peso do jogador na força do time: ele é 1 de 5.
export const PLAYER_WEIGHT = 0.2

export function teamRatingWithPlayer(teamRating: number, playerOvr: number): number {
  return teamRating + PLAYER_WEIGHT * (playerOvr - teamRating)
}
