import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CATALOG } from '../../data/catalog.ts'
import { ageOf, decide, retire, SECRET_BOOST, secretBoost } from '../../engine/career.ts'
import { of } from '../../engine/grammar.ts'
import type { CareerState } from '../../engine/types.ts'
import { celebrate, partyFor } from '../celebrate.ts'
import { trophyKey } from '../trophies.ts'
import { DecisionPanel, type PanelStage } from './DecisionPanel.tsx'
import { PlayerCard } from './PlayerCard.tsx'
import { Toasts, type Toast } from './Toasts.tsx'
import { Trajectory } from './Trajectory.tsx'

// Tempos da revelação (em ms), no espírito do Copero.
const SUSPENSE_MS = 2500
const BARON_MS = 2000
const RESULT_MS = 1100
const ROW_MS = 450
const OVR_MS = 900

interface Reveal {
  readonly prev: CareerState
  readonly next: CareerState
  readonly optionId: string
  readonly stage: 'suspense' | 'result' | 'rows' | 'ovr'
  readonly rows: number
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

// Confete quando os splits novos trazem título, na cor do time campeão.
function party(prev: CareerState, next: CareerState) {
  const kind = partyFor(prev, next)
  if (!kind) return
  const champion = next.history
    .slice(prev.history.length)
    .findLast((r) => r.titles.length > 0 || (r.international?.titles.length ?? 0) > 0)
  celebrate(kind, champion?.teamId ? CATALOG.teams[champion.teamId]?.color : undefined)
}

function celebrations(prev: CareerState, next: CareerState): Toast[] {
  const toasts: Toast[] = []
  for (const record of next.history.slice(prev.history.length)) {
    if (record.breakout) {
      toasts.push({
        id: `b-${record.year}-${record.splitIndex}`,
        icon: '🚀',
        text: `Explosão! +${record.ovrAfter - record.ovr} OVR no ${record.splitName}`,
      })
    }
    for (const title of record.titles) {
      toasts.push({
        id: `t-${title.year}-${title.splitIndex}`,
        icon: '🏆',
        trophy: trophyKey(title),
        text: `Campeão ${of(CATALOG.leagues[title.leagueId])} ${title.name} ${title.year}!`,
      })
    }
    for (const award of record.awards) {
      toasts.push({ id: `a-${award.kind}-${award.year}-${award.splitIndex}`, icon: '⭐', text: `${award.name} ${award.year}` })
    }
    for (const title of record.international?.titles ?? []) {
      toasts.push({ id: `i-${title.kind}-${title.year}`, icon: '🌍', trophy: trophyKey(title), text: `Campeão do ${title.name} ${title.year}!` })
    }
    for (const award of record.international?.awards ?? []) {
      toasts.push({ id: `ia-${award.kind}-${award.year}-${award.splitIndex}`, icon: '⭐', text: `${award.name} ${award.year}` })
    }
  }
  return toasts
}

export function CareerScreen({
  career,
  onCareerChange,
  onViewSummary,
}: {
  career: CareerState
  onCareerChange: (next: CareerState) => void
  onViewSummary: () => void
}) {
  const [reveal, setReveal] = useState<Reveal | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const timer = useRef<number | null>(null)
  const dismissToasts = useCallback(() => setToasts([]), [])

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
  }, [])

  // Avança as etapas da revelação.
  useEffect(() => {
    if (!reveal) return
    const total = reveal.next.history.length - reveal.prev.history.length
    let delay = 0
    let advance: () => void
    if (reveal.stage === 'suspense') {
      delay = reveal.next.lastResult?.eventKey === 'baron_call' ? BARON_MS : SUSPENSE_MS
      advance = () => setReveal({ ...reveal, stage: 'result' })
    } else if (reveal.stage === 'result') {
      delay = RESULT_MS
      advance = () => setReveal({ ...reveal, stage: 'rows' })
    } else if (reveal.stage === 'rows' && reveal.rows < total) {
      delay = ROW_MS
      advance = () => setReveal({ ...reveal, rows: reveal.rows + 1 })
    } else if (reveal.stage === 'rows') {
      delay = 150
      advance = () => setReveal({ ...reveal, stage: 'ovr' })
    } else {
      delay = OVR_MS
      advance = () => {
        setToasts(celebrations(reveal.prev, reveal.next))
        party(reveal.prev, reveal.next)
        setReveal(null)
      }
    }
    timer.current = window.setTimeout(advance, delay)
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [reveal])

  function choose(optionId: string) {
    if (reveal || !career.decision) return
    const next = decide(career, optionId, CATALOG)
    onCareerChange(next)
    if (prefersReducedMotion()) {
      setToasts(celebrations(career, next))
      return
    }
    setToasts([])
    setReveal({ prev: career, next, optionId, stage: next.lastResult?.random ? 'suspense' : 'result', rows: 0 })
  }

  // Código secreto: uma vez por carreira, fora da revelação.
  function secret() {
    if (reveal || career.phase !== 'career' || career.secretBoost) return
    onCareerChange(secretBoost(career))
    setToasts([{ id: 'secret-boost', icon: '✨', text: `Boost secreto: +${SECRET_BOOST} OVR e um teto mais alto` }])
    celebrate('international', '#a855f7')
  }

  // O que aparece na tela durante a revelação.
  const shown = useMemo<CareerState>(() => {
    if (!reveal) return career
    if (reveal.stage === 'ovr') return reveal.next
    return {
      ...reveal.prev,
      history: reveal.next.history.slice(0, reveal.prev.history.length + reveal.rows),
    }
  }, [career, reveal])

  const stage: PanelStage = !reveal
    ? { kind: 'choosing' }
    : reveal.stage === 'suspense'
      ? { kind: 'suspense', optionId: reveal.optionId, eventKey: reveal.next.lastResult?.eventKey ?? null }
      : reveal.stage === 'result' && reveal.next.lastResult
        ? { kind: 'result', optionId: reveal.optionId, text: reveal.next.lastResult.text }
        : { kind: 'simulating', optionId: reveal.optionId, text: reveal.next.lastResult?.text ?? null }

  const ovrHighlight = reveal?.stage === 'ovr' ? reveal.next.player.ovr - reveal.prev.player.ovr : null
  const panelCareer = reveal ? reveal.prev : career
  const freshFrom = reveal ? reveal.prev.history.length : career.history.length

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-6">
      <div className="flex flex-col gap-4">
        <PlayerCard career={shown} ovrHighlight={ovrHighlight} onSecret={secret} />
        <DecisionPanel
          career={panelCareer}
          decision={panelCareer.decision}
          stage={stage}
          onChoose={choose}
          onRetire={() => onCareerChange(retire(career))}
          onViewSummary={onViewSummary}
        />
      </div>
      <div className="lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto lg:pr-1">
        <Trajectory
          history={shown.history}
          freshFrom={freshFrom}
          pending={shown.phase === 'career' && !reveal ? { age: ageOf(shown), ovr: shown.player.ovr } : null}
        />
      </div>
      <Toasts items={toasts} onDismiss={dismissToasts} />
    </div>
  )
}
