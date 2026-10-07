// Jogador: criação, evolução por idade, papel no time e valor de mercado.
//
// Não existe teto oculto (out/2026): o caminho é definido pelo OVR. Ele sobe sozinho até os 22,
// com sorte (e explosões), fica estável até os 26 e cai a partir dos 27. Depois disso, só os
// ganhos dos eventos (as apostas) fazem o jogador subir.

import { chance, float, int, pickWeighted, type Rng, type Roll } from './rng.ts'
import type { Player, Role, SquadRole } from './types.ts'

export const START_AGE = 16
export const MAX_AGE = 35

// OVR aos 16 (antes da vantagem da região). Calibrado pela simulação em massa
// (scripts/simulate.ts) para chegar perto de 30% / 40% / 25% / 5% no Brasil.
const START_OVR: readonly [number, number] = [50, 58]

// Vantagem inicial: na Coreia e na China o talento chega mais pronto, e a liga de entrada
// (LCK CL, LDL, EMEA Masters…) é bem mais forte que a Qualificatória Aberta do Brasil.
export const REGION_HEADSTART: Readonly<Record<string, number>> = { KR: 17, CN: 16, EU: 9, NA: 3, PAC: 2 }

// Quem chega mais pronto cresce um pouco menos depois: o coreano e o chinês já foram
// lapidados no sistema de trainees. Multiplica a subida natural (não a explosão).
export const REGION_GROWTH: Readonly<Record<string, number>> = { KR: 0.6, CN: 0.6, EU: 0.8 }

export interface NewPlayerInput {
  readonly nick: string
  readonly role: Role
  readonly nationality: string
  readonly startYear: number
  // Região de origem (para a vantagem inicial).
  readonly region?: string
}

export function createPlayer(rng: Rng, input: NewPlayerInput): Roll<Player> {
  const base = int(rng, START_OVR[0], START_OVR[1])
  const ovr = base.value + (REGION_HEADSTART[input.region ?? ''] ?? 0)
  const player: Player = {
    nick: input.nick,
    role: input.role,
    nationality: input.nationality,
    birthYear: input.startYear - START_AGE,
    ovr,
    marketValue: marketValue(ovr, START_AGE),
  }
  return { rng: base.rng, value: player }
}

export function ageIn(player: Player, year: number): number {
  return year - player.birthYear
}

// Subida natural por split, conforme a idade: sorteio de 0 a N (pesos) e, para o jovem titular,
// chance de explosão (+4 ou +5 no split).
const GROWTH: readonly { maxAge: number; steps: readonly number[]; breakout: number }[] = [
  // pesos de 0, 1, 2, 3
  { maxAge: 18, steps: [22, 55, 19, 4], breakout: 0.04 },
  { maxAge: 20, steps: [40, 50, 10], breakout: 0.025 },
  { maxAge: 22, steps: [60, 40], breakout: 0 },
]

// Queda anual (mín, máx) a partir dos 27; dividida pelos 3 splits.
const DECLINE: Record<number, readonly [number, number]> = { 27: [-3, -1], 28: [-4, -1], 29: [-4, -2] }
const LATE_DECLINE: readonly [number, number] = [-5, -2]
export const DECLINE_AGE = 27

// Minutos importam: jovem titular (até no academy) evolui mais; quem não joga, menos.
function minutesFactor(age: number, squad: SquadRole | 'out'): number {
  if (age < 20) return squad === 'starter' ? 1.25 : squad === 'reserve' ? 1 : squad === 'bench' ? 0.7 : 0.6
  return squad === 'starter' ? 1 : squad === 'reserve' ? 0.6 : squad === 'bench' ? 0.5 : 0.4
}

export interface SplitDevelopment {
  readonly delta: number
  readonly breakout: boolean
}

export function rollSplitDevelopment(
  rng: Rng,
  _player: Player,
  age: number,
  squad: SquadRole | 'out',
  region?: string,
): Roll<SplitDevelopment> {
  let r = rng
  // Dos 23 aos 26: estável.
  if (age > 22 && age < DECLINE_AGE) return { rng: r, value: { delta: 0, breakout: false } }

  // A partir dos 27: queda.
  if (age >= DECLINE_AGE) {
    const [min, max] = DECLINE[age] ?? LATE_DECLINE
    const fall = float(r, min / 3, max / 3)
    r = fall.rng
    const whole = Math.floor(fall.value)
    const fraction = chance(r, fall.value - whole)
    return { rng: fraction.rng, value: { delta: whole + (fraction.value ? 1 : 0), breakout: false } }
  }

  const band = GROWTH.find((g) => age <= g.maxAge)!
  // Jovem titular pode explodir: +4 ou +5 no split.
  if (squad === 'starter' && band.breakout > 0) {
    const explodes = chance(r, band.breakout)
    r = explodes.rng
    if (explodes.value) {
      const jump = int(r, 4, 5)
      return { rng: jump.rng, value: { delta: jump.value, breakout: true } }
    }
  }
  const step = pickWeighted(r, band.steps.map((weight, value) => ({ item: value, weight })))
  r = step.rng
  // Os minutos ajustam a subida, com arredondamento sorteado (1,25 vira 1 ou 2).
  const value = step.value * minutesFactor(age, squad) * (REGION_GROWTH[region ?? ''] ?? 1)
  const whole = Math.floor(value)
  const fraction = chance(r, value - whole)
  return { rng: fraction.rng, value: { delta: whole + (fraction.value ? 1 : 0), breakout: false } }
}

export function applyDevelopment(player: Player, delta: number): Player {
  return { ...player, ovr: Math.max(40, Math.min(99, player.ovr + delta)) }
}

// Papel no time: compara o OVR do jogador com a força do time.
export function squadRoleFor(playerOvr: number, teamRating: number): SquadRole {
  const diff = playerOvr - teamRating
  if (diff >= -2) return 'starter'
  if (diff >= -6) return 'reserve'
  return 'bench'
}

const ROLE_ORDER: readonly SquadRole[] = ['bench', 'reserve', 'starter']

export function shiftRole(role: SquadRole, shift: number): SquadRole {
  const index = ROLE_ORDER.indexOf(role) + shift
  return ROLE_ORDER[Math.max(0, Math.min(ROLE_ORDER.length - 1, index))]
}

// Chance de estar escalado em cada série, conforme o papel.
export const PLAY_CHANCE: Record<SquadRole, number> = {
  starter: 0.97,
  reserve: 0.25,
  bench: 0.05,
}

// Valor de mercado em reais: curva por OVR e fator de idade.
const VALUE_CURVE: readonly (readonly [number, number])[] = [
  [40, 2_000],
  [50, 8_000],
  [60, 30_000],
  [65, 80_000],
  [70, 200_000],
  [75, 500_000],
  [80, 1_200_000],
  [84, 2_500_000],
  [88, 5_000_000],
  [92, 10_000_000],
  [96, 20_000_000],
  [99, 30_000_000],
]

function ageFactor(age: number): number {
  if (age <= 18) return 1.3
  if (age <= 21) return 1.2
  if (age <= 24) return 1
  if (age <= 26) return 0.85
  if (age <= 28) return 0.65
  return 0.45
}

function roundValue(value: number): number {
  if (value >= 1_000_000) return Math.round(value / 100_000) * 100_000
  if (value >= 100_000) return Math.round(value / 10_000) * 10_000
  return Math.round(value / 1_000) * 1_000
}

export function marketValue(ovr: number, age: number): number {
  const clamped = Math.max(40, Math.min(99, ovr))
  let i = 0
  while (i < VALUE_CURVE.length - 2 && VALUE_CURVE[i + 1][0] < clamped) i += 1
  const [x0, y0] = VALUE_CURVE[i]
  const [x1, y1] = VALUE_CURVE[i + 1]
  const t = (clamped - x0) / (x1 - x0)
  // Interpolação geométrica: o valor cresce de forma exponencial com o OVR.
  const value = y0 * (y1 / y0) ** t
  return roundValue(value * ageFactor(age))
}

export function marketValueWithNoise(rng: Rng, ovr: number, age: number): Roll<number> {
  const noise = float(rng, 0.95, 1.05)
  return { rng: noise.rng, value: roundValue(marketValue(ovr, age) * noise.value) }
}
