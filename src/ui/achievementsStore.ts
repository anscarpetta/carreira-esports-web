// Conquistas desbloqueadas ficam no navegador (sobrevivem entre carreiras).

const KEY = 'carreira-esports:achievements:v1'

export type Unlocked = Readonly<Record<string, string>>

export function loadUnlocked(): Unlocked {
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Unlocked) : {}
  } catch {
    return {}
  }
}

// Registra as conquistas novas e devolve só as que acabaram de ser desbloqueadas.
export function unlock(ids: readonly string[]): string[] {
  const current = loadUnlocked()
  const fresh = ids.filter((id) => !current[id])
  if (fresh.length === 0) return []
  const now = new Date().toISOString()
  const next = { ...current, ...Object.fromEntries(fresh.map((id) => [id, now])) }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Sem armazenamento: as conquistas valem só nesta sessão.
  }
  return fresh
}
