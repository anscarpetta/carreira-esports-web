// Textos e formatações usados pela interface.

import type { Trend } from '../engine/teams.ts'
import type { Role, SplitRecord, SquadRole } from '../engine/types.ts'

export const ROLE_LABEL: Record<Role, string> = {
  top: 'Top',
  jungle: 'Jungle',
  mid: 'Mid',
  adc: 'ADC',
  support: 'Suporte',
}

export const SQUAD_LABEL: Record<SplitRecord['squadRole'], string> = {
  starter: 'Titular',
  reserve: 'Reserva',
  bench: 'Banco',
  suspended: 'Suspenso',
  paused: 'Parado',
}

export const EXPECTED_ROLE_LABEL: Record<SquadRole, string> = {
  starter: 'Vaga de titular',
  reserve: 'Reserva',
  bench: 'Banco',
}

export const TREND_LABEL: Record<Trend, { arrow: string; label: string; tone: string }> = {
  up: { arrow: '↑', label: 'Em alta', tone: 'text-emerald-400' },
  rising: { arrow: '↗', label: 'Subindo', tone: 'text-emerald-300' },
  stable: { arrow: '→', label: 'Estável', tone: 'text-muted' },
  falling: { arrow: '↘', label: 'Caindo', tone: 'text-amber-300' },
  down: { arrow: '↓', label: 'Em baixa', tone: 'text-rose-400' },
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export function money(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`
  if (value >= 10_000) return `R$ ${Math.round(value / 1_000).toLocaleString('pt-BR')} mil`
  return BRL.format(value)
}

export function kdaText(kills: number, deaths: number, assists: number): string {
  const value = (kills + assists) / Math.max(1, deaths)
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

export function percent(probability: number): string {
  return `${Math.round(probability * 100)}%`
}

export function retirementText(reason: 'voluntary' | 'no_offers' | 'age'): string {
  if (reason === 'voluntary') return 'Aposentadoria por decisão própria'
  if (reason === 'no_offers') return 'Aposentadoria por falta de propostas'
  return 'Aposentadoria natural'
}
