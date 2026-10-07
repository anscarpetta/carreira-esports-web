// Regiões, países e a matriz de mobilidade entre regiões.
// Base: docs/pesquisa-mobilidade.md.

import type { Country, Region } from '../engine/types.ts'

export const REGIONS: readonly Region[] = [
  { id: 'BR', name: 'Brasil' },
  { id: 'KR', name: 'Coreia' },
  { id: 'CN', name: 'China' },
  { id: 'EU', name: 'Europa' },
  { id: 'NA', name: 'América do Norte' },
  { id: 'LATAM', name: 'América Latina' },
  { id: 'PAC', name: 'Pacífico' },
]

export const COUNTRIES: readonly Country[] = [
  { code: 'BR', name: 'Brasil', region: 'BR' },
  { code: 'KR', name: 'Coreia do Sul', region: 'KR' },
  { code: 'CN', name: 'China', region: 'CN' },
  { code: 'US', name: 'Estados Unidos', region: 'NA' },
  { code: 'CA', name: 'Canadá', region: 'NA' },
  { code: 'FR', name: 'França', region: 'EU' },
  { code: 'DE', name: 'Alemanha', region: 'EU' },
  { code: 'ES', name: 'Espanha', region: 'EU' },
  { code: 'PT', name: 'Portugal', region: 'EU' },
  { code: 'GB', name: 'Reino Unido', region: 'EU' },
  { code: 'IT', name: 'Itália', region: 'EU' },
  { code: 'PL', name: 'Polônia', region: 'EU' },
  { code: 'DK', name: 'Dinamarca', region: 'EU' },
  { code: 'SE', name: 'Suécia', region: 'EU' },
  { code: 'BE', name: 'Bélgica', region: 'EU' },
  { code: 'NL', name: 'Países Baixos', region: 'EU' },
  { code: 'TR', name: 'Turquia', region: 'EU' },
  { code: 'GR', name: 'Grécia', region: 'EU' },
  { code: 'AR', name: 'Argentina', region: 'LATAM' },
  { code: 'CL', name: 'Chile', region: 'LATAM' },
  { code: 'MX', name: 'México', region: 'LATAM' },
  { code: 'CO', name: 'Colômbia', region: 'LATAM' },
  { code: 'PE', name: 'Peru', region: 'LATAM' },
  { code: 'VN', name: 'Vietnã', region: 'PAC' },
  { code: 'TW', name: 'Taiwan', region: 'PAC' },
  { code: 'JP', name: 'Japão', region: 'PAC' },
  { code: 'HK', name: 'Hong Kong', region: 'PAC' },
  { code: 'AU', name: 'Austrália', region: 'PAC' },
]

// Regra de 2026: jogadores latino-americanos (exceto brasileiros) têm dupla residência,
// CBLOL e LCS, nas temporadas 2026 e 2027. A partir de 2028 ficam com a região onde mais jogaram.
export const LATAM_DUAL_RESIDENCY = { regions: ['BR', 'NA'], untilYear: 2027 } as const

// Chance relativa de um time de tier 1 da região de destino (coluna) contratar
// um importado nascido na região de origem (linha). 1 = sem barreira.
// Coreanos são exportados para todo lado; chineses quase nunca saem; europeus vão
// para a LCS pelo dinheiro; brasileiros raramente saem (o Ceos foi o 1º no tier 1).
export const MOBILITY: Readonly<Record<string, Readonly<Record<string, number>>>> = {
  KR: { CN: 0.2, NA: 0.08, BR: 0.06, EU: 0.04, PAC: 0.12 },
  CN: { KR: 0.002, NA: 0.002, EU: 0.001, BR: 0.001 },
  EU: { NA: 0.15, KR: 0.004, CN: 0.006, BR: 0.006 },
  NA: { EU: 0.03, KR: 0.004, CN: 0.004, BR: 0.006 },
  BR: { NA: 0.012, EU: 0.004, KR: 0.002, CN: 0.002 },
  LATAM: { BR: 0.15, NA: 0.1, EU: 0.008, KR: 0.002, CN: 0.002 },
  // Taiwaneses e vietnamitas já jogaram na LPL; na LCK, só um caso (LazyFeel, 2025).
  PAC: { CN: 0.05, NA: 0.02, KR: 0.004, EU: 0.005, BR: 0.004 },
}
