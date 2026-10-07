// Salva a partida no próprio navegador. Tudo protegido por try/catch:
// em janela anônima ou com armazenamento bloqueado, o jogo segue sem salvar.

import { SAVE_VERSION } from '../engine/career.ts'
import type { SimulationMode } from '../engine/modes.ts'
import type { CareerState, Role } from '../engine/types.ts'

const KEY = 'carreira-esports:save:v1'

export interface Identity {
  readonly nick: string
  readonly role: Role
  readonly nationality: string
}

export interface SaveData {
  readonly mode: SimulationMode
  readonly identity: Identity | null
  readonly career: CareerState | null
}

export function loadSave(): SaveData | null {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SaveData
    // Identidades salvas antes da fatia 3 não tinham nacionalidade.
    const data: SaveData = parsed.identity
      ? { ...parsed, identity: { ...parsed.identity, nationality: parsed.identity.nationality ?? 'BR' } }
      : parsed
    // Saves de versões antigas do motor não são compatíveis: começa de novo.
    if (data.career && data.career.version !== SAVE_VERSION) return { ...data, career: null }
    return data
  } catch {
    return null
  }
}

export function writeSave(data: SaveData): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // Sem armazenamento disponível: segue sem salvar.
  }
}

export function newSeed(): string {
  try {
    const bytes = new Uint32Array(2)
    crypto.getRandomValues(bytes)
    return `${bytes[0].toString(36)}${bytes[1].toString(36)}`
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
  }
}
