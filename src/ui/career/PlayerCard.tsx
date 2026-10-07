import { CATALOG } from '../../data/catalog.ts'
import { ageOf, isImportIn } from '../../engine/career.ts'
import { summarize } from '../../engine/summary.ts'
import type { CareerState } from '../../engine/types.ts'
import { kdaText, money, ROLE_LABEL } from '../format.ts'
import { Flag } from '../Flag.tsx'
import { TeamBadge } from '../TeamBadge.tsx'

export function PlayerCard({ career, ovrHighlight }: { career: CareerState; ovrHighlight: number | null }) {
  const { player } = career
  const summary = summarize(career)
  const team = career.teamId ? CATALOG.teams[career.teamId] : null
  const age = career.phase === 'summary' ? (career.retirement?.age ?? ageOf(career)) : ageOf(career)
  const totals = summary.totals

  return (
    <section className="rounded-2xl border border-line bg-panel p-4 sm:p-5" aria-label="Seu jogador">
      <div className="flex items-center gap-4">
        <div className="relative grid size-16 shrink-0 place-items-center rounded-xl bg-night ring-1 ring-gold/60">
          <span className="text-[0.6rem] font-bold tracking-widest text-muted uppercase">OVR</span>
          <span className="-mt-1 text-2xl font-black text-gold tabular-nums">{player.ovr}</span>
          {ovrHighlight !== null && ovrHighlight !== 0 && (
            <span
              className={`absolute -top-2 -right-2 rounded-full px-1.5 text-xs font-black ${ovrHighlight > 0 ? 'bg-emerald-500 text-night' : 'bg-rose-500 text-white'}`}
            >
              {ovrHighlight > 0 ? `+${ovrHighlight}` : ovrHighlight}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-black">{player.nick}</p>
          <p className="text-sm text-muted">
            {ROLE_LABEL[player.role]} · <Flag code={player.nationality} /> · {age} anos
          </p>
          <p className="text-sm text-muted">
            Valor: <span className="font-bold text-slate-200">{money(player.marketValue)}</span>
            {!career.paused && career.teamId && isImportIn(career, CATALOG, career.teams[career.teamId]?.leagueId ?? null) && (
              <span className="ml-2 rounded-full bg-sky-500/20 px-1.5 py-0.5 text-[0.6rem] font-bold text-sky-300 uppercase">
                Importado
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <TeamBadge teamId={career.paused ? null : career.teamId} size="lg" />
          <span className="max-w-24 truncate text-xs text-muted">
            {career.paused?.reason === 'streamer' ? 'Streamer' : team ? team.shortName : 'Sem time'}
          </span>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-5 gap-2 text-center">
        {[
          ['Jogos', totals.games],
          ['KDA', kdaText(totals.kills, totals.deaths, totals.assists)],
          ['Abates', totals.kills],
          ['Assist.', totals.assists],
          ['Títulos', summary.titles.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-night/60 px-1 py-2">
            <dt className="text-[0.65rem] font-bold tracking-wide text-muted uppercase">{label}</dt>
            <dd className="text-base font-black tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
