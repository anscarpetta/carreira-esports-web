import { useEffect } from 'react'

export interface Toast {
  readonly id: string
  readonly icon: string
  readonly text: string
}

// Comemorações de títulos e prêmios. Somem sozinhas ou com um toque.
export function Toasts({ items, onDismiss }: { items: readonly Toast[]; onDismiss: () => void }) {
  useEffect(() => {
    if (items.length === 0) return
    const id = window.setTimeout(onDismiss, 3500 + items.length * 600)
    return () => window.clearTimeout(id)
  }, [items, onDismiss])

  if (items.length === 0) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-20 flex flex-col items-center gap-2 px-4" aria-live="polite">
      {items.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={onDismiss}
          className="pointer-events-auto flex animate-[rise_0.4s_ease-out] items-center gap-3 rounded-2xl border border-gold bg-night/95 px-5 py-3 font-black text-gold-soft shadow-2xl shadow-gold/20"
        >
          <span className="text-2xl">{toast.icon}</span>
          {toast.text}
        </button>
      ))}
    </div>
  )
}
