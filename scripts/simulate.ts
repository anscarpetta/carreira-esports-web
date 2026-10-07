// Simulação em massa: roda milhares de carreiras com escolhas automáticas e
// mostra a distribuição de resultados, para calibrar o motor.
//
// Uso: node scripts/simulate.ts [quantidade] [modo] [nacionalidade]

import { CATALOG } from '../src/data/catalog.ts'
import { createCareer, decide, regionOf, retire } from '../src/engine/career.ts'
import type { SimulationMode } from '../src/engine/modes.ts'
import { regionalPotential } from '../src/engine/player.ts'
import { createRng, int, pick, type Rng } from '../src/engine/rng.ts'
import { summarize } from '../src/engine/summary.ts'
import type { CareerState, DecisionOption, Role, SquadRole } from '../src/engine/types.ts'

const ROLE_SCORE: Record<SquadRole, number> = { bench: 0, reserve: 1, starter: 2 }

// Política automática: prefere ser titular; depois o tier mais alto; depois o time mais forte.
// Em eventos, escolhe ao acaso. Sem propostas, espera um pouco e depois se aposenta.
function choose(state: CareerState, rng: Rng): { rng: Rng; optionId: string } {
  const decision = state.decision!
  const options = decision.options
  if (decision.kind === 'event') {
    const roll = pick(rng, options)
    return { rng: roll.rng, optionId: roll.value.id }
  }
  const tierOf = (teamId: string) => CATALOG.leagues[state.teams[teamId].leagueId ?? '']?.tier ?? 3
  const scored = options
    .filter((o): o is Extract<DecisionOption, { teamId: string }> => 'teamId' in o)
    .map((o) => ({
      o,
      score:
        ROLE_SCORE[o.expectedRole] * 100 +
        (4 - tierOf(o.teamId)) * 15 +
        state.teams[o.teamId].rating +
        (o.type === 'stay' ? 0.5 : 0),
    }))
    .sort((a, b) => b.score - a.score)
  const age = state.next.year - state.player.birthYear
  // Veterano sem vaga de titular à vista, ou já fora do tier 1 depois dos 30: aposenta,
  // como faria um jogador de verdade (o jogo não obriga; quem decide é o jogador).
  const best = scored[0]?.o
  const wantsOut =
    !best ||
    (age >= 28 && best.expectedRole !== 'starter') ||
    (age >= 30 && tierOf(best.teamId) >= 2) ||
    age >= 33
  const retireCard = options.find((o) => o.type === 'retire')
  if (wantsOut && retireCard) return { rng, optionId: retireCard.id }
  // Sem o card de aposentar, o jogador automático usa o botão discreto.
  if (wantsOut && age >= 30) return { rng, optionId: '__retire__' }
  if (scored.length > 0) return { rng, optionId: scored[0].o.id }
  const wait = options.find((o) => o.type === 'wait')
  if (wait && (state.paused?.splits ?? 0) < 3 && age < 27) return { rng, optionId: wait.id }
  const retire = options.find((o) => o.type === 'retire')
  return { rng, optionId: (retire ?? wait ?? options[0]).id }
}

export type Outcome = 'never' | 'solid' | 'star' | 'legend'

// "Firmou no tier 1" = pelo menos 6 splits como titular no tier 1. Títulos de tier 2/3 não contam.
export function classify(state: CareerState): Outcome {
  const s = summarize(state)
  const isTier1 = (leagueId: string | null) => leagueId !== null && CATALOG.leagues[leagueId]?.tier === 1
  const titles = s.titles.filter((t) => isTier1(t.leagueId)).length
  const tier1Starter = state.history.filter((r) => r.squadRole === 'starter' && isTier1(r.leagueId)).length
  // Os limites de OVR acompanham a profundidade de talentos da região de origem.
  const region = regionOf(CATALOG, state.player.nationality)
  if (s.peakOvr >= regionalPotential(region, 86) || titles >= 8) return 'legend'
  if ((s.peakOvr >= regionalPotential(region, 81) && tier1Starter >= 6) || titles >= 4) return 'star'
  if (tier1Starter >= 6) return 'solid'
  return 'never'
}

const ROLES: readonly Role[] = ['top', 'jungle', 'mid', 'adc', 'support']

export function runCareer(seed: string, mode: SimulationMode, nationality = 'BR'): CareerState {
  let rng = createRng(`policy-${seed}`)
  const role = int(rng, 0, ROLES.length - 1)
  rng = role.rng
  let state = createCareer({ seed, mode, nick: 'Sim', role: ROLES[role.value], nationality }, CATALOG)
  let guard = 0
  while (state.phase === 'career' && guard < 200) {
    const choice = choose(state, rng)
    rng = choice.rng
    state = choice.optionId === '__retire__' ? retire(state) : decide(state, choice.optionId, CATALOG)
    guard += 1
  }
  return state
}

function main(): void {
  const count = Number(process.argv[2] ?? 2000)
  const mode = (process.argv[3] ?? 'normal') as SimulationMode
  const nationality = process.argv[4] ?? 'BR'
  const regionsPlayed: Record<string, number> = {}
  const outcomes: Record<Outcome, number> = { never: 0, solid: 0, star: 0, legend: 0 }
  let totalAge = 0
  let totalTitles = 0
  let totalSplits = 0
  let totalDecisions = 0
  const peaks: number[] = []
  const reasons: Record<string, number> = {}
  const championTeams: Record<string, number> = {}
  const tiersPlayed: Record<string, number> = {}
  let streamers = 0
  let prodigies = 0
  let breakouts = 0

  for (let i = 0; i < count; i += 1) {
    const state = runCareer(`sim-${i}`, mode, nationality)
    const s = summarize(state)
    outcomes[classify(state)] += 1
    totalAge += state.retirement?.age ?? 0
    totalTitles += s.titles.length
    totalSplits += s.splitsPlayed
    totalDecisions += state.step
    peaks.push(s.peakOvr)
    const reason = state.retirement?.reason ?? 'none'
    reasons[reason] = (reasons[reason] ?? 0) + 1
    for (const title of s.titles) championTeams[title.teamId] = (championTeams[title.teamId] ?? 0) + 1
    const best = Math.min(...state.history.map((r) => (r.leagueId ? CATALOG.leagues[r.leagueId].tier : 9)))
    tiersPlayed[`tier ${best}`] = (tiersPlayed[`tier ${best}`] ?? 0) + 1
    if (state.history.some((r) => r.squadRole === 'paused' && !r.teamId)) streamers += 1
    // Prodígio: titular no tier 1 aos 18 anos.
    if (state.history.some((r) => r.age === 18 && r.squadRole === 'starter' && r.leagueId && CATALOG.leagues[r.leagueId].tier === 1)) prodigies += 1
    breakouts += state.history.filter((r) => r.breakout).length
    const regions = new Set(state.history.filter((r) => r.leagueId).map((r) => CATALOG.leagues[r.leagueId!].region))
    for (const region of regions) regionsPlayed[region] = (regionsPlayed[region] ?? 0) + 1
  }

  const pct = (n: number) => `${((100 * n) / count).toFixed(1)}%`
  peaks.sort((a, b) => a - b)
  console.log(`Carreiras: ${count} (modo ${mode}, nacionalidade ${nationality})`)
  console.log(`Resultados: nunca firmou ${pct(outcomes.never)} · sólido ${pct(outcomes.solid)} · craque ${pct(outcomes.star)} · lenda ${pct(outcomes.legend)}`)
  console.log(`Idade média de aposentadoria: ${(totalAge / count).toFixed(1)}`)
  console.log(`Splits por carreira: ${(totalSplits / count).toFixed(1)} · decisões: ${(totalDecisions / count).toFixed(1)}`)
  console.log(`Títulos por carreira: ${(totalTitles / count).toFixed(2)}`)
  console.log(`OVR máximo: p10 ${peaks[Math.floor(count * 0.1)]} · mediana ${peaks[Math.floor(count / 2)]} · p90 ${peaks[Math.floor(count * 0.9)]} · máx ${peaks.at(-1)}`)
  console.log(`Motivo do fim: ${Object.entries(reasons).map(([k, v]) => `${k} ${pct(v)}`).join(' · ')}`)
  console.log(`Tier mais alto alcançado: ${Object.entries(tiersPlayed).sort().map(([k, v]) => `${k} ${pct(v)}`).join(' · ')}`)
  console.log(`Carreiras com pausa (agente livre ou streamer): ${pct(streamers)}`)
  console.log(`Prodígios (titular no tier 1 aos 18): ${pct(prodigies)} · explosões por carreira: ${(breakouts / count).toFixed(2)}`)
  console.log(`Jogou em cada região: ${Object.entries(regionsPlayed).sort().map(([k, v]) => `${k} ${pct(v)}`).join(' · ')}`)
  console.log(`Títulos por time: ${Object.entries(championTeams).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}`)
}

if (import.meta.url === `file://${process.argv[1]}`) main()
