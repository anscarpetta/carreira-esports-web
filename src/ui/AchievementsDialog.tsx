import { useEffect, useRef, useState } from 'react'
import { ACHIEVEMENTS } from '../engine/achievements.ts'
import { loadUnlocked } from './achievementsStore.ts'

type Filter = 'all' | 'done' | 'pending'

export function AchievementsButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const unlocked = loadUnlocked()
  const done = ACHIEVEMENTS.filter((a) => unlocked[a.id]).length
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`rounded-xl border border-line px-4 py-2 text-sm font-bold hover:border-white/40 ${className}`}
      >
        🏅 Conquistas ({done}/{ACHIEVEMENTS.length})
      </button>
      {open && <AchievementsDialog onClose={() => setOpen(false)} />}
    </>
  )
}

function AchievementsDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const unlocked = loadUnlocked()

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open && typeof dialog.showModal === 'function') dialog.showModal()
  }, [])

  const list = ACHIEVEMENTS.filter((a) => (filter === 'all' ? true : filter === 'done' ? !!unlocked[a.id] : !unlocked[a.id]))

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) ref.current?.close()
      }}
      className="m-auto max-h-[85svh] w-[min(36rem,calc(100vw-2rem))] rounded-2xl border border-line bg-panel p-0 text-slate-100 backdrop:bg-black/70"
      aria-label="Conquistas"
    >
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Conquistas</h2>
            <p className="text-sm text-muted">Desafios que atravessam todas as suas carreiras.</p>
          </div>
          <button type="button" onClick={() => ref.current?.close()} className="rounded-lg px-2 text-xl text-muted" aria-label="Fechar">
            ×
          </button>
        </div>
        <div className="flex gap-2 text-sm">
          {(
            [
              ['all', 'Todas'],
              ['done', 'Concluídas'],
              ['pending', 'Pendentes'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-3 py-1 font-bold ${filter === key ? 'bg-gold text-night' : 'border border-line text-muted'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <ul className="flex flex-col gap-2 overflow-y-auto">
          {list.map((achievement) => {
            const date = unlocked[achievement.id]
            return (
              <li
                key={achievement.id}
                className={`flex items-center gap-3 rounded-xl border p-3 ${date ? 'border-gold/60 bg-gold/10' : 'border-line opacity-70'}`}
              >
                <span className={`text-2xl ${date ? '' : 'grayscale'}`}>{achievement.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{achievement.title}</p>
                  <p className="text-sm text-muted">{achievement.description}</p>
                  {date && (
                    <p className="text-xs text-gold-soft">Conquistada em {new Date(date).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
              </li>
            )
          })}
          {list.length === 0 && <li className="p-3 text-sm text-muted">Nada por aqui ainda.</li>}
        </ul>
      </div>
    </dialog>
  )
}
