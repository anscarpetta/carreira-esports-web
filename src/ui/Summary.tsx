import { CATALOG } from '../data/catalog.ts'
import { of } from '../engine/grammar.ts'
import { summarize } from '../engine/summary.ts'
import type { CareerState } from '../engine/types.ts'
import { kdaText, money, retirementText, ROLE_LABEL, SQUAD_LABEL } from './format.ts'
import { AchievementsButton } from './AchievementsDialog.tsx'
import { Flag } from './Flag.tsx'
import { OvrBadge } from './OvrBadge.tsx'
import { SharePanel } from './SharePanel.tsx'
import { Sparkles } from './Sparkles.tsx'
import { TeamBadge } from './TeamBadge.tsx'
import { Trophy } from './Trophy.tsx'
import { groupTrophies } from './trophies.ts'

function groupCount(names: readonly string[]): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const name of names) counts.set(name, (counts.get(name) ?? 0) + 1)
  return [...counts.entries()].map(([name, count]) => ({ name, count }))
}

export function Summary({
  career,
  onReplay,
  onNewCareer,
}: {
  career: CareerState
  onReplay: () => void
  onNewCareer: () => void
}) {
  const s = summarize(career)
  const { player } = career
  // Internacionais primeiro, do maior para o menor.
  const titles = groupTrophies(s.titles)
  // Prêmios agrupados por tipo e liga ("Seleção do CBLOL"), sem separar por split.
  const awardLabel = (a: (typeof s.awards)[number]) => {
    const league = CATALOG.leagues[a.leagueId]
    if (!league) return a.name
    const kind = a.kind === 'all_pro' ? 'Seleção' : a.kind === 'split_mvp' ? 'MVP' : 'MVP da final'
    return `${kind} ${of(league)} ${league.name}`
  }
  const awards = groupCount(s.awards.map(awardLabel))
  const years = s.firstYear !== null && s.lastYear !== null ? `${s.firstYear}–${s.lastYear}` : '—'
  const worlds = s.titles.filter((t) => t.kind === 'worlds').length

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
      <header className="text-center">
        <p className="text-xs font-bold tracking-widest text-gold uppercase">Resumo da carreira</p>
        <h1 className="mt-1 text-3xl font-black sm:text-4xl">{player.nick}</h1>
        <p className="text-muted">
          {ROLE_LABEL[player.role]} · <Flag code={player.nationality} /> · {years}
          {career.retirement && ` · ${retirementText(career.retirement.reason)} aos ${career.retirement.age} anos`}
        </p>
        {worlds > 0 && (
          <p className="mt-3 text-lg font-black text-gold-soft">
            <Sparkles count={10} className="px-3 py-1">
              🏆 {worlds > 1 ? `${worlds}× campeão mundial` : 'Campeão mundial'}
            </Sparkles>
          </p>
        )}
      </header>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ['OVR máximo', s.peakOvr],
          ['Valor máximo', money(s.peakMarketValue)],
          ['Splits', s.splitsPlayed],
          ['Como titular', s.starterSplits],
          ['Jogos', s.totals.games],
          ['KDA', kdaText(s.totals.kills, s.totals.deaths, s.totals.assists)],
          ['Abates', s.totals.kills],
          ['Assistências', s.totals.assists],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line bg-panel p-3 text-center">
            <p className="text-[0.65rem] font-bold tracking-wide text-muted uppercase">{label}</p>
            {label === 'OVR máximo' ? (
              <div className="mt-1 flex justify-center">
                <OvrBadge ovr={Number(value)} />
              </div>
            ) : (
              <p className="text-xl font-black tabular-nums">{value}</p>
            )}
          </div>
        ))}
      </section>

      <SharePanel career={career} />

      <section className="rounded-2xl border border-line bg-panel p-4">
        <h2 className="text-sm font-bold tracking-wide text-muted uppercase">Vitrine</h2>
        {titles.length === 0 && awards.length === 0 ? (
          <p className="mt-2 text-muted">Vitrine vazia.</p>
        ) : (
          <>
            {titles.length > 0 && (
              <ul className="mt-3 flex flex-wrap items-end justify-center gap-x-5 gap-y-4">
                {titles.map((t) => (
                  <li key={t.key} className="flex w-20 flex-col items-center gap-1 text-center">
                    <Trophy trophy={t.key} size="lg" />
                    <span className="text-xs leading-tight font-bold text-gold-soft">
                      {t.count > 1 && `${t.count}× `}
                      {t.name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <ul className="mt-3 flex flex-wrap gap-2">
              {awards.map((a) => (
                <li key={a.name} className="rounded-full border border-line bg-night/60 px-3 py-1 text-sm font-bold">
                  ⭐ {a.count}× {a.name}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-panel p-4">
        <h2 className="text-sm font-bold tracking-wide text-muted uppercase">Times</h2>
        <ol className="mt-2 flex flex-col gap-2">
          {s.spells.map((spell) => {
            const team = CATALOG.teams[spell.teamId]
            return (
              <li key={`${spell.teamId}-${spell.from.year}-${spell.from.splitIndex}`} className="flex items-center gap-3">
                <TeamBadge teamId={spell.teamId} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{team?.name ?? spell.teamId}</p>
                  <p className="text-xs text-muted">
                    {spell.from.year === spell.to.year ? spell.from.year : `${spell.from.year}–${spell.to.year}`} · {spell.splits}{' '}
                    {spell.splits === 1 ? 'split' : 'splits'} · {spell.stats.games} jogos
                  </p>
                </div>
                {spell.titles > 0 && <span className="text-sm font-bold text-gold-soft">🏆 {spell.titles}</span>}
              </li>
            )
          })}
        </ol>
      </section>

      <section className="rounded-2xl border border-line bg-panel p-4">
        <h2 className="text-sm font-bold tracking-wide text-muted uppercase">Split a split</h2>
        <ol className="mt-2 flex flex-col gap-1 text-sm">
          {career.history.map((r) => (
            <li key={`${r.year}-${r.splitIndex}`} className="flex justify-between gap-2 border-b border-line/60 py-1 last:border-0">
              <span className="truncate">
                {r.splitName} {r.year} · {CATALOG.teams[r.teamId ?? '']?.shortName ?? 'Sem time'} · {SQUAD_LABEL[r.squadRole]}
                {r.titles.length > 0 && ' 🏆'}
                {r.international && ` · 🌍 ${r.international.name}: ${r.international.stage}`}
                {(r.international?.titles.length ?? 0) > 0 && ' 🏆'}
              </span>
              <span className="shrink-0 text-muted tabular-nums">OVR {r.ovrAfter}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button type="button" onClick={onReplay} className="rounded-full bg-white px-6 py-3 font-black text-night">
          Jogar novamente
        </button>
        <button type="button" onClick={onNewCareer} className="rounded-full border border-white/30 px-6 py-3 font-bold">
          Nova identidade
        </button>
        <AchievementsButton className="px-6 py-3" />
      </div>
    </div>
  )
}
