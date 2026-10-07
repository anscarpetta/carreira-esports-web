import { CATALOG } from '../../data/catalog.ts'
import logos from '../../data/logos.json'
import { ageOf, isImportIn } from '../../engine/career.ts'
import { summarize } from '../../engine/summary.ts'
import type { CareerState } from '../../engine/types.ts'
import { Flag } from '../Flag.tsx'
import { kdaText, money, ROLE_LABEL } from '../format.ts'
import { OvrBadge } from '../OvrBadge.tsx'
import { tint } from '../ovr.ts'
import { TeamBadge } from '../TeamBadge.tsx'
import { TiltCard } from '../TiltCard.tsx'
import { Trophy } from '../Trophy.tsx'
import { groupTrophies } from '../trophies.ts'

const WITH_LOGO = new Set<string>(logos)

export function PlayerCard({ career, ovrHighlight }: { career: CareerState; ovrHighlight: number | null }) {
  const { player } = career
  const summary = summarize(career)
  const teamId = career.paused ? null : career.teamId
  const team = teamId ? CATALOG.teams[teamId] : null
  const age = career.phase === 'summary' ? (career.retirement?.age ?? ageOf(career)) : ageOf(career)
  const totals = summary.totals
  const imported = !!teamId && isImportIn(career, CATALOG, career.teams[teamId]?.leagueId ?? null)
  const color = team?.color ?? '#3f3f46'
  const showcase = groupTrophies(summary.titles)

  return (
    <TiltCard max={5}>
      <section className="rounded-2xl border border-line bg-panel p-3 sm:p-4" aria-label="Seu jogador">
        <div className="flex items-stretch gap-3">
          <div className="relative">
            <OvrBadge ovr={player.ovr} size="lg" label animated />
            {ovrHighlight !== null && ovrHighlight !== 0 && (
              <span
                className={`absolute -top-2 -right-2 rounded-full px-1.5 text-xs font-black ${ovrHighlight > 0 ? 'bg-emerald-400 text-night' : 'bg-rose-500 text-white'}`}
              >
                {ovrHighlight > 0 ? `+${ovrHighlight}` : ovrHighlight}
              </span>
            )}
          </div>

          {/* Caixa do perfil com a cor e o logo do time ao fundo */}
          <div
            className="relative min-w-0 flex-1 overflow-hidden rounded-xl border border-white/5 px-3 py-2"
            style={{ background: `linear-gradient(110deg, ${tint(color, 0.28)}, ${tint(color, 0.08)} 70%)` }}
          >
            {team && WITH_LOGO.has(team.id) && (
              <img
                src={`${import.meta.env.BASE_URL}assets/teams/${team.id}.webp`}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -top-4 -right-4 size-32 object-contain opacity-15"
              />
            )}
            <div className="relative flex items-center gap-2">
              <span className="flex items-center gap-1 rounded bg-black/30 px-1.5 py-0.5 text-[0.65rem] font-black">
                <Flag code={player.nationality} className="h-3 w-4" /> {player.nationality}
              </span>
              <span className="rounded bg-fuchsia-500/25 px-1.5 py-0.5 text-[0.65rem] font-black text-fuchsia-200 uppercase">
                {ROLE_LABEL[player.role]}
              </span>
              {imported && (
                <span className="rounded bg-sky-500/25 px-1.5 py-0.5 text-[0.65rem] font-black text-sky-200 uppercase">Importado</span>
              )}
            </div>
            <p className="relative mt-1 truncate text-xl font-black">{player.nick}</p>
            <div className="relative mt-1 flex items-end justify-between gap-2">
              <p className="flex min-w-0 items-center gap-1.5 text-sm font-bold">
                <TeamBadge teamId={teamId} size="sm" />
                <span className="truncate">
                  {career.paused?.reason === 'streamer' ? 'Streamer' : (team?.name ?? 'Sem time')}
                </span>
              </p>
              <p className="shrink-0 text-right leading-tight">
                <span className="block text-[0.6rem] font-bold tracking-widest text-muted uppercase">Idade · Valor</span>
                <span className="text-sm font-black">
                  {age} · {money(player.marketValue)}
                </span>
              </p>
            </div>
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-5 divide-x divide-line rounded-xl bg-raised py-2 text-center">
          {[
            ['Jogos', totals.games],
            ['KDA', kdaText(totals.kills, totals.deaths, totals.assists)],
            ['Abates', totals.kills],
            ['Assist.', totals.assists],
            ['Títulos', summary.titles.length],
          ].map(([label, value]) => (
            <div key={label} className="px-1">
              <dt className="text-[0.6rem] font-bold tracking-widest text-muted uppercase">{label}</dt>
              <dd className="text-base font-black tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Vitrine: as taças, com a quantidade de cada uma */}
        <div className="mt-2 flex flex-wrap items-end justify-center gap-3 px-1 pt-1">
          {showcase.length === 0 ? (
            <span className="py-1 text-xs font-bold tracking-widest text-muted uppercase">Vitrine vazia</span>
          ) : (
            showcase.map(({ key, name, count }) => (
              <span key={key} className="relative" title={`${count}× ${name}`}>
                <Trophy trophy={key} size="md" />
                {count > 1 && (
                  <span className="absolute -right-2 -bottom-1 rounded-full bg-gold px-1.5 text-[0.65rem] font-black text-night">
                    {count}
                  </span>
                )}
              </span>
            ))
          )}
        </div>
      </section>
    </TiltCard>
  )
}
