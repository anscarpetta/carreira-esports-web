// Jogador: criação (com potencial e perfil ocultos), evolução por idade,
// papel no time e valor de mercado.

import { chance, float, int, pickWeighted, type Rng, type Roll } from './rng.ts'
import type { DevelopmentProfile, Player, Role, SquadRole } from './types.ts'

export const START_AGE = 16
export const MAX_AGE = 35

// Distribuição do potencial (teto oculto). Calibrada pela simulação em massa
// (scripts/simulate.ts) para chegar perto de 30% / 40% / 25% / 5%.
// Teto oculto. Os maiores do Brasil chegam a 81–84 no auge; 84+ é coisa de lenda.
const POTENTIAL_BANDS: readonly { item: readonly [number, number]; weight: number }[] = [
  { item: [60, 70], weight: 18 },
  { item: [71, 78], weight: 48 },
  { item: [79, 83], weight: 31 },
  { item: [84, 90], weight: 3 },
]

const PROFILES: readonly { item: DevelopmentProfile; weight: number }[] = [
  { item: 'early', weight: 15 },
  { item: 'normal', weight: 70 },
  { item: 'late', weight: 15 },
]

export interface NewPlayerInput {
  readonly nick: string
  readonly role: Role
  readonly nationality: string
  readonly startYear: number
}

export function createPlayer(rng: Rng, input: NewPlayerInput): Roll<Player> {
  const band = pickWeighted(rng, POTENTIAL_BANDS)
  const potential = int(band.rng, band.value[0], band.value[1])
  const profile = pickWeighted(potential.rng, PROFILES)
  const base = int(profile.rng, 0, 4)
  // Quem tem mais potencial costuma começar melhor (o prodígio já chama atenção aos 16).
  const ovr = 51 + Math.round((potential.value - 62) * 0.3) + base.value
  const player: Player = {
    nick: input.nick,
    role: input.role,
    nationality: input.nationality,
    birthYear: input.startYear - START_AGE,
    ovr,
    potential: potential.value,
    profile: profile.value,
    marketValue: marketValue(ovr, START_AGE),
  }
  return { rng: base.rng, value: player }
}

export function ageIn(player: Player, year: number): number {
  return year - player.birthYear
}

// Faixa de evolução anual (mín, máx) por idade e perfil.
const GROWTH: Record<DevelopmentProfile, Record<number, readonly [number, number]>> = {
  early: {
    16: [4, 9], 17: [4, 9], 18: [3, 7], 19: [1, 5], 20: [0, 3], 21: [0, 2], 22: [-1, 1],
    23: [-1, 1], 24: [-2, 0], 25: [-3, 0], 26: [-3, -1], 27: [-4, -1], 28: [-4, -2],
  },
  normal: {
    16: [2, 6], 17: [2, 7], 18: [2, 7], 19: [1, 6], 20: [1, 5], 21: [0, 3], 22: [0, 2],
    23: [-1, 2], 24: [-1, 1], 25: [-2, 1], 26: [-3, 0], 27: [-3, -1], 28: [-4, -1], 29: [-4, -2],
  },
  late: {
    16: [1, 5], 17: [1, 5], 18: [2, 6], 19: [2, 6], 20: [1, 5], 21: [1, 4], 22: [0, 3],
    23: [0, 2], 24: [0, 1], 25: [-1, 1], 26: [-2, 1], 27: [-3, 0], 28: [-3, -1], 29: [-4, -1],
  },
}

function growthRange(profile: DevelopmentProfile, age: number): readonly [number, number] {
  const table = GROWTH[profile]
  if (table[age]) return table[age]
  return age < 16 ? table[16] : [-5, -2]
}

// Evolução de um split. A faixa anual da idade é dividida pelos 3 splits, com variação, e:
// - quem está longe do potencial cresce mais rápido enquanto é jovem (a subida meteórica);
// - minutos importam: jovem titular (até no academy) evolui mais; quem não joga, menos;
// - jovem titular com espaço para crescer pode "explodir" (+2 a +5 num split);
// - o potencial é um teto.
export const BREAKOUT_CHANCE = 0.08

const GAP_FACTOR: Record<number, number> = { 16: 0.07, 17: 0.07, 18: 0.07, 19: 0.05, 20: 0.05, 21: 0.03, 22: 0.03 }

function minutesFactor(age: number, squad: SquadRole | 'out'): number {
  if (age < 20) return squad === 'starter' ? 1.25 : squad === 'reserve' ? 1 : squad === 'bench' ? 0.7 : 0.6
  return squad === 'starter' ? 1 : squad === 'reserve' ? 0.6 : squad === 'bench' ? 0.5 : 0.4
}

export interface SplitDevelopment {
  readonly delta: number
  readonly breakout: boolean
}

export function rollSplitDevelopment(rng: Rng, player: Player, age: number, squad: SquadRole | 'out'): Roll<SplitDevelopment> {
  const [min, max] = growthRange(player.profile, age)
  const base = float(rng, min / 3, max / 3)
  let r = base.rng
  const gap = Math.max(0, player.potential - player.ovr)
  let value = base.value
  if (value > 0 || gap > 0) value += (gap * (GAP_FACTOR[age] ?? 0)) / 3
  if (value > 0) value *= minutesFactor(age, squad)
  else if (squad === 'out') value -= 0.2

  // Arredondamento sorteado: 1,4 vira 1 (60%) ou 2 (40%).
  const whole = Math.floor(value)
  const fraction = chance(r, value - whole)
  r = fraction.rng
  let delta = whole + (fraction.value ? 1 : 0)

  let breakout = false
  if (age <= 21 && squad === 'starter' && gap >= 5) {
    const explodes = chance(r, BREAKOUT_CHANCE)
    r = explodes.rng
    if (explodes.value) {
      const jump = int(r, 2, 5)
      r = jump.rng
      delta += jump.value
      breakout = true
    }
  }
  if (delta > 0) delta = Math.min(delta, gap)
  return { rng: r, value: { delta: delta + 0, breakout: breakout && delta >= 2 } }
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
