// Ofertas de times: quem se interessa pelo jogador em cada janela.

import { chance, pickWeighted, type Rng, type Roll } from './rng.ts'
import { squadRoleFor } from './player.ts'
import type { SquadRole, TeamState, TransferWindow } from './types.ts'

// Quantas ofertas podem chegar em cada janela e com que chance cada uma.
// A pré-temporada (3 → 1) é a mais movimentada; a janela 1 → 2 é a mais difícil.
export const WINDOW_OFFERS: Record<TransferWindow, { slots: number; chance: number }> = {
  '3-1': { slots: 2, chance: 0.95 },
  '2-3': { slots: 2, chance: 0.45 },
  '1-2': { slots: 1, chance: 0.3 },
}

export interface OfferCandidate {
  readonly teamId: string
  readonly expectedRole: SquadRole
}

function interest(playerOvr: number, age: number, team: TeamState): { role: SquadRole; weight: number } {
  const role = squadRoleFor(playerOvr, team.rating)
  let weight: number
  if (role === 'starter') weight = 3
  else if (role === 'reserve') weight = age <= 23 ? 2 : 0.8
  // Jogador de banco só interessa enquanto é uma aposta jovem.
  else weight = age <= 18 ? 1.5 : age <= 20 ? 0.8 : age <= 22 ? 0.3 : 0
  // Projetos ambiciosos estão contratando.
  if (team.ambitiousSince !== null) weight *= 1.8
  return { role, weight }
}

export function generateOffers(
  rng: Rng,
  teams: readonly TeamState[],
  playerOvr: number,
  age: number,
  excludeIds: readonly string[],
  slots: number,
  slotChance: number,
): Roll<OfferCandidate[]> {
  let r = rng
  const offers: OfferCandidate[] = []
  const pool = teams
    .filter((team) => !excludeIds.includes(team.id))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((team) => ({ team, ...interest(playerOvr, age, team) }))
  for (let i = 0; i < slots; i += 1) {
    const arrives = chance(r, slotChance)
    r = arrives.rng
    const remaining = pool.filter((c) => c.weight > 0 && !offers.some((o) => o.teamId === c.team.id))
    if (!arrives.value || remaining.length === 0) continue
    // Quanto menos interessante o jogador, menor a chance de a oferta chegar.
    const best = Math.max(...remaining.map((c) => c.weight))
    const interested = chance(r, Math.min(1, best / 2))
    r = interested.rng
    if (!interested.value) continue
    const picked = pickWeighted(r, remaining.map((c) => ({ item: c, weight: c.weight })))
    r = picked.rng
    offers.push({ teamId: picked.value.team.id, expectedRole: picked.value.role })
  }
  return { rng: r, value: offers }
}
