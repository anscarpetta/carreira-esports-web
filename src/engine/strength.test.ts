import { describe, expect, it } from 'vitest'
import { createRng } from './rng.ts'
import { playSeries, teamRatingWithPlayer, winProbability } from './strength.ts'

describe('strength', () => {
  it('forças iguais dão 50%', () => {
    expect(winProbability(78, 78)).toBeCloseTo(0.5)
  })

  it('reproduz a escala do Elo: 5 de OVR (100 Elo) dá ~36% ao mais fraco', () => {
    expect(winProbability(75, 80)).toBeCloseTo(0.36, 2)
  })

  it('o melhor do CBLOL contra o 5º da LEC fica na faixa de 35–45% por jogo', () => {
    // RED (79,2) contra Vitality (~82,5): o caso da Demacia Cup 2026.
    const p = winProbability(79.2, 82.5)
    expect(p).toBeGreaterThan(0.35)
    expect(p).toBeLessThan(0.45)
  })

  it('uma série melhor de 5 termina com 3 vitórias de um lado', () => {
    let rng = createRng('serie')
    for (let i = 0; i < 200; i += 1) {
      const roll = playSeries(rng, 80, 78, 5)
      const { winsA, winsB, aWon } = roll.value
      expect(Math.max(winsA, winsB)).toBe(3)
      expect(Math.min(winsA, winsB)).toBeLessThan(3)
      expect(aWon).toBe(winsA === 3)
      rng = roll.rng
    }
  })

  it('séries longas favorecem ainda mais o mais forte', () => {
    let rng = createRng('vantagem')
    let bo1 = 0
    let bo5 = 0
    for (let i = 0; i < 4000; i += 1) {
      const a = playSeries(rng, 82, 78, 1)
      const b = playSeries(a.rng, 82, 78, 5)
      if (a.value.aWon) bo1 += 1
      if (b.value.aWon) bo5 += 1
      rng = b.rng
    }
    expect(bo5).toBeGreaterThan(bo1)
  })

  it('o jogador pesa 20% na força do time', () => {
    expect(teamRatingWithPlayer(70, 90)).toBeCloseTo(74)
    expect(teamRatingWithPlayer(80, 80)).toBeCloseTo(80)
  })
})
