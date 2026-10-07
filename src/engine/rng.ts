// Gerador de números pseudoaleatórios determinístico.
//
// A mesma semente sempre produz a mesma sequência, o que permite reproduzir
// uma carreira inteira (e qualquer bug) a partir da semente e das decisões.
// O estado é imutável: cada sorteio devolve o valor e um novo Rng.

export interface Rng {
  readonly seed: string
  readonly state: number
}

export interface Roll<T> {
  readonly rng: Rng
  readonly value: T
}

export interface WeightedOption<T> {
  readonly item: T
  readonly weight: number
}

// FNV-1a de 32 bits: transforma a semente (texto) no estado inicial.
function hashSeed(seed: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export function createRng(seed: string): Rng {
  return { seed, state: hashSeed(seed) }
}

// Mulberry32: um sorteio no intervalo [0, 1).
export function next(rng: Rng): Roll<number> {
  const state = (rng.state + 0x6d2b79f5) >>> 0
  let t = state
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296
  return { rng: { seed: rng.seed, state }, value }
}

// Número real no intervalo [min, max).
export function float(rng: Rng, min: number, max: number): Roll<number> {
  const roll = next(rng)
  return { rng: roll.rng, value: min + roll.value * (max - min) }
}

// Número inteiro no intervalo [min, max], incluindo os dois extremos.
export function int(rng: Rng, min: number, max: number): Roll<number> {
  const roll = next(rng)
  return { rng: roll.rng, value: min + Math.floor(roll.value * (max - min + 1)) }
}

// true com a probabilidade informada (0 a 1).
export function chance(rng: Rng, probability: number): Roll<boolean> {
  const roll = next(rng)
  return { rng: roll.rng, value: roll.value < probability }
}

export function pick<T>(rng: Rng, items: readonly T[]): Roll<T> {
  if (items.length === 0) throw new Error('Cannot pick from an empty list.')
  const roll = int(rng, 0, items.length - 1)
  return { rng: roll.rng, value: items[roll.value] }
}

// Sorteio ponderado: um peso 3 sai três vezes mais que um peso 1.
export function pickWeighted<T>(rng: Rng, options: readonly WeightedOption<T>[]): Roll<T> {
  const total = options.reduce((sum, option) => sum + Math.max(0, option.weight), 0)
  if (total <= 0) throw new Error('Cannot pick from empty or zero-weight options.')
  const roll = float(rng, 0, total)
  let accumulated = 0
  for (const option of options) {
    accumulated += Math.max(0, option.weight)
    if (roll.value < accumulated) return { rng: roll.rng, value: option.item }
  }
  // Só por segurança contra arredondamento: devolve a última opção com peso.
  const last = options.filter((option) => option.weight > 0).at(-1)!
  return { rng: roll.rng, value: last.item }
}
