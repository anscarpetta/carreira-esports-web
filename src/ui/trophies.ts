import { CATALOG } from '../data/catalog.ts'
import type { Title } from '../engine/types.ts'

// Troféus desenhados em SVG (public/assets/trophies), no estilo simples do Copero,
// a partir de fotos das taças reais. Ligas sem desenho usam a taça genérica na cor da liga.
const DRAWN: Readonly<Record<string, string>> = {
  worlds: 'worlds',
  msi: 'msi',
  first_stand: 'first_stand',
  cblol: 'cblol',
  'cblol-cup': 'cblol_cup',
  lck: 'lck',
  lpl: 'lpl',
  lec: 'lec',
  lcs: 'lcs',
  lcp: 'lcp',
  'circuito-desafiante': 'circuito_desafiante',
}

// Cor da faixa da taça genérica.
const GENERIC_COLOR: Readonly<Record<string, string>> = {
  'qualificatoria-aberta': '#16a34a',
  'lck-cl': '#4f46e5',
  ldl: '#dc2626',
  'emea-masters': '#0ea5e9',
  nacl: '#2563eb',
  vcs: '#ef4444',
  ljl: '#e11d48',
  pcs: '#7c3aed',
  lrs: '#f97316',
  lrn: '#10b981',
}

// Copas de início de ano com taça própria: liga → competição (o 1º split da liga).
const CUPS: Readonly<Record<string, { key: string; name: string }>> = {
  cblol: { key: 'cblol-cup', name: 'CBLOL Cup' },
}

// Chave do troféu: o torneio internacional, a copa ou a liga do título.
export function trophyKey(title: Pick<Title, 'kind' | 'leagueId' | 'splitIndex'>): string {
  if (title.kind !== 'league') return title.kind
  const cup = CUPS[title.leagueId]
  return cup && title.splitIndex === 0 ? cup.key : title.leagueId
}

// Nome da competição (para agrupar a vitrine): "CBLOL", "CBLOL Cup", "Worlds"…
export function trophyName(title: Pick<Title, 'kind' | 'leagueId' | 'name' | 'splitIndex'>): string {
  if (title.kind !== 'league') return title.name
  const cup = CUPS[title.leagueId]
  if (cup && title.splitIndex === 0) return cup.name
  return CATALOG.leagues[title.leagueId]?.name ?? title.name
}

// Títulos agrupados por troféu, do maior para o menor (Worlds, MSI, First Stand, ligas por tier).
export function groupTrophies(titles: readonly Title[]): { key: string; name: string; count: number }[] {
  const rank = (t: Title) =>
    t.kind === 'worlds' ? 0 : t.kind === 'msi' ? 1 : t.kind === 'first_stand' ? 2 : 2 + (CATALOG.leagues[t.leagueId]?.tier ?? 3)
  const groups = new Map<string, { key: string; name: string; count: number; rank: number }>()
  for (const title of titles) {
    const key = trophyKey(title)
    const group = groups.get(key) ?? { key, name: trophyName(title), count: 0, rank: rank(title) }
    group.count += 1
    groups.set(key, group)
  }
  return [...groups.values()].sort((a, b) => a.rank - b.rank || b.count - a.count).map(({ key, name, count }) => ({ key, name, count }))
}

// Taça dourada com alças e a faixa da base na cor da liga (para ligas sem desenho próprio).
function genericCup(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" width="100" height="140">
<defs>
<linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#a87a1c"/><stop offset=".4" stop-color="#ffe08a"/><stop offset=".65" stop-color="#e6b84a"/><stop offset="1" stop-color="#8f6512"/></linearGradient>
<linearGradient id="d" x1="0" x2="1"><stop offset="0" stop-color="#7a5510"/><stop offset=".45" stop-color="#e8c060"/><stop offset="1" stop-color="#6e4b0c"/></linearGradient>
</defs>
<path d="M26 30 C8 30 10 60 32 62" stroke="url(#d)" stroke-width="6" fill="none"/>
<path d="M74 30 C92 30 90 60 68 62" stroke="url(#d)" stroke-width="6" fill="none"/>
<path d="M22 22 L78 22 L76 46 Q72 72 50 76 Q28 72 24 46 Z" fill="url(#g)"/>
<ellipse cx="50" cy="22" rx="28" ry="4.5" fill="#7a5510"/>
<path d="M38 32 L40 60" stroke="#fff6cf" stroke-width="3" opacity=".55" stroke-linecap="round"/>
<rect x="45" y="76" width="10" height="16" fill="url(#d)"/>
<path d="M34 92 L66 92 L70 102 L30 102 Z" fill="url(#g)"/>
<rect x="26" y="102" width="48" height="24" rx="2" fill="#1f2229"/>
<rect x="26" y="109" width="48" height="9" fill="${color}"/>
<rect x="23" y="126" width="54" height="6" rx="1.5" fill="url(#d)"/>
</svg>`
}

// Imagem do troféu: o desenho da taça real ou a genérica na cor da liga (serve para <img> e para o canvas).
export function trophyImage(key: string): string {
  const file = DRAWN[key]
  if (file) return `${import.meta.env.BASE_URL}assets/trophies/${file}.svg`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(genericCup(GENERIC_COLOR[key] ?? '#c8a24a'))}`
}
