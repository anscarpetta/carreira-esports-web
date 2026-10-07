import { useReducedMotion } from 'motion/react'
import { useState, type ReactNode } from 'react'

interface Spark {
  readonly id: number
  readonly left: number
  readonly top: number
  readonly size: number
  readonly delay: number
  readonly duration: number
  readonly color: string
}

const COLORS = ['#e6c979', '#fff3c4', '#ffffff']

function spark(id: number): Spark {
  return {
    id,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 8 + Math.random() * 8,
    delay: Math.random() * 2,
    duration: 1.2 + Math.random() * 0.8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }
}

// Estrelinhas que piscam em volta de um texto (Sparkles Text, do Magic UI),
// cada uma no seu ritmo. Só para momentos lendários.
export function Sparkles({ children, count = 8, className = '' }: { children: ReactNode; count?: number; className?: string }) {
  const reduced = useReducedMotion() ?? false
  const [sparks] = useState<Spark[]>(() => Array.from({ length: count }, (_, id) => spark(id)))

  if (reduced) return <span className={className}>{children}</span>

  return (
    <span className={`relative inline-block ${className}`}>
      {sparks.map((s) => (
        <svg
          key={s.id}
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="sparkle pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        >
          <path
            d="M12 0c.5 6.2 5.8 11.5 12 12-6.2.5-11.5 5.8-12 12-.5-6.2-5.8-11.5-12-12C6.2 11.5 11.5 6.2 12 0Z"
            fill={s.color}
          />
        </svg>
      ))}
      <span className="relative">{children}</span>
    </span>
  )
}
