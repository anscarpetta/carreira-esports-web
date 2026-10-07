// Regiões, países e a matriz de mobilidade entre regiões.
// Base: docs/pesquisa-mobilidade.md.

import type { Country, Region } from '../engine/types.ts'

export const REGIONS: readonly Region[] = [
  { id: 'BR', name: 'Brasil' },
  { id: 'KR', name: 'Coreia' },
  { id: 'CN', name: 'China' },
  { id: 'EU', name: 'Europa' },
  { id: 'NA', name: 'América do Norte' },
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
]

// Chance relativa de um time de tier 1 da região de destino (coluna) contratar
// um importado nascido na região de origem (linha). 1 = sem barreira.
// Coreanos são exportados para todo lado; chineses quase nunca saem; europeus vão
// para a LCS pelo dinheiro; brasileiros raramente saem (o Ceos foi o 1º no tier 1).
export const MOBILITY: Readonly<Record<string, Readonly<Record<string, number>>>> = {
  KR: { CN: 0.2, NA: 0.08, BR: 0.06, EU: 0.04 },
  CN: { KR: 0.002, NA: 0.002, EU: 0.001, BR: 0.001 },
  EU: { NA: 0.15, KR: 0.004, CN: 0.006, BR: 0.006 },
  NA: { EU: 0.03, KR: 0.004, CN: 0.004, BR: 0.006 },
  BR: { NA: 0.012, EU: 0.004, KR: 0.002, CN: 0.002 },
}
