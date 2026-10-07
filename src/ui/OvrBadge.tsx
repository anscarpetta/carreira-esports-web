import { ovrColor } from './ovr.ts'

const SIZES = {
  sm: 'h-6 min-w-8 rounded-md px-1.5 text-xs',
  md: 'h-9 min-w-11 rounded-lg px-2 text-base',
  lg: 'size-16 rounded-xl text-3xl',
} as const

// Caixinha colorida com o OVR em branco.
export function OvrBadge({ ovr, size = 'md', label = false }: { ovr: number; size?: keyof typeof SIZES; label?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 flex-col items-center justify-center font-black text-white tabular-nums shadow-sm ${SIZES[size]}`}
      style={{ background: `linear-gradient(160deg, ${ovrColor(ovr)}, ${ovrColor(ovr)}cc)` }}
      aria-label={`OVR ${ovr}`}
    >
      {label && <span className="text-[0.6rem] leading-none font-bold tracking-widest opacity-80">OVR</span>}
      <span className="leading-none">{ovr}</span>
    </span>
  )
}
