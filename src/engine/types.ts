// Tipos centrais do motor. Tudo aqui é dado puro (serializável em JSON),
// para que o estado da carreira possa ser salvo no navegador e reproduzido.

import type { SimulationMode } from './modes.ts'

export type Role = 'top' | 'jungle' | 'mid' | 'adc' | 'support'

export const ROLES: readonly Role[] = ['top', 'jungle', 'mid', 'adc', 'support']

export type DevelopmentProfile = 'early' | 'normal' | 'late'

// Papel do jogador no time durante um split.
export type SquadRole = 'starter' | 'reserve' | 'bench'

// Índice do split dentro do ano competitivo (0, 1 ou 2).
export type SplitIndex = 0 | 1 | 2

export interface SplitRef {
  readonly year: number
  readonly index: SplitIndex
}

// Janela entre dois splits: "3-1" é a pré-temporada (a mais movimentada).
export type TransferWindow = '3-1' | '1-2' | '2-3'

// ---------- Dados estáticos (catálogo) ----------

export interface LeagueFormat {
  // Melhor de quantos jogos na fase de pontos (1 ou 3).
  readonly regularBestOf: 1 | 3
  // Quantos times vão aos playoffs (4 por enquanto).
  readonly playoffTeams: 4
  readonly playoffBestOf: 3 | 5
}

export interface LeagueData {
  readonly id: string
  readonly name: string
  readonly region: string
  // Ligas nacionais: países cujos jogadores não contam como estrangeiros.
  readonly countries?: readonly string[]
  readonly tier: 1 | 2 | 3
  readonly splitNames: readonly [string, string, string]
  // Faixa de força (OVR) dos times desta liga.
  readonly ratingRange: readonly [number, number]
  readonly teamIds: readonly string[]
  // Organizações que podem entrar na liga quando outra sai (só no tier mais baixo).
  readonly reserveTeamIds: readonly string[]
  readonly format: LeagueFormat
  // Liga logo abaixo, para acesso e rebaixamento.
  readonly lowerLeagueId?: string
  // "guest_series": o convidado enfrenta o melhor de baixo numa MD5.
  // "swap": os 2 piores trocam de lugar com os 2 melhores de baixo.
  readonly promotion?: 'guest_series' | 'swap'
  readonly guestTeamIds?: readonly string[]
  // Ligas de onde sai o desafiante da vaga de convidado (padrão: só a liga de baixo).
  readonly challengerLeagueIds?: readonly string[]
  // Nome feminino ("a Qualificatória Aberta"), para os textos.
  readonly feminine?: boolean
  // Liga franqueada: times não saem nem são rebaixados.
  readonly franchised?: boolean
}

export interface TeamData {
  readonly id: string
  readonly name: string
  readonly shortName: string
  readonly abbreviation: string
  readonly country: string
  // Estrutura da organização (0 a 5): dinheiro, marca, academy.
  readonly structure: number
  // Força inicial (OVR do time na temporada de referência).
  readonly rating: number
  readonly color: string
  // Nome do arquivo do logo na Leaguepedia (baixado por scripts/fetch-logos.ts).
  readonly logoFile?: string
  // Time principal, quando este é um academy.
  readonly parentId?: string
}

export interface Region {
  readonly id: string
  readonly name: string
}

export interface Country {
  readonly code: string
  readonly name: string
  readonly region: string
}

export interface Catalog {
  readonly leagues: Readonly<Record<string, LeagueData>>
  readonly teams: Readonly<Record<string, TeamData>>
  readonly regions: Readonly<Record<string, Region>>
  readonly countries: Readonly<Record<string, Country>>
  // Chance relativa de contratar um importado: MOBILITY[origem][destino].
  readonly mobility: Readonly<Record<string, Readonly<Record<string, number>>>>
  // Dupla residência dos latino-americanos (regra de 2026).
  readonly latamDualResidency?: { readonly regions: readonly string[]; readonly untilYear: number }
  readonly startYear: number
}

// ---------- Estado dinâmico ----------

export interface TeamState {
  readonly id: string
  readonly leagueId: string | null
  readonly rating: number
  readonly structure: number
  // Projeto ambicioso ativo (ano em que começou).
  readonly ambitiousSince: number | null
  // Ocupa a vaga de convidado (sujeita a rebaixamento).
  readonly guest: boolean
}

export interface Player {
  readonly nick: string
  readonly role: Role
  readonly nationality: string
  readonly birthYear: number
  readonly ovr: number
  // Ocultos: teto e perfil de desenvolvimento.
  readonly potential: number
  readonly profile: DevelopmentProfile
  readonly marketValue: number
}

export type TitleKind = 'league' | 'first_stand' | 'msi' | 'worlds'

export interface Title {
  readonly kind: TitleKind
  readonly leagueId: string
  readonly name: string
  readonly year: number
  readonly splitIndex: SplitIndex
  readonly teamId: string
}

export type AwardKind = 'split_mvp' | 'all_pro' | 'finals_mvp' | 'international_finals_mvp'

export interface Award {
  readonly kind: AwardKind
  readonly leagueId: string
  readonly name: string
  readonly year: number
  readonly splitIndex: SplitIndex
}

export interface GameStats {
  readonly games: number
  readonly wins: number
  readonly kills: number
  readonly deaths: number
  readonly assists: number
}

export interface SplitRecord {
  readonly year: number
  readonly splitIndex: SplitIndex
  readonly splitName: string
  readonly leagueId: string | null
  readonly teamId: string | null
  readonly age: number
  readonly ovr: number
  readonly ovrAfter: number
  readonly squadRole: SquadRole | 'suspended' | 'paused'
  readonly stats: GameStats
  // Colocação final do time (1 = campeão).
  readonly placement: number | null
  readonly titles: readonly Title[]
  readonly awards: readonly Award[]
  readonly marketValue: number
  // Torneio internacional disputado logo depois deste split, se houver.
  readonly international?: InternationalRecord | null
  // O time do jogador subiu, caiu ou saiu da liga na pré-temporada seguinte a este split.
  readonly leagueChange?: TeamMove | null
}

export interface TeamMove {
  readonly kind: 'promoted' | 'relegated' | 'left'
  readonly teamId: string
  readonly from: string | null
  readonly to: string | null
}

export interface InternationalRecord {
  readonly id: TitleKind
  readonly name: string
  readonly placement: number
  readonly stage: string
  readonly stats: GameStats
  readonly titles: readonly Title[]
  readonly awards: readonly Award[]
}

// ---------- Decisões ----------

export interface TeamOption {
  readonly id: string
  readonly type: 'join' | 'stay'
  readonly teamId: string
  // Papel esperado no time, mostrado na oferta.
  readonly expectedRole: SquadRole
}

export interface Outcome {
  readonly probability: number
  readonly text: string
  readonly effects: Partial<Effects>
}

export interface EventChoiceOption {
  readonly id: string
  readonly type: 'event_choice'
  readonly choiceKey: string
  readonly label: string
  readonly outcomes: readonly Outcome[]
}

export interface EventTeamOption {
  readonly id: string
  readonly type: 'event_join'
  readonly choiceKey: string
  readonly label: string
  readonly teamId: string
  readonly expectedRole: SquadRole
  readonly outcomes: readonly Outcome[]
}

export interface RetireOption {
  readonly id: string
  readonly type: 'retire'
}

// Ficar sem time (agente livre) ou seguir streamando, esperando propostas.
export interface WaitOption {
  readonly id: string
  readonly type: 'wait'
  readonly label: string
}

export type DecisionOption = TeamOption | EventChoiceOption | EventTeamOption | RetireOption | WaitOption

export type DecisionKind =
  | 'initial_offer'
  | 'transfer_window'
  | 'released'
  | 'org_left'
  | 'no_offers'
  | 'paused'
  | 'event'

export interface Decision {
  readonly id: string
  readonly kind: DecisionKind
  readonly window: TransferWindow | null
  readonly eventKey: string | null
  readonly title: string
  readonly description: string
  readonly options: readonly DecisionOption[]
}

// ---------- Efeitos de eventos ----------

export interface Effects {
  // Mudança permanente de OVR, aplicada na hora.
  readonly ovr: number
  // Mudança temporária de OVR durante o próximo período.
  readonly tempOvr: number
  // Papel forçado durante o próximo período.
  readonly forcedRole: SquadRole | null
  // Desloca o papel (-1 = menos jogos, +1 = mais jogos).
  readonly roleShift: number
  // Splits de suspensão (não joga).
  readonly suspensionSplits: number
  // Bônus na força do time durante o próximo período.
  readonly teamBonus: number
  // Força ou impede o título no próximo split.
  readonly titleOverride: 'force' | 'skip' | null
  // Fica um split parado (burnout).
  readonly pauseSplits: number
  // Sai do competitivo para virar streamer (pode voltar depois).
  readonly pause: 'streamer' | null
  // Bônus na força do time nos torneios internacionais do período.
  readonly internationalBonus: number
}

export interface ActiveEffects {
  readonly tempOvr: number
  readonly forcedRole: SquadRole | null
  readonly roleShift: number
  readonly teamBonus: number
  readonly titleOverride: 'force' | 'skip' | null
  readonly internationalBonus: number
  // Por quantos splits os efeitos temporários ainda valem.
  readonly splitsLeft: number
}

export interface EventPlan {
  // Idades em que um evento pode acontecer.
  readonly slotAges: readonly number[]
  readonly usedSlotAges: readonly number[]
  readonly doneEventKeys: readonly string[]
  readonly lastEventAge: number | null
  readonly injuries: number
}

// Resultado da última decisão de evento, mostrado na revelação.
export interface DecisionResult {
  readonly eventTitle: string
  readonly choiceLabel: string
  readonly text: string
  // Se o resultado foi sorteado (a interface mostra suspense antes).
  readonly random: boolean
  readonly eventKey: string
}

export type RetirementReason = 'voluntary' | 'no_offers' | 'age'

export interface CareerState {
  readonly version: number
  readonly seed: string
  readonly rngState: number
  readonly mode: SimulationMode
  readonly phase: 'career' | 'summary'
  readonly step: number
  // Próximo split a ser jogado.
  readonly next: SplitRef
  readonly player: Player
  readonly teamId: string | null
  readonly firstTeamId: string | null
  readonly teams: Readonly<Record<string, TeamState>>
  readonly decision: Decision | null
  readonly history: readonly SplitRecord[]
  readonly eventPlan: EventPlan
  readonly effects: ActiveEffects
  readonly suspensionSplits: number
  readonly pauseSplits: number
  // Quantos splits seguidos o jogador passou fora da equipe titular.
  readonly benchStreak: number
  // Ano em que a evolução anual foi sorteada e quanto falta aplicar.
  readonly development: { readonly year: number; readonly remaining: readonly number[] } | null
  readonly retirement: { readonly reason: RetirementReason; readonly age: number } | null
  readonly lastResult: DecisionResult | null
  // Fora do competitivo: agente livre ou streamer.
  readonly paused: { readonly reason: 'free_agent' | 'streamer'; readonly splits: number } | null
  // Colocações do ano na liga do jogador (para acesso e rebaixamento).
  readonly seasonPlacements: Readonly<Record<string, readonly number[]>>
  // Notícias da última pré-temporada (acesso, rebaixamento, projetos).
  readonly news: readonly string[]
  // Splits jogados em cada região (3 anos numa região dão residência).
  readonly residency: Readonly<Record<string, number>>
  // Subida, queda ou saída do time do jogador na última pré-temporada (aviso em destaque).
  readonly teamMove: TeamMove | null
}
