import { useState } from 'react'
import { ROLES, type Role } from '../engine/types.ts'
import { Flag } from './Flag.tsx'
import { ROLE_LABEL } from './format.ts'
import type { Identity as IdentityData } from './storage.ts'

const ROLE_HINT: Record<Role, string> = {
  top: 'A ilha. Tanques e duelistas.',
  jungle: 'O mapa inteiro é seu.',
  mid: 'O centro das atenções.',
  adc: 'Dano constante no fim do jogo.',
  support: 'Visão, engage e proteção.',
}

export function Identity({
  initial,
  onConfirm,
  onBack,
}: {
  initial: IdentityData | null
  onConfirm: (identity: IdentityData) => void
  onBack: () => void
}) {
  const [nick, setNick] = useState(initial?.nick ?? '')
  const [role, setRole] = useState<Role | null>(initial?.role ?? null)
  const trimmed = nick.trim()
  const ready = trimmed.length >= 2 && role !== null

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <header>
        <p className="text-xs font-bold tracking-[0.2em] text-gold uppercase">Passo 1</p>
        <h1 className="mt-1 text-3xl font-black">Defina sua identidade</h1>
        <p className="text-muted">Escolha o seu nick e a sua rota.</p>
      </header>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-bold text-muted">Nick</span>
        <input
          value={nick}
          onChange={(event) => setNick(event.target.value.slice(0, 16))}
          placeholder="Ex.: brTT"
          className="rounded-xl border border-line bg-panel px-4 py-3 text-lg font-bold outline-none focus:border-gold"
          autoComplete="off"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-bold text-muted">Rota</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {ROLES.map((option) => (
            <label
              key={option}
              className="cursor-pointer rounded-xl border border-line bg-panel p-3 text-center transition-colors hover:border-gold-soft has-checked:border-gold has-checked:bg-gold/10 has-focus-visible:outline-2 has-focus-visible:outline-gold"
            >
              <input type="radio" name="role" value={option} checked={role === option} onChange={() => setRole(option)} className="sr-only" />
              <span className="block font-black">{ROLE_LABEL[option]}</span>
              <span className="mt-1 block text-xs text-muted">{ROLE_HINT[option]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold text-muted">Nacionalidade</span>
        <div className="flex items-center justify-between rounded-xl border border-line bg-panel/60 px-4 py-3">
          <span className="flex items-center gap-2 font-bold">
            <Flag code="BR" /> Brasil
          </span>
          <span className="text-xs text-muted">Outras regiões em breve</span>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <button type="button" onClick={onBack} className="rounded-xl border border-line px-6 py-3 font-bold">
          Voltar
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => role && onConfirm({ nick: trimmed, role })}
          className="rounded-xl bg-gold px-6 py-3 font-black text-night disabled:cursor-not-allowed disabled:opacity-50"
        >
          Confirmar identidade
        </button>
      </div>
    </section>
  )
}
