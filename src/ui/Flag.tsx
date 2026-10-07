// Bandeiras em imagem (o Windows não desenha bandeiras em emoji).
// Arquivos de flagcdn.com (domínio público) em public/assets/flags/.

import { CATALOG } from '../data/catalog.ts'

const AVAILABLE = new Set([
  'br', 'kr', 'cn', 'us', 'ca', 'fr', 'de', 'es', 'pt', 'gb', 'it', 'pl', 'dk', 'se',
  'be', 'nl', 'tr', 'gr', 'ar', 'mx', 'ua', 'cl', 'co', 'pe', 'tw', 'vn', 'jp',
])

export function Flag({ code, className = 'h-3.5 w-5' }: { code: string; className?: string }) {
  const lower = code.toLowerCase()
  const name = CATALOG.countries[code]?.name ?? code
  if (!AVAILABLE.has(lower)) {
    return <span className="rounded bg-slate-600 px-1 text-[0.6rem] font-bold">{code}</span>
  }
  return (
    <img
      src={`${import.meta.env.BASE_URL}assets/flags/${lower}.png`}
      alt={name}
      title={name}
      className={`inline-block shrink-0 rounded-[2px] object-cover align-[-0.15em] ${className}`}
    />
  )
}
