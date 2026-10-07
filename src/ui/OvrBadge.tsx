import { animate, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { ovrColor } from './ovr.ts'

const SIZES = {
  sm: 'h-6 min-w-8 rounded-md px-1.5 text-xs',
  md: 'h-9 min-w-11 rounded-lg px-2 text-base',
  lg: 'size-16 rounded-xl text-3xl',
} as const

// Conta do valor anterior até o novo (Number Ticker, do Magic UI).
function useCountUp(value: number, enabled: boolean): number {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const start = from.current
    from.current = value
    if (!enabled || start === value) {
      setShown(value)
      return
    }
    const controls = animate(start, value, {
      duration: Math.min(1.2, 0.35 + Math.abs(value - start) * 0.12),
      ease: 'easeOut',
      onUpdate: (current) => setShown(Math.round(current)),
    })
    return () => controls.stop()
  }, [value, enabled])
  return enabled ? shown : value
}

// Caixinha colorida com o OVR em branco. Com `animated`, o número conta até o novo valor
// e a caixa dá um pulo quando muda de faixa de cor.
export function OvrBadge({
  ovr,
  size = 'md',
  label = false,
  animated = false,
}: {
  ovr: number
  size?: keyof typeof SIZES
  label?: boolean
  animated?: boolean
}) {
  const reduced = useReducedMotion() ?? false
  const shown = useCountUp(ovr, animated && !reduced)
  const color = ovrColor(shown)
  // O pulo só acontece quando a faixa muda, não na primeira renderização.
  const [firstColor] = useState(color)
  const bump = animated && !reduced && color !== firstColor
  return (
    <motion.span
      key={animated ? color : undefined}
      initial={bump ? { scale: 1.18 } : false}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 14 }}
      className={`inline-flex shrink-0 flex-col items-center justify-center font-black text-white tabular-nums shadow-sm ${SIZES[size]}`}
      style={{ backgroundColor: color, backgroundImage: 'linear-gradient(160deg, rgb(255 255 255 / 0.08), rgb(0 0 0 / 0.2))' }}
      aria-label={`OVR ${ovr}`}
    >
      {label && <span className="text-[0.6rem] leading-none font-bold tracking-widest opacity-80">OVR</span>}
      <span className="leading-none">{shown}</span>
    </motion.span>
  )
}
