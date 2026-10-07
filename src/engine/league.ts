// Simulação de um split de liga: fase de pontos (todos contra todos) e
// playoffs com os 4 melhores (semifinais e final).

import { chance, type Rng } from './rng.ts'
import { playSeries } from './strength.ts'
import type { LeagueData } from './types.ts'

export interface SplitTeam {
  readonly id: string
  readonly rating: number
}

// Como o time do jogador entra no split.
export interface PlayerTeamInput {
  readonly teamId: string
  // Força do time com o jogador em quadra e sem ele.
  readonly ratingWithPlayer: number
  readonly ratingWithoutPlayer: number
  // Chance de o jogador estar escalado em cada série.
  readonly playChance: number
  readonly titleOverride: 'force' | 'skip' | null
}

export interface PlayedGame {
  readonly won: boolean
  readonly opponentRating: number
  readonly stage: 'regular' | 'semifinal' | 'final'
}

export interface Standing {
  readonly teamId: string
  readonly seriesWins: number
  readonly seriesLosses: number
  readonly gameDiff: number
}

export interface SplitResult {
  readonly rng: Rng
  readonly standings: readonly Standing[]
  readonly championId: string
  readonly runnerUpId: string
  // Colocação final de cada time (1 = campeão).
  readonly placements: Readonly<Record<string, number>>
  // Jogos que o jogador disputou.
  readonly playerGames: readonly PlayedGame[]
  // Jogos que o time do jogador disputou (com ou sem ele).
  readonly playerTeamGames: number
  readonly playerTeamWins: number
  readonly playerInFinal: boolean
}

interface Tally {
  seriesWins: number
  seriesLosses: number
  gameDiff: number
}

export function simulateSplit(
  rng: Rng,
  league: LeagueData,
  teams: readonly SplitTeam[],
  player: PlayerTeamInput | null,
): SplitResult {
  let r = rng
  const tally: Record<string, Tally> = Object.fromEntries(
    teams.map((team) => [team.id, { seriesWins: 0, seriesLosses: 0, gameDiff: 0 }]),
  )
  const playerGames: PlayedGame[] = []
  let playerTeamGames = 0
  let playerTeamWins = 0
  let playerInFinal = false

  // Decide a força de cada lado na série e registra os jogos do jogador.
  function series(
    a: SplitTeam,
    b: SplitTeam,
    bestOf: number,
    stage: PlayedGame['stage'],
  ): { aWon: boolean; winsA: number; winsB: number } {
    let ratingA = a.rating
    let ratingB = b.rating
    let playerSide: 'a' | 'b' | null = null
    if (player && (a.id === player.teamId || b.id === player.teamId)) {
      const plays = chance(r, player.playChance)
      r = plays.rng
      const rating = plays.value ? player.ratingWithPlayer : player.ratingWithoutPlayer
      if (a.id === player.teamId) ratingA = rating
      else ratingB = rating
      if (plays.value) playerSide = a.id === player.teamId ? 'a' : 'b'
      if (stage === 'final' && plays.value) playerInFinal = true
    }
    const result = playSeries(r, ratingA, ratingB, bestOf)
    r = result.rng
    const { winsA, winsB, aWon } = result.value

    if (player && (a.id === player.teamId || b.id === player.teamId)) {
      const teamIsA = a.id === player.teamId
      const teamWins = teamIsA ? winsA : winsB
      const teamLosses = teamIsA ? winsB : winsA
      playerTeamGames += teamWins + teamLosses
      playerTeamWins += teamWins
      if (playerSide) {
        const opponentRating = teamIsA ? ratingB : ratingA
        for (let i = 0; i < teamWins; i += 1) playerGames.push({ won: true, opponentRating, stage })
        for (let i = 0; i < teamLosses; i += 1) playerGames.push({ won: false, opponentRating, stage })
      }
    }
    return { aWon, winsA, winsB }
  }

  // Fase de pontos: todos contra todos, uma vez.
  for (let i = 0; i < teams.length; i += 1) {
    for (let j = i + 1; j < teams.length; j += 1) {
      const a = teams[i]
      const b = teams[j]
      const { aWon, winsA, winsB } = series(a, b, league.format.regularBestOf, 'regular')
      tally[aWon ? a.id : b.id].seriesWins += 1
      tally[aWon ? b.id : a.id].seriesLosses += 1
      tally[a.id].gameDiff += winsA - winsB
      tally[b.id].gameDiff += winsB - winsA
    }
  }

  const standings: Standing[] = teams
    .map((team) => ({ teamId: team.id, ...tally[team.id] }))
    .sort((x, y) => y.seriesWins - x.seriesWins || y.gameDiff - x.gameDiff || x.teamId.localeCompare(y.teamId))

  const byId = Object.fromEntries(teams.map((team) => [team.id, team]))
  const seeds = standings.slice(0, league.format.playoffTeams).map((s) => byId[s.teamId])

  // Playoffs: 1º x 4º e 2º x 3º, depois a final.
  const semi1 = series(seeds[0], seeds[3], league.format.playoffBestOf, 'semifinal').aWon
  const semi2 = series(seeds[1], seeds[2], league.format.playoffBestOf, 'semifinal').aWon
  const finalistA = semi1 ? seeds[0] : seeds[3]
  const finalistB = semi2 ? seeds[1] : seeds[2]
  const semiLosers = [semi1 ? seeds[3] : seeds[0], semi2 ? seeds[2] : seeds[1]]
  const aWonFinal = series(finalistA, finalistB, league.format.playoffBestOf, 'final').aWon
  let championId = aWonFinal ? finalistA.id : finalistB.id
  let runnerUpId = aWonFinal ? finalistB.id : finalistA.id

  // Eventos de clímax (call do Barão, jogar com dor) podem decidir o título.
  if (player?.titleOverride === 'force' && championId !== player.teamId) {
    runnerUpId = championId
    championId = player.teamId
    playerInFinal = true
  } else if (player?.titleOverride === 'skip' && championId === player.teamId) {
    championId = runnerUpId
    runnerUpId = player.teamId
  }

  const placements: Record<string, number> = { [championId]: 1, [runnerUpId]: 2 }
  let place = 3
  const semiOrder = standings.map((s) => s.teamId).filter((id) => semiLosers.some((t) => t.id === id))
  for (const id of [...semiOrder, ...standings.map((s) => s.teamId)]) {
    if (placements[id] === undefined) {
      placements[id] = place
      place += 1
    }
  }

  return {
    rng: r,
    standings,
    championId,
    runnerUpId,
    placements,
    playerGames,
    playerTeamGames,
    playerTeamWins,
    playerInFinal,
  }
}
