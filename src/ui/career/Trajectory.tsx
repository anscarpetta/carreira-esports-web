import { CATALOG } from '../../data/catalog.ts'
import { art, of } from '../../engine/grammar.ts'
import type { SplitRecord, TeamMove } from '../../engine/types.ts'
import { kdaText, SQUAD_LABEL } from '../format.ts'
import { OvrBadge } from '../OvrBadge.tsx'
import { tint } from '../ovr.ts'
import { TeamBadge } from '../TeamBadge.tsx'

function OvrDiff({ before, after }: { before: number; after: number }) {
  const diff = after - before
  if (diff === 0) return null
  return <span className={`text-[0.7rem] font-black ${diff > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{diff > 0 ? `+${diff}` : diff}</span>
}

function moveText(move: TeamMove): string {
  const team = CATALOG.teams[move.teamId]?.shortName ?? move.teamId
  const to = move.to ? CATALOG.leagues[move.to] : null
  const from = move.from ? CATALOG.leagues[move.from] : null
  if (move.kind === 'promoted') return `▲ ${team} subiu para ${art(to)} ${to?.name}`
  if (move.kind === 'relegated') return `▼ ${team} caiu para ${art(to)} ${to?.name}`
  return `✖ ${team} saiu ${of(from)} ${from?.name}`
}

function Row({ record, fresh }: { record: SplitRecord; fresh: boolean }) {
  const team = record.teamId ? CATALOG.teams[record.teamId] : null
  const champion = record.titles.length > 0 || (record.international?.titles.length ?? 0) > 0
  const s = record.stats
  return (
    <li
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${champion ? 'border-gold/70' : 'border-white/5'} ${fresh ? 'animate-[rise_0.4s_ease-out]' : ''}`}
      style={{
        background: champion
          ? `linear-gradient(90deg, ${tint('#c8a24a', 0.22)}, ${tint(team?.color ?? '#17171c', 0.1)})`
          : `linear-gradient(90deg, ${tint(team?.color ?? '#17171c', 0.2)}, #17171c 75%)`,
      }}
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
        {record.leagueChange && (
          <p
            className={`mt-1 rounded-md px-2 py-0.5 text-xs font-bold ${record.leagueChange.kind === 'promoted' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}
          >
            {moveText(record.leagueChange)}
          </p>
        )}
        {record.international && (
          <p
            className={`mt-1 rounded-md px-2 py-0.5 text-xs font-bold ${record.international.titles.length > 0 ? 'bg-gold/20 text-gold-soft' : 'bg-sky-500/10 text-sky-300'}`}
          >
            🌍 {record.international.name} {record.year}: {record.international.stage}
            {record.international.titles.length > 0 && ' 🏆'}
            {record.international.stats.games > 0 &&
              ` · ${record.international.stats.games}j · KDA ${kdaText(record.international.stats.kills, record.international.stats.deaths, record.international.stats.assists)}`}
            {record.international.awards.map((a) => ` · ⭐ ${a.name}`).join('')}
          </p>
        )}
      </div>
      <div className="text-right text-xs tabular-nums">
        <p className="flex items-center justify-end gap-1.5 font-bold">
          {record.breakout && (
            <span title="Explosão: salto de evolução neste split" aria-label="Explosão">
              🚀
            </span>
          )}
          <OvrDiff before={record.ovr} after={record.ovrAfter} />
          <OvrBadge ovr={record.ovrAfter} size="sm" />
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
