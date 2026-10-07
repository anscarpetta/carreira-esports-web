import { useEffect, useState } from 'react'
import { CATALOG } from '../data/catalog.ts'
import { createCareer, decide } from '../engine/career.ts'
import { DEFAULT_MODE, type SimulationMode } from '../engine/modes.ts'
import type { CareerState } from '../engine/types.ts'
import { CareerScreen } from './career/CareerScreen.tsx'
import { Disclaimer } from './Disclaimer.tsx'
import { Identity } from './Identity.tsx'
import { Intro } from './Intro.tsx'
import { loadSave, newSeed, writeSave, type Identity as IdentityData } from './storage.ts'
import { Summary } from './Summary.tsx'

type Screen = 'intro' | 'identity' | 'career' | 'summary'

// Só no servidor de desenvolvimento (ou num build com VITE_DEMO=1): ?demo=semente&steps=N&mode=intense avança
// N decisões automaticamente (útil para conferir telas no meio da carreira).
function demoSave(): ReturnType<typeof loadSave> {
  if (!import.meta.env.DEV && import.meta.env.VITE_DEMO !== '1') return null
  const params = new URLSearchParams(window.location.search)
  const seed = params.get('demo')
  if (!seed) return null
  const mode = (params.get('mode') ?? 'normal') as SimulationMode
  const identity: IdentityData = { nick: 'Demo', role: 'mid', nationality: params.get('nat') ?? 'BR' }
  let career = createCareer({ seed, mode, ...identity }, CATALOG)
  const steps = Number(params.get('steps') ?? 3)
  for (let i = 0; i < steps && career.phase === 'career'; i += 1) {
    const options = career.decision!.options
    const pickLast = params.get('pick') === 'last'
    career = decide(career, options[pickLast ? options.length - 1 : 0].id, CATALOG)
  }
  return { mode, identity, career }
}

export default function App() {
  const [saved] = useState(() => demoSave() ?? loadSave())
  const [mode, setMode] = useState<SimulationMode>(saved?.mode ?? DEFAULT_MODE)
  const [identity, setIdentity] = useState<IdentityData | null>(saved?.identity ?? null)
  const [career, setCareer] = useState<CareerState | null>(saved?.career ?? null)
  const [screen, setScreen] = useState<Screen>(() => {
    if ((import.meta.env.DEV || import.meta.env.VITE_DEMO === '1') && new URLSearchParams(window.location.search).get('screen') === 'summary') return 'summary'
    return saved?.career?.phase === 'career' ? 'career' : 'intro'
  })

  useEffect(() => {
    writeSave({ mode, identity, career })
  }, [mode, identity, career])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [screen])

  function start(id: IdentityData) {
    setIdentity(id)
    setCareer(createCareer({ seed: newSeed(), mode, nick: id.nick, role: id.role, nationality: id.nationality }, CATALOG))
    setScreen('career')
  }

  return (
    <div className="flex min-h-svh flex-col justify-between">
      <main>
        {screen === 'intro' && (
          <Intro
            mode={mode}
            onModeChange={setMode}
            onStart={() => setScreen('identity')}
            onResume={career?.phase === 'career' ? () => setScreen('career') : null}
          />
        )}
        {screen === 'identity' && <Identity initial={identity} onConfirm={start} onBack={() => setScreen('intro')} />}
        {screen === 'career' && career && (
          <CareerScreen career={career} onCareerChange={setCareer} onViewSummary={() => setScreen('summary')} />
        )}
        {screen === 'summary' && career && (
          <Summary
            career={career}
            onReplay={() => identity && start(identity)}
            onNewCareer={() => setScreen('intro')}
          />
        )}
      </main>
      <Disclaimer />
    </div>
  )
}
