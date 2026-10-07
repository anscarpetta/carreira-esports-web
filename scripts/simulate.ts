// Simulação em massa: roda milhares de carreiras com escolhas automáticas e
// mostra a distribuição de resultados, para calibrar o motor.
//
// Uso: node scripts/simulate.ts [quantidade] [modo]

import { CATALOG } from '../src/data/catalog.ts'
import { createCareer, decide } from '../src/engine/career.ts'
import type { SimulationMode } from '../src/engine/modes.ts'
import { createRng, int, pick, type Rng } from '../src/engine/rng.ts'
import { summarize } from '../src/engine/summary.ts'
import type { CareerState, DecisionOption, Role, SquadRole } from '../src/engine/types.ts'

const ROLE_SCORE: Record<SquadRole, number> = { bench: 0, reserve: 1, starter: 2 }

// Política automática: prefere ser titular; entre papéis iguais, o time mais forte.
// Em eventos, escolhe ao acaso.
function choose(state: CareerState, rng: Rng): { rng: Rng; optionId: string } {
  const decision = state.decision!
  const options = decision.options
  if (decision.kind === 'event') {
    const roll = pick(rng, options)
    return { rng: roll.rng, optionId: roll.value.id }
  }
  const scored = options
    .filter((o): o is Extract<DecisionOption, { teamId: string }> => 'teamId' in o)
    .map((o) => ({
      o,
      score: ROLE_SCORE[o.expectedRole] * 100 + state.teams[o.teamId].rating + (o.type === 'stay' ? 0.5 : 0),
    }))
    .sort((a, b) => b.score - a.score)
  if (scored.length === 0) return { rng, optionId: options[0].id }
  return { rng, optionId: scored[0].o.id }
}

export type Outcome = 'never' | 'solid' | 'star' | 'legend'

export function classify(state: CareerState): Outcome {
  const s = summarize(state)
  const titles = s.titles.length
  if (s.peakOvr >= 86 || titles >= 8) return 'legend'
  if (s.peakOvr >= 81 || titles >= 4) return 'star'
  if (s.starterSplits >= 6) return 'solid'
  return 'never'
}

const ROLES: readonly Role[] = ['top', 'jungle', 'mid', 'adc', 'support']

export function runCareer(seed: string, mode: SimulationMode): CareerState {
  let rng = createRng(`policy-${seed}`)
  const role = int(rng, 0, ROLES.length - 1)
  rng = role.rng
  let state = createCareer({ seed, mode, nick: 'Sim', role: ROLES[role.value], nationality: 'BR' }, CATALOG)
  let guard = 0
  while (state.phase === 'career' && guard < 200) {
    const choice = choose(state, rng)
    rng = choice.rng
    state = decide(state, choice.optionId, CATALOG)
    guard += 1
  }
  return state
}

function main(): void {
  const count = Number(process.argv[2] ?? 2000)
  const mode = (process.argv[3] ?? 'normal') as SimulationMode
  const outcomes: Record<Outcome, number> = { never: 0, solid: 0, star: 0, legend: 0 }
  let totalAge = 0
  let totalTitles = 0
  let totalSplits = 0
  let totalDecisions = 0
  const peaks: number[] = []
  const reasons: Record<string, number> = {}
  const championTeams: Record<string, number> = {}

  for (let i = 0; i < count; i += 1) {
    const state = runCareer(`sim-${i}`, mode)
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
  }

  const pct = (n: number) => `${((100 * n) / count).toFixed(1)}%`
  peaks.sort((a, b) => a - b)
  console.log(`Carreiras: ${count} (modo ${mode})`)
  console.log(`Resultados: nunca firmou ${pct(outcomes.never)} · sólido ${pct(outcomes.solid)} · craque ${pct(outcomes.star)} · lenda ${pct(outcomes.legend)}`)
  console.log(`Idade média de aposentadoria: ${(totalAge / count).toFixed(1)}`)
  console.log(`Splits por carreira: ${(totalSplits / count).toFixed(1)} · decisões: ${(totalDecisions / count).toFixed(1)}`)
  console.log(`Títulos por carreira: ${(totalTitles / count).toFixed(2)}`)
  console.log(`OVR máximo: p10 ${peaks[Math.floor(count * 0.1)]} · mediana ${peaks[Math.floor(count / 2)]} · p90 ${peaks[Math.floor(count * 0.9)]} · máx ${peaks.at(-1)}`)
  console.log(`Motivo do fim: ${Object.entries(reasons).map(([k, v]) => `${k} ${pct(v)}`).join(' · ')}`)
  console.log(`Títulos por time: ${Object.entries(championTeams).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}`)
}

if (import.meta.url === `file://${process.argv[1]}`) main()
