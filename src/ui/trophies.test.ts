import { describe, expect, it } from 'vitest'
import type { Title } from '../engine/types.ts'
import { groupTrophies, trophyImage } from './trophies.ts'

const title = (kind: Title['kind'], leagueId: string, name: string): Title => ({
  kind,
  leagueId,
  name,
  year: 2027,
  splitIndex: 0,
  teamId: 't1',
})

describe('vitrine de troféus', () => {
  it('agrupa por competição, com os internacionais primeiro', () => {
    const groups = groupTrophies([
      title('league', 'circuito-desafiante', 'Circuito Desafiante Etapa 1'),
      title('league', 'cblol', 'CBLOL Split 1'),
      title('league', 'cblol', 'CBLOL Split 2'),
      title('msi', 'msi', 'MSI'),
      title('worlds', 'worlds', 'Worlds'),
    ])
    expect(groups.map((g) => [g.key, g.name, g.count])).toEqual([
      ['worlds', 'Worlds', 1],
      ['msi', 'MSI', 1],
      ['cblol', 'CBLOL', 2],
      ['circuito-desafiante', 'Circuito Desafiante', 1],
    ])
  })

  it('usa o desenho da taça real ou a genérica', () => {
    expect(trophyImage('worlds')).toMatch(/trophies\/worlds\.svg$/)
    expect(trophyImage('circuito-desafiante')).toMatch(/circuito_desafiante\.svg$/)
    // Sem desenho: taça genérica com a faixa na cor da liga.
    expect(trophyImage('ldl')).toMatch(/^data:image\/svg\+xml/)
    expect(decodeURIComponent(trophyImage('ldl'))).toContain('#dc2626')
  })
})
