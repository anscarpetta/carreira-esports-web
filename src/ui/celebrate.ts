import confetti from 'canvas-confetti'
import type { CareerState } from '../engine/types.ts'

// Tamanho da festa: título de liga, internacional (First Stand e MSI) ou Worlds.
export type Party = 'league' | 'international' | 'worlds'

const GOLD = ['#c8a24a', '#e6c979', '#fff3c4', '#ffffff']

// A maior conquista entre os splits novos, se houver.
export function partyFor(prev: CareerState, next: CareerState): Party | null {
  const records = next.history.slice(prev.history.length)
  const intl = records.flatMap((r) => r.international?.titles ?? [])
  if (intl.some((t) => t.kind === 'worlds')) return 'worlds'
  if (intl.length > 0) return 'international'
  if (records.some((r) => r.titles.length > 0)) return 'league'
  return null
}

let canvasSupport: boolean | null = null

// Sem canvas 2D (testes, navegador antigo) não há festa: o canvas-confetti falharia depois, fora do try.
function hasCanvas(): boolean {
  if (canvasSupport === null) {
    try {
      canvasSupport = !!document.createElement('canvas').getContext('2d')
    } catch {
      canvasSupport = false
    }
  }
  return canvasSupport
}

// Confete com canvas-confetti; respeita "reduzir movimento" do sistema.
export function celebrate(party: Party, teamColor?: string): void {
  if (!hasCanvas()) return
  try {
    const colors = teamColor ? [teamColor, ...GOLD] : GOLD
    const base = { colors, disableForReducedMotion: true, zIndex: 60 }
    if (party === 'league') {
      void confetti({ ...base, particleCount: 70, spread: 70, startVelocity: 38, origin: { y: 0.7 } })
      return
    }
    if (party === 'international') {
      void confetti({ ...base, particleCount: 140, spread: 100, startVelocity: 48, origin: { y: 0.65 } })
      return
    }
    // Worlds: canhões dos dois lados por quase 2 segundos.
    const end = Date.now() + 1800
    const frame = () => {
      void confetti({ ...base, colors: GOLD, particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.75 } })
      void confetti({ ...base, colors: GOLD, particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.75 } })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
    void confetti({ ...base, colors: GOLD, particleCount: 160, spread: 120, startVelocity: 55, scalar: 1.2, origin: { y: 0.6 } })
  } catch {
    // Se o confete falhar, o jogo segue sem festa.
  }
}
