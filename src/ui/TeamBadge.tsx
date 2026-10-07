import { CATALOG } from '../data/catalog.ts'
import logos from '../data/logos.json'

const WITH_LOGO = new Set<string>(logos)

const SIZES = {
  sm: 'size-7 text-[0.6rem]',
  md: 'size-10 text-xs',
  lg: 'size-14 text-sm',
} as const

// Logo do time sobre fundo claro (muitos logos têm partes pretas).
// Sem logo, mostra a sigla na cor do time.
export function TeamBadge({ teamId, size = 'md' }: { teamId: string | null; size?: keyof typeof SIZES }) {
  const team = teamId ? CATALOG.teams[teamId] : null
  const box = `${SIZES[size]} shrink-0 rounded-lg`
  if (!team) {
    return <span className={`${box} grid place-items-center border border-dashed border-line text-muted`}>—</span>
  }
  if (WITH_LOGO.has(team.id)) {
    return (
      <span className={`${box} grid place-items-center bg-slate-100 p-1`}>
        <img
          src={`${import.meta.env.BASE_URL}assets/teams/${team.id}.webp`}
          alt={team.name}
          className="size-full object-contain"
          loading="lazy"
        />
      </span>
    )
  }
  return (
    <span className={`${box} grid place-items-center font-black text-white`} style={{ backgroundColor: team.color }} title={team.name}>
      {team.abbreviation}
    </span>
  )
}
