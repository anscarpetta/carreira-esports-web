// Escala de cores do OVR (no estilo do Copero): laranja → amarelo → verde → verde forte →
// azul → roxo. O número fica em branco sobre a cor.
// Referência: os maiores do Brasil chegam a 81–84; a LCK fica nos 90.

const OVR_SCALE: readonly (readonly [number, string])[] = [
  [90, '#9333ea'], // roxo brilhante: elite mundial
  [83, '#2563eb'], // azul brilhante: craque
  [77, '#15803d'], // verde forte: titular de time grande
  [70, '#4d9a2a'], // verde: titular de tier 1
  [60, '#c08a0b'], // amarelo: promessa / tier 2
  [0, '#d9590f'], // laranja: começo de carreira
]

export function ovrColor(ovr: number): string {
  return OVR_SCALE.find(([min]) => ovr >= min)?.[1] ?? OVR_SCALE.at(-1)![1]
}

// Cor de time com transparência (fundo de cards e do cartão do jogador).
export function tint(hex: string, alpha: number): string {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
