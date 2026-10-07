// Torneios internacionais: First Stand (depois do split 1), MSI (depois do split 2)
// e Worlds (depois do split 3). As vagas seguem as regras de 2026 por região.

import { float, type Rng } from './rng.ts'
import { playSeries } from './strength.ts'
import type { PlayedGame, PlayerTeamInput } from './league.ts'
import type { Catalog, SplitIndex, TeamState } from './types.ts'

export type InternationalId = 'first_stand' | 'msi' | 'worlds'

export interface InternationalDef {
  readonly id: InternationalId
  readonly name: string
  readonly afterSplit: SplitIndex
  // Vagas por região.
  readonly slots: Readonly<Record<string, number>>
  readonly format: 'groups' | 'swiss'
}

export const INTERNATIONALS: readonly InternationalDef[] = [
  { id: 'first_stand', name: 'First Stand', afterSplit: 0, slots: { KR: 1, CN: 1, EU: 1, NA: 1, BR: 1 }, format: 'groups' },
  { id: 'msi', name: 'MSI', afterSplit: 1, slots: { KR: 2, CN: 2, EU: 2, NA: 2, BR: 1 }, format: 'groups' },
  { id: 'worlds', name: 'Worlds', afterSplit: 2, slots: { KR: 4, CN: 4, EU: 4, NA: 3, BR: 1 }, format: 'swiss' },
]

export function internationalAfter(splitIndex: SplitIndex): InternationalDef | null {
  return INTERNATIONALS.find((event) => event.afterSplit === splitIndex) ?? null
}

// Classificados: na liga do jogador, pela colocação real do split; nas outras, pela força
// (com um pouco de sorte), já que só a liga do jogador é simulada jogo a jogo.
export function qualifiers(
  rng: Rng,
  event: InternationalDef,
  teams: Readonly<Record<string, TeamState>>,
  catalog: Catalog,
  playerLeagueId: string | null,
  playerLeaguePlacements: Readonly<Record<string, number>>,
): { rng: Rng; teamIds: string[] } {
  let r = rng
  const chosen: string[] = []
  const tier1 = Object.values(catalog.leagues)
    .filter((league) => league.tier === 1)
    .sort((a, b) => a.id.localeCompare(b.id))
  for (const league of tier1) {
    const spots = event.slots[league.region] ?? 0
    if (spots === 0) continue
    const members = Object.values(teams)
      .filter((team) => team.leagueId === league.id)
      .sort((a, b) => a.id.localeCompare(b.id))
    let ranked: TeamState[]
    if (league.id === playerLeagueId) {
      ranked = [...members].sort((a, b) => (playerLeaguePlacements[a.id] ?? 99) - (playerLeaguePlacements[b.id] ?? 99))
    } else {
      const scored = members.map((team) => {
        const noise = float(r, -2, 2)
        r = noise.rng
        return { team, score: team.rating + noise.value }
      })
      ranked = scored.sort((a, b) => b.score - a.score).map((s) => s.team)
    }
    chosen.push(...ranked.slice(0, spots).map((team) => team.id))
  }
  return { rng: r, teamIds: chosen }
}

export interface InternationalResult {
  readonly rng: Rng
  readonly championId: string
  readonly runnerUpId: string
  // Colocação final (1 = campeão; empates por fase usam o melhor lugar da fase).
  readonly placements: Readonly<Record<string, number>>
  readonly playerGames: readonly PlayedGame[]
  readonly playerInFinal: boolean
}

interface Entrant {
  readonly id: string
  readonly rating: number
}

export function simulateInternational(
  rng: Rng,
  event: InternationalDef,
  entrants: readonly Entrant[],
  player: PlayerTeamInput | null,
): InternationalResult {
  let r = rng
  const playerGames: PlayedGame[] = []
  let playerInFinal = false

  function series(a: Entrant, b: Entrant, bestOf: number, stage: PlayedGame['stage']): Entrant {
    let ratingA = a.rating
    let ratingB = b.rating
    const playerSide = player && (a.id === player.teamId || b.id === player.teamId)
    let plays = false
    if (playerSide) {
      const roll = float(r, 0, 1)
      r = roll.rng
      plays = roll.value < player.playChance
      const rating = plays ? player.ratingWithPlayer : player.ratingWithoutPlayer
      if (a.id === player.teamId) ratingA = rating
      else ratingB = rating
      if (stage === 'final' && plays) playerInFinal = true
    }
    const result = playSeries(r, ratingA, ratingB, bestOf)
    r = result.rng
    const { winsA, winsB, aWon } = result.value
    if (playerSide && plays) {
      const teamIsA = a.id === player.teamId
      const opponentRating = teamIsA ? ratingB : ratingA
      const wins = teamIsA ? winsA : winsB
      const losses = teamIsA ? winsB : winsA
      for (let i = 0; i < wins; i += 1) playerGames.push({ won: true, opponentRating, stage })
      for (let i = 0; i < losses; i += 1) playerGames.push({ won: false, opponentRating, stage })
    }
    return aWon ? a : b
  }

  const placements: Record<string, number> = {}
  let bracket: Entrant[]

  if (event.format === 'groups') {
    // Todos contra todos (MD3); os 4 melhores (ou 2, se houver poucos times) vão ao mata-mata.
    const wins: Record<string, number> = Object.fromEntries(entrants.map((e) => [e.id, 0]))
    for (let i = 0; i < entrants.length; i += 1) {
      for (let j = i + 1; j < entrants.length; j += 1) {
        const winner = series(entrants[i], entrants[j], 3, 'regular')
        wins[winner.id] += 1
      }
    }
    const order = [...entrants].sort((a, b) => wins[b.id] - wins[a.id] || b.rating - a.rating)
    const cut = entrants.length >= 8 ? 4 : 2
    order.slice(cut).forEach((team, index) => {
      placements[team.id] = cut + 1 + index
    })
    bracket = order.slice(0, cut)
  } else {
    // Fase suíça: 3 vitórias classificam, 3 derrotas eliminam.
    const record: Record<string, { w: number; l: number }> = Object.fromEntries(
      entrants.map((e) => [e.id, { w: 0, l: 0 }]),
    )
    const alive = () => entrants.filter((e) => record[e.id].w < 3 && record[e.id].l < 3)
    let round = 0
    while (alive().length > 1 && round < 10) {
      round += 1
      const groups = new Map<string, Entrant[]>()
      for (const team of alive()) {
        const key = `${record[team.id].w}-${record[team.id].l}`
        groups.set(key, [...(groups.get(key) ?? []), team])
      }
      for (const group of groups.values()) {
        // Embaralha o grupo para sortear os confrontos.
        const shuffled = group
          .map((team) => {
            const roll = float(r, 0, 1)
            r = roll.rng
            return { team, key: roll.value }
          })
          .sort((a, b) => a.key - b.key)
          .map((x) => x.team)
        for (let i = 0; i + 1 < shuffled.length; i += 2) {
          const a = shuffled[i]
          const b = shuffled[i + 1]
          const winner = series(a, b, 3, 'regular')
          const loser = winner.id === a.id ? b : a
          record[winner.id] = { ...record[winner.id], w: record[winner.id].w + 1 }
          record[loser.id] = { ...record[loser.id], l: record[loser.id].l + 1 }
        }
      }
    }
    const advanced = entrants
      .filter((e) => record[e.id].w >= 3)
      .sort((a, b) => record[a.id].l - record[b.id].l || b.rating - a.rating)
    const out = entrants
      .filter((e) => record[e.id].w < 3)
      .sort((a, b) => record[b.id].w - record[a.id].w || b.rating - a.rating)
    // Se a fase suíça não fechar exatamente 8, completa com os melhores eliminados.
    while (advanced.length < 8 && out.length > 0) advanced.push(out.shift()!)
    out.forEach((team, index) => {
      placements[team.id] = 9 + index
    })
    bracket = advanced.slice(0, 8)
  }

  // Mata-mata em MD5: o 1º enfrenta o último, e assim por diante.
  let round = bracket
  while (round.length > 2) {
    const next: Entrant[] = []
    const half = round.length / 2
    const losers: Entrant[] = []
    for (let i = 0; i < half; i += 1) {
      const a = round[i]
      const b = round[round.length - 1 - i]
      const winner = series(a, b, 5, 'semifinal')
      next.push(winner)
      losers.push(winner.id === a.id ? b : a)
    }
    losers.forEach((team) => {
      placements[team.id] = round.length / 2 + 1
    })
    round = next
  }
  const champion = series(round[0], round[1], 5, 'final')
  const runnerUp = champion.id === round[0].id ? round[1] : round[0]
  placements[champion.id] = 1
  placements[runnerUp.id] = 2

  return { rng: r, championId: champion.id, runnerUpId: runnerUp.id, placements, playerGames, playerInFinal }
}

// Texto da campanha: "Campeão", "Final", "Semifinal", "Quartas", "Fase suíça"…
export function stageReached(event: InternationalDef, placement: number): string {
  if (placement === 1) return 'Campeão'
  if (placement === 2) return 'Vice'
  if (placement <= 4) return 'Semifinal'
  if (placement <= 8) return event.format === 'swiss' ? 'Quartas de final' : 'Fase de grupos'
  return event.format === 'swiss' ? 'Fase suíça' : 'Fase de grupos'
}
