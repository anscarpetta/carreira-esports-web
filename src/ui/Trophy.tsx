import { CATALOG } from '../data/catalog.ts'
import { trophyImage } from './trophies.ts'

const SIZES = { xs: 'h-5', sm: 'h-8', md: 'h-12', lg: 'h-20' } as const

// Taça de uma competição: o desenho da taça real ou a genérica na cor da liga.
export function Trophy({ trophy, size = 'md', className = '' }: { trophy: string; size?: keyof typeof SIZES; className?: string }) {
  const label = trophy === 'cblol-cup' ? 'CBLOL Cup' : (CATALOG.leagues[trophy]?.name ?? trophy)
  return (
    <img
      src={trophyImage(trophy)}
      alt={`Troféu ${label}`}
      className={`${SIZES[size]} w-auto shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${className}`}
    />
  )
}
