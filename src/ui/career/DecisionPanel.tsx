import { useState } from 'react'
import { CATALOG } from '../../data/catalog.ts'
import { isImportIn } from '../../engine/career.ts'
import { teamForm, trendOf } from '../../engine/teams.ts'
import type { CareerState, Decision, DecisionOption, Outcome } from '../../engine/types.ts'
import { EXPECTED_ROLE_LABEL, percent, TREND_LABEL } from '../format.ts'
import { TeamBadge } from '../TeamBadge.tsx'

export type PanelStage =
  | { kind: 'choosing' }
  | { kind: 'suspense'; optionId: string; eventKey: string | null }
  | { kind: 'result'; optionId: string; text: string }
  | { kind: 'simulating'; optionId: string; text: string | null }

function Outcomes({ outcomes }: { outcomes: readonly Outcome[] }) {
  if (outcomes.length === 0) return null
  if (outcomes.length === 1) return <p className="mt-1 text-sm text-muted">{outcomes[0].text}</p>
  return (
    <ul className="mt-1.5 flex flex-col gap-0.5 text-sm">
      {outcomes.map((outcome) => (
        <li key={outcome.text} className="flex gap-2">
          <span className="w-10 shrink-0 font-black text-gold tabular-nums">{percent(outcome.probability)}</span>
          <span className="text-slate-300">{outcome.text}</span>
        </li>
      ))}
    </ul>
  )
}

function TeamInfo({ career, teamId }: { career: CareerState; teamId: string }) {
  const team = career.teams[teamId]
  const data = CATALOG.teams[teamId]
  const league = team?.leagueId ? CATALOG.leagues[team.leagueId] : null
  if (!team || !data) return null
  const trend = league ? TREND_LABEL[trendOf(teamForm(team, league))] : null
  return (
    <div className="flex min-w-0 items-center gap-3">
      <TeamBadge teamId={teamId} />
      <div className="min-w-0">
        <p className="truncate font-bold">{data.name}</p>
        {league && (
          <p className="text-xs text-muted">
            <span className="font-bold text-slate-300">{league.name}</span> · tier {league.tier}
            {team.guest && ' · convidado'}
            {isImportIn(career, CATALOG, league.id) && (
              <span className="ml-1.5 rounded-full bg-sky-500/20 px-1.5 py-0.5 text-[0.6rem] font-bold text-sky-300 uppercase">
                Vaga de importado
              </span>
            )}
          </p>
        )}
        <p className="text-xs text-muted">
          Força <span className="font-bold text-slate-200 tabular-nums">{Math.round(team.rating)}</span>
          {trend && (
            <span className={`ml-2 font-bold ${trend.tone}`}>
              {trend.arrow} {trend.label}
            </span>
          )}
        </p>
        {team.ambitiousSince !== null && (
          <span className="mt-1 inline-block rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-fuchsia-300 uppercase">
            Projeto ambicioso
          </span>
        )}
      </div>
    </div>
  )
}

function optionTitle(option: DecisionOption, career: CareerState): string {
  const currentParent = career.teamId ? CATALOG.teams[career.teamId]?.parentId : undefined
  if (option.type === 'join' && option.teamId === currentParent) {
    return `Subir para ${CATALOG.teams[option.teamId]?.shortName ?? option.teamId}`
  }
  if (option.type === 'wait') return option.label
  if (option.type === 'join') return `Assinar com ${CATALOG.teams[option.teamId]?.shortName ?? option.teamId}`
  if (option.type === 'stay') return `Ficar na ${CATALOG.teams[option.teamId]?.shortName ?? option.teamId}`
  if (option.type === 'event_join') return `${option.label}: ${CATALOG.teams[option.teamId]?.shortName ?? option.teamId}`
  if (option.type === 'event_choice') return option.label
  return 'Encerrar carreira'
}

function OptionCard({
  career,
  option,
  stage,
  onChoose,
}: {
  career: CareerState
  option: DecisionOption
  stage: PanelStage
  onChoose: (id: string) => void
}) {
  const busy = stage.kind !== 'choosing'
  const chosen = busy && 'optionId' in stage && stage.optionId === option.id
  const dimmed = busy && !chosen
  const teamId = 'teamId' in option ? option.teamId : null
  const expected = 'expectedRole' in option ? option.expectedRole : null

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onChoose(option.id)}
      className={`w-full rounded-xl border p-3 text-left transition ${chosen ? 'border-gold bg-gold/10' : 'border-line bg-night/40 hover:border-gold-soft'} ${dimmed ? 'opacity-35' : ''} focus-visible:outline-2 focus-visible:outline-gold disabled:cursor-default`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-black">{optionTitle(option, career)}</p>
        {expected && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase ${expected === 'starter' ? 'bg-emerald-500/20 text-emerald-300' : expected === 'reserve' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-500/20 text-slate-300'}`}
          >
            {EXPECTED_ROLE_LABEL[expected]}
          </span>
        )}
      </div>
      {teamId && (
        <div className="mt-2">
          <TeamInfo career={career} teamId={teamId} />
        </div>
      )}
      {(option.type === 'event_choice' || option.type === 'event_join') && <Outcomes outcomes={option.outcomes} />}
      {option.type === 'wait' && (
        <p className="mt-1 text-sm text-muted">Você passa o período sem jogar e pode receber propostas depois.</p>
      )}
    </button>
  )
}

function Suspense({ eventKey }: { eventKey: string | null }) {
  if (eventKey === 'baron_call') {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center" role="status">
        <p className="animate-pulse text-3xl">🐉 ⚔️ 🟣</p>
        <p className="font-black text-gold">Jogo 5. Tudo ou nada…</p>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center gap-3 py-4" role="status">
      <span className="size-5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      <span className="font-bold text-gold">Sorteando o resultado…</span>
    </div>
  )
}

export function DecisionPanel({
  career,
  decision,
  stage,
  onChoose,
  onRetire,
  onViewSummary,
}: {
  career: CareerState
  decision: Decision | null
  stage: PanelStage
  onChoose: (optionId: string) => void
  onRetire: () => void
  onViewSummary: () => void
}) {
  const [confirming, setConfirming] = useState(false)

  if (career.phase === 'summary' && stage.kind === 'choosing') {
    return (
      <section className="rounded-2xl border border-gold/60 bg-panel p-5 text-center">
        <p className="text-xs font-bold tracking-widest text-gold uppercase">Fim de jogo</p>
        <h2 className="mt-1 text-2xl font-black">Sua carreira chegou ao fim</h2>
        <p className="mt-1 text-sm text-muted">Tudo o que você construiu está no resumo.</p>
        <button
          type="button"
          onClick={onViewSummary}
          className="mt-4 rounded-xl bg-gold px-6 py-3 font-black text-night focus-visible:outline-2 focus-visible:outline-gold-soft"
        >
          Ver resumo
        </button>
      </section>
    )
  }

  if (!decision) return null
  const busy = stage.kind !== 'choosing'

  return (
    <section className="rounded-2xl border border-line bg-panel p-4 sm:p-5" aria-label="Decisão" aria-live="polite">
      {career.news.length > 0 && stage.kind === 'choosing' && (
        <div className="mb-4 rounded-xl border border-line bg-night/50 p-3">
          <p className="text-[0.65rem] font-bold tracking-widest text-muted uppercase">Notícias da pré-temporada</p>
          <ul className="mt-1 flex flex-col gap-0.5 text-sm text-slate-300">
            {career.news.slice(0, 5).map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs font-bold tracking-widest text-gold uppercase">Decisão</p>
      <h2 className="mt-1 text-xl font-black">{decision.title}</h2>
      <p className="mt-1 text-sm text-muted">{decision.description}</p>

      <div className="mt-4 flex flex-col gap-2">
        {decision.options
          .filter((option) => option.type !== 'retire')
          .map((option) => (
            <OptionCard key={option.id} career={career} option={option} stage={stage} onChoose={onChoose} />
          ))}
        {decision.options.some((option) => option.type === 'retire') && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onChoose(decision.options.find((o) => o.type === 'retire')!.id)}
            className="rounded-xl bg-gold px-6 py-3 font-black text-night disabled:opacity-50"
          >
            Encerrar carreira
          </button>
        )}
      </div>

      {stage.kind === 'suspense' && <Suspense eventKey={stage.eventKey} />}
      {(stage.kind === 'result' || (stage.kind === 'simulating' && stage.text)) && (
        <p className="mt-4 rounded-xl bg-night/60 p-3 text-center font-black text-gold-soft" role="status">
          Resultado: {stage.text}
        </p>
      )}
      {stage.kind === 'simulating' && (
        <p className="mt-3 text-center text-sm text-muted" role="status">
          Simulando…
        </p>
      )}

      {!busy && decision.kind !== 'no_offers' && (
        <div className="mt-4 text-center text-xs text-muted">
          {confirming ? (
            <span>
              Encerrar a carreira agora?{' '}
              <button type="button" className="font-bold text-rose-300 underline" onClick={onRetire}>
                Sim, encerrar
              </button>{' '}
              ·{' '}
              <button type="button" className="font-bold underline" onClick={() => setConfirming(false)}>
                Continuar jogando
              </button>
            </span>
          ) : (
            <button type="button" className="underline decoration-dotted hover:text-slate-300" onClick={() => setConfirming(true)}>
              Encerrar carreira
            </button>
          )}
        </div>
      )}
    </section>
  )
}
