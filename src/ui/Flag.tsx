// Bandeiras em SVG (o Windows não desenha bandeiras em emoji).
// Desenhos simplificados, suficientes para o tamanho de um ícone.

import type { ReactNode } from 'react'

const FLAGS: Record<string, { name: string; svg: ReactNode }> = {
  BR: {
    name: 'Brasil',
    svg: (
      <>
        <rect width="30" height="20" fill="#009c3b" />
        <path d="M15 2.5 27.5 10 15 17.5 2.5 10z" fill="#ffdf00" />
        <circle cx="15" cy="10" r="4.6" fill="#002776" />
      </>
    ),
  },
  AR: {
    name: 'Argentina',
    svg: (
      <>
        <rect width="30" height="20" fill="#74acdf" />
        <rect y="6.67" width="30" height="6.67" fill="#fff" />
        <circle cx="15" cy="10" r="1.8" fill="#f6b40e" />
      </>
    ),
  },
}

export function Flag({ code, className = 'h-3.5 w-5' }: { code: string; className?: string }) {
  const flag = FLAGS[code]
  if (!flag) {
    return <span className="rounded bg-slate-600 px-1 text-[0.6rem] font-bold">{code}</span>
  }
  return (
    <svg viewBox="0 0 30 20" className={`inline-block shrink-0 rounded-[2px] align-[-0.15em] ${className}`} role="img" aria-label={flag.name}>
      {flag.svg}
    </svg>
  )
}
