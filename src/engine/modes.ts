// Modos de simulação: quantos splits passam a cada decisão do jogador.
// O ano competitivo tem 3 splits em todas as regiões (ver docs/design-sistemas.md).

export const SPLITS_PER_YEAR = 3

export type SimulationMode = 'intense' | 'normal' | 'express'

export const SIMULATION_MODES: readonly SimulationMode[] = ['intense', 'normal', 'express']

export const DEFAULT_MODE: SimulationMode = 'normal'

export const SPLITS_PER_DECISION: Record<SimulationMode, number> = {
  intense: 1,
  normal: SPLITS_PER_YEAR,
  express: SPLITS_PER_YEAR * 2,
}
