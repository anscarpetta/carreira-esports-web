import { CATALOG } from '../../data/catalog.ts'
import type { SplitRecord } from '../../engine/types.ts'
import { kdaText, SQUAD_LABEL } from '../format.ts'
import { TeamBadge } from '../TeamBadge.tsx'

function OvrChange({ before, after }: { before: number; after: number }) {
  const diff = after - before
  if (diff === 0) return <span className="text-muted">{after}</span>
  return (
    <span>
      {after}{' '}
      <span className={diff > 0 ? 'text-emerald-400' : 'text-rose-400'}>{diff > 0 ? `+${diff}` : diff}</span>
    </span>
  )
}

function Row({ record, fresh }: { record: SplitRecord; fresh: boolean }) {
  const team = record.teamId ? CATALOG.teams[record.teamId] : null
  const champion = record.titles.length > 0
  const s = record.stats
  return (
    <li
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${champion ? 'border-gold/70 bg-gold/10' : 'border-line bg-panel'} ${fresh ? 'animate-[rise_0.4s_ease-out]' : ''}`}
    >
      <TeamBadge teamId={record.teamId} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">
          {record.splitName} {record.year}
          {champion && <span className="ml-1.5" aria-label="Campeão">🏆</span>}
        </p>
        <p className="truncate text-xs text-muted">
          {team?.shortName ?? 'Sem time'} · {SQUAD_LABEL[record.squadRole]} · {record.age} anos
          {record.placement !== null && ` · ${record.placement}º lugar`}
        </p>
        {record.awards.length > 0 && (
          <p className="mt-0.5 text-xs font-bold text-gold-soft">⭐ {record.awards.map((a) => a.name).join(' · ')}</p>
        )}
      </div>
      <div className="text-right text-xs tabular-nums">
        <p className="font-bold">
          OVR <OvrChange before={record.ovr} after={record.ovrAfter} />
        </p>
        <p className="text-muted">
          {s.games > 0 ? `${s.games}j · ${s.kills}/${s.deaths}/${s.assists} · KDA ${kdaText(s.kills, s.deaths, s.assists)}` : 'Sem jogos'}
        </p>
      </div>
    </li>
  )
}

export function Trajectory({ history, freshFrom }: { history: readonly SplitRecord[]; freshFrom: number }) {
  if (history.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
        Escolha o seu primeiro time para começar a registrar os splits.
      </section>
    )
  }
  const rows = history.map((record, index) => ({ record, index })).reverse()
  return (
    <section aria-label="Trajetória">
      <h2 className="mb-2 text-sm font-bold tracking-wide text-muted uppercase">Trajetória</h2>
      <ol className="flex flex-col gap-2">
        {rows.map(({ record, index }) => (
          <Row key={`${record.year}-${record.splitIndex}`} record={record} fresh={index >= freshFrom} />
        ))}
      </ol>
    </section>
  )
}
