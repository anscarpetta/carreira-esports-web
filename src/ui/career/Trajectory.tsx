import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { CATALOG } from '../../data/catalog.ts'
import { art } from '../../engine/grammar.ts'
import type { SplitRecord, TeamMove } from '../../engine/types.ts'
import { kdaText, SQUAD_LABEL } from '../format.ts'
import { OvrBadge } from '../OvrBadge.tsx'
import { tint } from '../ovr.ts'
import { TeamBadge } from '../TeamBadge.tsx'

// Idades mostradas na tabela, como no Copero (as futuras ficam apagadas).
const FIRST_AGE = 16
const LAST_AGE = 30

function moveText(move: TeamMove): string {
  const to = move.to ? CATALOG.leagues[move.to] : null
  if (move.kind === 'promoted') return `▲ subiu para ${art(to)} ${to?.name}`
  if (move.kind === 'relegated') return `▼ caiu para ${art(to)} ${to?.name}`
  return '✖ saiu da liga'
}

function OvrDiff({ before, after }: { before: number; after: number }) {
  const diff = after - before
  if (diff === 0) return null
  return <span className={`text-[0.65rem] font-black ${diff > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{diff > 0 ? `+${diff}` : diff}</span>
}

const COLUMNS =
  'grid grid-cols-[minmax(0,1fr)_3.5rem_1.75rem_2.25rem] items-center gap-1.5 sm:grid-cols-[minmax(0,1fr)_4.5rem_2.25rem_2.5rem] sm:gap-2'

function SplitLine({ record, fresh }: { record: SplitRecord; fresh: boolean }) {
  const team = record.teamId ? CATALOG.teams[record.teamId] : null
  const intl = record.international
  const champion = record.titles.length > 0 || (intl?.titles.length ?? 0) > 0
  const s = record.stats
  const tags: { text: string; tone: string }[] = []
  if (record.titles.length > 0) tags.push({ text: '🏆 Campeão', tone: 'text-gold-soft' })
  if (record.awards.length > 0) tags.push({ text: `⭐ ${record.awards.map((a) => a.name.split(' ')[0]).join(' · ')}`, tone: 'text-gold-soft' })
  if (intl) tags.push({ text: `🌍 ${intl.name}: ${intl.stage}${intl.titles.length > 0 ? ' 🏆' : ''}`, tone: 'text-sky-300' })
  if (record.breakout) tags.push({ text: '🚀 Explosão', tone: 'text-fuchsia-300' })
  if (record.leagueChange) {
    tags.push({ text: moveText(record.leagueChange), tone: record.leagueChange.kind === 'promoted' ? 'text-emerald-300' : 'text-rose-300' })
  }
  const reduced = useReducedMotion() ?? false
  return (
    <motion.li
      // Linha nova entra deslizando com mola (Animated List, do Magic UI).
      initial={fresh && !reduced ? { opacity: 0, x: -24, scale: 0.96 } : false}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={`${COLUMNS} rounded-lg px-2 py-1.5 ${champion ? 'shine-border ring-1 ring-gold/30' : ''}`}
      style={{ background: `linear-gradient(90deg, ${tint(team?.color ?? '#3f3f46', champion ? 0.32 : 0.2)}, transparent 85%)` }}
      title={[record.splitName, ...record.awards.map((a) => a.name)].join(' · ')}
    >
      <div className="flex min-w-0 items-center gap-2">
        <TeamBadge teamId={record.teamId} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{team?.shortName ?? 'Sem time'}</p>
          <p className="truncate text-[0.65rem] text-muted">
            {record.splitName} {record.year} · {SQUAD_LABEL[record.squadRole]}
            {record.placement !== null && ` · ${record.placement}º`}
          </p>
          {tags.length > 0 && (
            <p className="flex flex-wrap gap-x-1.5 text-[0.65rem] leading-snug">
              {tags.map((tag) => (
                <span key={tag.text} className={`font-bold ${tag.tone}`}>
                  {tag.text}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1">
        <OvrDiff before={record.ovr} after={record.ovrAfter} />
        <OvrBadge ovr={record.ovrAfter} size="sm" />
      </div>
      <span className="text-right text-xs font-bold tabular-nums">{s.games || '–'}</span>
      <span className="text-right text-xs font-bold tabular-nums">
        {s.games > 0 ? kdaText(s.kills, s.deaths, s.assists) : '–'}
      </span>
    </motion.li>
  )
}

export function Trajectory({
  history,
  freshFrom,
  pending,
}: {
  history: readonly SplitRecord[]
  freshFrom: number
  // Linha "Escolhendo o próximo passo…" da decisão em aberto.
  pending?: { age: number; ovr: number } | null
}) {
  const latest = useRef<HTMLLIElement>(null)
  useEffect(() => {
    latest.current?.scrollIntoView?.({ block: 'nearest' })
  }, [history.length])

  const byAge = new Map<number, { record: SplitRecord; index: number }[]>()
  history.forEach((record, index) => byAge.set(record.age, [...(byAge.get(record.age) ?? []), { record, index }]))
  const lastAge = Math.max(LAST_AGE, history.at(-1)?.age ?? 0, pending?.age ?? 0)
  const ages = Array.from({ length: lastAge - FIRST_AGE + 1 }, (_, i) => FIRST_AGE + i)

  return (
    <section aria-label="Trajetória" className="rounded-2xl border border-line bg-panel p-2 sm:p-3">
      <div className={`${COLUMNS} sticky top-0 z-10 bg-panel pr-2 pb-2 pl-13 text-[0.6rem] font-bold tracking-widest text-muted uppercase`}>
        <span>Time</span>
        <span className="text-right">OVR</span>
        <span className="text-right">Jogos</span>
        <span className="text-right">KDA</span>
      </div>
      <ol className="flex flex-col gap-1">
        {ages.map((age) => {
          const rows = byAge.get(age) ?? []
          const isPending = pending?.age === age
          const color = rows[0]?.record.teamId ? CATALOG.teams[rows[0].record.teamId]?.color : null
          if (rows.length === 0 && !isPending) {
            return (
              <li key={age} className="flex items-center gap-2 opacity-30">
                <span className="grid h-7 w-9 place-items-center rounded-md bg-raised text-xs font-black">{age}</span>
              </li>
            )
          }
          return (
            <li key={age} className="flex gap-2">
              <span
                className="grid w-9 shrink-0 place-items-center rounded-md text-sm font-black text-white"
                style={{ background: color ?? '#27272f' }}
              >
                {age}
              </span>
              <ol className="flex min-w-0 flex-1 flex-col gap-1">
                {rows.map(({ record, index }) => (
                  <SplitLine key={`${record.year}-${record.splitIndex}`} record={record} fresh={index >= freshFrom} />
                ))}
                {isPending && pending && (
                  <li ref={latest} className={`${COLUMNS} rounded-lg bg-raised px-2 py-1.5`}>
                    <span className="flex min-w-0 items-center gap-2 text-sm text-muted">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-dashed border-line">?</span>
                      <span className="truncate">Escolhendo o próximo passo…</span>
                    </span>
                    <span className="flex justify-end">
                      <OvrBadge ovr={pending.ovr} size="sm" />
                    </span>
                  </li>
                )}
              </ol>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
