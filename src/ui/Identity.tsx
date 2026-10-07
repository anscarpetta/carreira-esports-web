import { useState } from 'react'
import { COUNTRIES, REGIONS } from '../data/regions.ts'
import { ROLES, type Role } from '../engine/types.ts'
import { Flag } from './Flag.tsx'
import { ROLE_LABEL } from './format.ts'
import type { Identity as IdentityData } from './storage.ts'

// Onde a carreira começa em cada região.
const REGION_START: Record<string, string> = {
  BR: 'Começa no Desafiante ou na Qualificatória; o topo é o CBLOL.',
  KR: 'Começa na LCK CL; o topo é a LCK, a liga mais forte do mundo.',
  CN: 'Começa na LDL; o topo é a LPL. Chineses quase nunca saem da China.',
  EU: 'Começa na EMEA Masters; o topo é a LEC.',
  NA: 'Começa na NACL; o topo é a LCS.',
  LATAM:
    'Começa na Liga Regional Sur ou Norte. Até 2027, a dupla residência deixa jogar CBLOL e LCS sem ocupar vaga de importado.',
}

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
  const [nationality, setNationality] = useState(initial?.nationality ?? 'BR')
  const region = COUNTRIES.find((c) => c.code === nationality)?.region ?? 'BR'
  const trimmed = nick.trim()
  const ready = trimmed.length >= 2 && role !== null

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <header>
        <p className="text-xs font-bold tracking-[0.2em] text-gold uppercase">Passo 1</p>
        <h1 className="mt-1 text-3xl font-black">Defina sua identidade</h1>
        <p className="text-muted">Escolha o seu nick, a sua rota e o seu país.</p>
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

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-bold text-muted">Nacionalidade</legend>
        {REGIONS.map((r) => (
          <div key={r.id}>
            <p className="mb-1 text-xs font-bold tracking-wide text-muted uppercase">{r.name}</p>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.filter((c) => c.region === r.id).map((country) => (
                <label
                  key={country.code}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-panel px-3 py-1.5 text-sm font-bold transition-colors hover:border-gold-soft has-checked:border-gold has-checked:bg-gold/10 has-focus-visible:outline-2 has-focus-visible:outline-gold"
                >
                  <input
                    type="radio"
                    name="nationality"
                    value={country.code}
                    checked={nationality === country.code}
                    onChange={() => setNationality(country.code)}
                    className="sr-only"
                  />
                  <Flag code={country.code} />
                  {country.name}
                </label>
              ))}
            </div>
          </div>
        ))}
        <p className="rounded-lg bg-night/60 px-3 py-2 text-sm text-muted">{REGION_START[region]}</p>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <button type="button" onClick={onBack} className="rounded-xl border border-line px-6 py-3 font-bold">
          Voltar
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => role && onConfirm({ nick: trimmed, role, nationality })}
          className="rounded-xl bg-gold px-6 py-3 font-black text-night disabled:cursor-not-allowed disabled:opacity-50"
        >
          Confirmar identidade
        </button>
      </div>
    </section>
  )
}
