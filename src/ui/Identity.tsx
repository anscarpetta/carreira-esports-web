import { Search } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { COUNTRIES, REGIONS } from '../data/regions.ts'
import type { Role } from '../engine/types.ts'
import { Flag } from './Flag.tsx'
import { ROLE_LABEL } from './format.ts'
import { RiftMap } from './RiftMap.tsx'
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
  PAC: 'Começa na liga do seu país: VCS (Vietnã), LJL (Japão) ou PCS (Taiwan, Hong Kong e Oceania); o topo é a LCP.',
}

// Busca sem acento e sem diferenciar maiúsculas ("colombia" acha "Colômbia").
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h2 className="text-center text-sm font-black tracking-wide">{title}</h2>
      {children}
    </div>
  )
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
  const [query, setQuery] = useState('')
  const country = COUNTRIES.find((c) => c.code === nationality)
  const region = country?.region ?? 'BR'
  const trimmed = nick.trim()
  const ready = trimmed.length >= 2 && role !== null

  const countries = useMemo(() => {
    const q = normalize(query.trim())
    return [...COUNTRIES]
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      .filter((c) => !q || normalize(c.name).includes(q))
  }, [query])

  return (
    <section className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-4 sm:py-10">
      <div className="overflow-hidden rounded-2xl border border-line bg-panel">
        <header className="border-b border-line px-5 py-4">
          <h1 className="text-xl font-black sm:text-2xl">Defina sua identidade</h1>
        </header>

        <div className="grid gap-6 p-4 sm:p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)_minmax(0,1fr)]">
          <Column title="Identidade">
            {/* Prévia do cartão do jogador */}
            <div className="relative overflow-hidden rounded-xl border border-line bg-raised p-4 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_60%)]" />
              <p className="relative truncate text-3xl font-black tracking-tight">{trimmed || 'SEU NICK'}</p>
              <p className="relative mt-2 flex items-center justify-center gap-2 text-sm text-muted">
                <Flag code={nationality} /> {country?.name ?? ''}
              </p>
              <p className="relative mt-1 text-sm font-bold">{role ? ROLE_LABEL[role] : 'Escolha a rota no mapa'}</p>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-center text-[0.65rem] font-bold tracking-widest text-muted uppercase">Nick</span>
              <input
                value={nick}
                onChange={(event) => setNick(event.target.value.slice(0, 16))}
                placeholder="Ex.: brTT"
                className="rounded-xl border border-line bg-raised px-4 py-3 text-center text-lg font-bold outline-none focus:border-white/40"
                autoComplete="off"
              />
            </label>
          </Column>

          <Column title="Nacionalidade">
            <label className="flex items-center gap-2 rounded-xl border border-line bg-raised px-3 py-2.5 focus-within:border-white/40">
              <Search className="size-4 text-muted" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar país"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                aria-label="Buscar país"
              />
            </label>
            <div
              className="scroll-thin grid max-h-64 grid-cols-2 content-start gap-1 overflow-y-auto rounded-xl border border-line bg-raised p-2 lg:max-h-[21rem]"
              role="radiogroup"
              aria-label="Nacionalidade"
            >
              {countries.map((c) => {
                const selected = c.code === nationality
                return (
                  <button
                    key={c.code}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setNationality(c.code)}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-bold transition ${selected ? 'bg-white text-night' : 'hover:bg-white/5'}`}
                  >
                    <Flag code={c.code} className="h-4 w-6" />
                    <span className="truncate">{c.name}</span>
                  </button>
                )
              })}
              {countries.length === 0 && <p className="col-span-2 p-3 text-sm text-muted">Nenhum país encontrado.</p>}
            </div>
            <p className="text-xs text-muted">
              <span className="font-bold text-slate-300">{REGIONS.find((r) => r.id === region)?.name}:</span>{' '}
              {REGION_START[region]}
            </p>
          </Column>

          <Column title="Rota">
            <RiftMap value={role} onChange={setRole} />
          </Column>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
          <button type="button" onClick={onBack} className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-bold whitespace-nowrap hover:bg-white/5 sm:px-6 sm:text-base">
            Voltar
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => role && onConfirm({ nick: trimmed, role, nationality })}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-black whitespace-nowrap text-night disabled:cursor-not-allowed disabled:opacity-40 sm:px-6 sm:text-base"
          >
            Confirmar identidade
          </button>
        </footer>
      </div>
    </section>
  )
}
