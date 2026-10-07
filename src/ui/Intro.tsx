import { SIMULATION_MODES, type SimulationMode } from '../engine/modes.ts'
import { AchievementsButton } from './AchievementsDialog.tsx'

const MODE_TEXT: Record<SimulationMode, { title: string; description: string }> = {
  intense: { title: 'Intensa', description: '1 decisão por split, imersão total.' },
  normal: { title: 'Normal', description: '1 decisão por ano, experiência equilibrada.' },
  express: { title: 'Expressa', description: '1 decisão a cada 2 anos, para jogar mais rápido.' },
}

export function Intro({
  mode,
  onModeChange,
  onStart,
  onResume,
}: {
  mode: SimulationMode
  onModeChange: (mode: SimulationMode) => void
  onStart: () => void
  onResume: (() => void) | null
}) {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12 sm:py-20">
      <header className="flex flex-col gap-3 text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-gold uppercase">Carreira Esports</p>
        <h1 className="text-3xl font-black text-balance sm:text-5xl">Construa sua carreira no LoL</h1>
        <p className="text-muted text-pretty sm:text-lg">
          Escolha sua rota, tome decisões importantes e deixe o destino te levar a uma trajetória
          única de títulos, estatísticas e momentos decisivos.
        </p>
      </header>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-bold text-muted">Modo de simulação</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {SIMULATION_MODES.map((option) => (
            <label
              key={option}
              className="cursor-pointer rounded-xl border border-line bg-panel p-4 transition-colors hover:border-white/40 has-checked:border-white has-checked:bg-white/10 has-focus-visible:outline-2 has-focus-visible:outline-white"
            >
              <input
                type="radio"
                name="mode"
                value={option}
                checked={mode === option}
                onChange={() => onModeChange(option)}
                className="sr-only"
              />
              <span className="block font-bold">{MODE_TEXT[option].title}</span>
              <span className="mt-1 block text-sm text-muted">{MODE_TEXT[option].description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-full bg-white px-6 py-3 font-black text-night focus-visible:outline-2 focus-visible:outline-white sm:w-auto"
        >
          Começar carreira
        </button>
        {onResume && (
          <button type="button" onClick={onResume} className="text-sm font-bold text-gold-soft underline">
            Continuar a carreira salva
          </button>
        )}
        <AchievementsButton />
      </div>
    </section>
  )
}
