import { ROLES, type Role } from '../engine/types.ts'
import { ROLE_LABEL } from './format.ts'

// Posição de cada rota no mapa (em % da largura/altura). Base azul embaixo à esquerda.
const SPOTS: Record<Role, { left: number; top: number }> = {
  top: { left: 16, top: 15 },
  jungle: { left: 30, top: 42 },
  mid: { left: 50, top: 50 },
  adc: { left: 85, top: 72 },
  support: { left: 62, top: 87 },
}

// Mapa simplificado de Summoner's Rift para escolher a rota (como o campo do Copero).
export function RiftMap({ value, onChange }: { value: Role | null; onChange: (role: Role) => void }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/10" role="radiogroup" aria-label="Rota">
      <svg viewBox="0 0 300 300" className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <linearGradient id="rift-bg" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#0f2f22" />
            <stop offset="1" stopColor="#13261c" />
          </linearGradient>
        </defs>
        <rect width="300" height="300" fill="url(#rift-bg)" />
        {/* Rio */}
        <path d="M18 18 L282 282" stroke="#38bdf8" strokeOpacity="0.16" strokeWidth="30" />
        {/* Rotas: top, mid e bot */}
        <g stroke="#ffffff" strokeOpacity="0.1" strokeWidth="16" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M34 266 L34 34 L266 34" />
          <path d="M34 266 L266 34" />
          <path d="M34 266 L266 266 L266 34" />
        </g>
        {/* Bases */}
        <circle cx="34" cy="266" r="24" fill="#3b82f6" fillOpacity="0.35" />
        <circle cx="266" cy="34" r="24" fill="#ef4444" fillOpacity="0.35" />
        {/* Barão e Dragão */}
        <circle cx="96" cy="96" r="9" fill="#a855f7" fillOpacity="0.35" />
        <circle cx="204" cy="204" r="9" fill="#f97316" fillOpacity="0.35" />
      </svg>
      {ROLES.map((role) => {
        const selected = value === role
        return (
          <button
            key={role}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={ROLE_LABEL[role]}
            onClick={() => onChange(role)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs font-black shadow-lg transition sm:text-sm ${selected ? 'bg-white text-night' : 'bg-night/80 text-slate-100 ring-1 ring-white/15 hover:bg-raised'} focus-visible:outline-2 focus-visible:outline-white`}
            style={{ left: `${SPOTS[role].left}%`, top: `${SPOTS[role].top}%` }}
          >
            {ROLE_LABEL[role]}
          </button>
        )
      })}
    </div>
  )
}
