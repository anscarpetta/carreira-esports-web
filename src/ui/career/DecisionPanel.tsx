import { useState } from 'react'
import { CATALOG } from '../../data/catalog.ts'
import { ageOf, isImportIn } from '../../engine/career.ts'
import { art, of } from '../../engine/grammar.ts'
import { teamForm, trendOf } from '../../engine/teams.ts'
import type { CareerState, Decision, DecisionOption, Outcome, TeamMove } from '../../engine/types.ts'
import { EXPECTED_ROLE_LABEL, percent, TREND_LABEL } from '../format.ts'
import { tint } from '../ovr.ts'
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
          <span className="w-10 shrink-0 font-black text-white tabular-nums">{percent(outcome.probability)}</span>
          <span className="text-slate-300">{outcome.text}</span>
        </li>
      ))}
    </ul>
  )
}

// Conteúdo do card de time (vertical, logo grande, como no Copero).
function TeamCardBody({ career, teamId, verb }: { career: CareerState; teamId: string; verb: string }) {
  const team = career.teams[teamId]
  const data = CATALOG.teams[teamId]
  const league = team?.leagueId ? CATALOG.leagues[team.leagueId] : null
  if (!team || !data) return null
  const trend = league ? TREND_LABEL[trendOf(teamForm(team, league))] : null
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <span className="text-[0.65rem] font-bold tracking-wide text-muted uppercase">{verb}</span>
      <span className="leading-tight font-black">{data.name}</span>
      <div className="my-1.5">
        <TeamBadge teamId={teamId} size="xl" />
      </div>
      {league && (
        <span className="text-xs text-slate-300">
          <span className="font-bold">{league.name}</span> · tier {league.tier}
          {team.guest && ' · convidado'}
        </span>
      )}
      <span className="text-xs text-muted">
        Força <span className="font-bold text-slate-100 tabular-nums">{Math.round(team.rating)}</span>
        {trend && (
          <span className={`ml-1.5 font-bold ${trend.tone}`}>
            {trend.arrow} {trend.label}
          </span>
        )}
      </span>
      <div className="flex flex-wrap justify-center gap-1">
        {team.ambitiousSince !== null && (
          <span className="rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-[0.6rem] font-bold text-fuchsia-300 uppercase">
            Projeto ambicioso
          </span>
        )}
        {league && isImportIn(career, CATALOG, league.id) && (
          <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[0.6rem] font-bold text-sky-300 uppercase">
            Vaga de importado
          </span>
        )}
      </div>
    </div>
  )
}

// Verbo do card de time ("Assinar com", "Ficar na", "Subir para"…).
function optionVerb(option: DecisionOption, career: CareerState): string {
  if (option.type === 'event_join') return option.label
  if (option.type === 'stay') return 'Ficar na'
  if (option.type !== 'join') return ''
  if (career.teamId && CATALOG.teams[career.teamId]?.parentId === option.teamId) return 'Subir para'
  if (career.teamId && CATALOG.teams[option.teamId]?.parentId === career.teamId) return 'Descer para'
  return 'Assinar com'
}

function optionTitle(option: DecisionOption, career: CareerState): string {
  const currentParent = career.teamId ? CATALOG.teams[career.teamId]?.parentId : undefined
  if (option.type === 'join' && option.teamId === currentParent) {
    return `Subir para ${CATALOG.teams[option.teamId]?.shortName ?? option.teamId}`
  }
  if (option.type === 'join' && career.teamId && CATALOG.teams[option.teamId]?.parentId === career.teamId) {
    return `Descer para ${CATALOG.teams[option.teamId]?.shortName ?? option.teamId}`
  }
  if (option.type === 'wait') return option.label
  if (option.type === 'join') return `Assinar com ${CATALOG.teams[option.teamId]?.shortName ?? option.teamId}`
  if (option.type === 'stay') return `Ficar na ${CATALOG.teams[option.teamId]?.shortName ?? option.teamId}`
  if (option.type === 'event_join') return `${option.label}: ${CATALOG.teams[option.teamId]?.shortName ?? option.teamId}`
  if (option.type === 'event_choice') return option.label
  return 'Aposentar-se'
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
  const teamColor = teamId ? CATALOG.teams[teamId]?.color : null

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onChoose(option.id)}
      className={`h-full w-full rounded-xl border p-3 transition ${teamColor ? 'text-center' : 'text-left'} ${chosen ? 'ring-2 ring-white' : 'hover:brightness-125'} ${teamColor ? '' : 'border-line bg-raised'} ${dimmed ? 'opacity-35' : ''} focus-visible:outline-2 focus-visible:outline-white disabled:cursor-default`}
      style={
        teamColor
          ? { background: `linear-gradient(135deg, ${tint(teamColor, 0.24)}, ${tint(teamColor, 0.08)})`, borderColor: tint(teamColor, 0.4) }
          : undefined
      }
    >
      {teamId ? (
        <TeamCardBody career={career} teamId={teamId} verb={optionVerb(option, career)} />
      ) : (
        <p className="font-black">{optionTitle(option, career)}</p>
      )}
      {expected && (
        <div className="mt-2 flex justify-center">
          <span
            className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase ${expected === 'starter' ? 'bg-emerald-500/20 text-emerald-300' : expected === 'reserve' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-500/20 text-slate-300'}`}
          >
            {EXPECTED_ROLE_LABEL[expected]}
          </span>
        </div>
      )}
      {(option.type === 'event_choice' || option.type === 'event_join') && <Outcomes outcomes={option.outcomes} />}
      {option.type === 'wait' && (
        <p className="mt-1 text-sm text-muted">Você passa o período sem jogar e pode receber propostas depois.</p>
      )}
      {option.type === 'retire' && (
        <p className="mt-1 text-sm text-muted">Encerrar a carreira aqui, aos {ageOf(career)} anos, e ver o resumo.</p>
      )}
    </button>
  )
}

// Aviso em destaque quando o seu time sobe, cai ou sai da liga.
export function TeamMoveBanner({ move }: { move: TeamMove }) {
  const team = CATALOG.teams[move.teamId]?.name ?? move.teamId
  const to = move.to ? CATALOG.leagues[move.to] : null
  const from = move.from ? CATALOG.leagues[move.from] : null
  const style =
    move.kind === 'promoted'
      ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
      : 'border-rose-400/60 bg-rose-500/10 text-rose-200'
  const text =
    move.kind === 'promoted'
      ? `▲ A ${team} subiu para ${art(to)} ${to?.name}! A próxima temporada é no tier ${to?.tier}.`
      : move.kind === 'relegated'
        ? `▼ A ${team} caiu para ${art(to)} ${to?.name}. A próxima temporada é no tier ${to?.tier}.`
        : `✖ A ${team} saiu ${of(from)} ${from?.name}.`
  return (
    <p className={`mb-4 rounded-xl border p-3 text-sm font-bold ${style}`} role="status">
      {text}
    </p>
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
          className="mt-4 rounded-full bg-white px-6 py-3 font-black text-night focus-visible:outline-2 focus-visible:outline-white"
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
      {career.teamMove && stage.kind === 'choosing' && <TeamMoveBanner move={career.teamMove} />}
      {career.news.length > 0 && stage.kind === 'choosing' && (
        <div className="mb-4 rounded-xl border border-line bg-raised p-3">
          <p className="text-[0.65rem] font-bold tracking-widest text-muted uppercase">Notícias</p>
          <ul className="mt-1 flex flex-col gap-0.5 text-sm text-slate-300">
            {career.news.slice(0, 5).map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs font-bold tracking-widest text-muted uppercase">Decisão</p>
      <h2 className="mt-1 text-xl font-black">{decision.title}</h2>
      <p className="mt-1 text-sm text-muted">{decision.description}</p>

      {/* Grade de cards: 2 colunas; um card sobrando fica centralizado (como no Copero). */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {decision.options.map((option, index) => {
          const alone = decision.options.length % 2 === 1 && index === decision.options.length - 1
          return (
            <div key={option.id} className={alone ? 'col-span-2 mx-auto w-[calc(50%-0.25rem)]' : ''}>
              <OptionCard career={career} option={option} stage={stage} onChoose={onChoose} />
            </div>
          )
        })}
      </div>

      {stage.kind === 'suspense' && <Suspense eventKey={stage.eventKey} />}
      {(stage.kind === 'result' || (stage.kind === 'simulating' && stage.text)) && (
        <p className="mt-4 rounded-xl bg-raised p-3 text-center font-black text-white" role="status">
          Resultado: {stage.text}
        </p>
      )}
      {stage.kind === 'simulating' && (
        <p className="mt-3 text-center text-sm text-muted" role="status">
          Simulando…
        </p>
      )}

      {!busy && !decision.options.some((option) => option.type === 'retire') && (
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
