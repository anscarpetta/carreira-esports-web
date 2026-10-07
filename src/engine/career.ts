// Orquestrador da carreira: cria a carreira, aplica decisões, simula splits
// e monta a próxima decisão. Função pura: estado + decisão → novo estado.

import { computeAwards } from './awards.ts'
import { EVENTS_BY_KEY, INJURIES, NO_EFFECTS, pendingSlot, pickEvent, planEvents, withEffects, type EventContext, type EventDef } from './events.ts'
import { simulateSplit, type PlayerTeamInput } from './league.ts'
import { SPLITS_PER_DECISION, type SimulationMode } from './modes.ts'
import { generateOffers, WINDOW_OFFERS, type OfferCandidate } from './offers.ts'
import {
  applyDevelopment,
  createPlayer,
  MAX_AGE,
  marketValueWithNoise,
  PLAY_CHANCE,
  rollYearlyDevelopment,
  shiftRole,
  squadRoleFor,
} from './player.ts'
import { chance, createRng, pick, pickWeighted, type Rng } from './rng.ts'
import { EMPTY_STATS, generateStats } from './stats.ts'
import { teamRatingWithPlayer } from './strength.ts'
import { initialTeams, leagueTeams, midseasonDrift, offseasonUpdate, teamForm, trendOf } from './teams.ts'
import type {
  ActiveEffects,
  Award,
  CareerState,
  Catalog,
  Decision,
  DecisionOption,
  Effects,
  EventChoiceOption,
  EventTeamOption,
  LeagueData,
  RetirementReason,
  Role,
  SplitRecord,
  SquadRole,
  TeamState,
  Title,
  TransferWindow,
} from './types.ts'

export interface NewCareerInput {
  readonly seed: string
  readonly mode: SimulationMode
  readonly nick: string
  readonly role: Role
  readonly nationality: string
}

const NO_ACTIVE_EFFECTS: ActiveEffects = {
  tempOvr: 0,
  forcedRole: null,
  roleShift: 0,
  teamBonus: 0,
  titleOverride: null,
  splitsLeft: 0,
}

// Chance de lesão em cada decisão (no máximo 2 por carreira).
const INJURY_CHANCE = 0.04
const MAX_INJURIES = 2

function rngOf(state: CareerState): Rng {
  return { seed: state.seed, state: state.rngState }
}

function clampOvr(ovr: number): number {
  return Math.max(40, Math.min(99, ovr))
}

export function ageOf(state: CareerState): number {
  return state.next.year - state.player.birthYear
}

// Liga de origem do jogador. Na fatia 1 só existe o CBLOL.
export function homeLeague(catalog: Catalog, nationality: string): LeagueData {
  const region = nationality === 'AR' ? 'BR' : nationality
  const leagues = Object.values(catalog.leagues).filter((league) => league.region === region)
  const league = leagues.sort((a, b) => a.tier - b.tier)[0] ?? Object.values(catalog.leagues)[0]
  return league
}

function teamOption(type: 'join' | 'stay', teamId: string, expectedRole: SquadRole): DecisionOption {
  return { id: `${type}-${teamId}`, type, teamId, expectedRole }
}

function windowFor(index: number): TransferWindow {
  return index === 0 ? '3-1' : index === 1 ? '1-2' : '2-3'
}

// ---------- Criação ----------

export function createCareer(input: NewCareerInput, catalog: Catalog): CareerState {
  let rng = createRng(input.seed)
  const player = createPlayer(rng, {
    nick: input.nick,
    role: input.role,
    nationality: input.nationality,
    startYear: catalog.startYear,
  })
  rng = player.rng
  const plan = planEvents(rng, input.mode)
  rng = plan.rng
  const base: CareerState = {
    version: 1,
    seed: input.seed,
    rngState: rng.state,
    mode: input.mode,
    phase: 'career',
    step: 0,
    next: { year: catalog.startYear, index: 0 },
    player: player.value,
    teamId: null,
    firstTeamId: null,
    teams: initialTeams(catalog),
    decision: null,
    history: [],
    eventPlan: plan.value,
    effects: NO_ACTIVE_EFFECTS,
    suspensionSplits: 0,
    pauseSplits: 0,
    benchStreak: 0,
    development: null,
    retirement: null,
    lastResult: null,
  }
  const league = homeLeague(catalog, input.nationality)
  const members = leagueTeams(base.teams, league.id).sort((a, b) => a.id.localeCompare(b.id))
  const options: DecisionOption[] = []
  let remaining = members
  for (let i = 0; i < 3 && remaining.length > 0; i += 1) {
    const choice = pick(rng, remaining)
    rng = choice.rng
    remaining = remaining.filter((team) => team.id !== choice.value.id)
    options.push(teamOption('join', choice.value.id, squadRoleFor(base.player.ovr, choice.value.rating)))
  }
  const decision: Decision = {
    id: '0-initial_offer',
    kind: 'initial_offer',
    window: null,
    eventKey: null,
    title: 'Primeira proposta',
    description: `Três times do ${league.name} querem te dar a primeira chance. Escolha onde sua carreira começa.`,
    options,
  }
  return { ...base, rngState: rng.state, decision }
}

// ---------- Fim de carreira ----------

function finish(state: CareerState, reason: RetirementReason): CareerState {
  const age = state.history.at(-1)?.age ?? ageOf(state)
  return { ...state, phase: 'summary', decision: null, retirement: { reason, age } }
}

// Botão "Encerrar carreira": disponível a qualquer momento.
export function retire(state: CareerState): CareerState {
  if (state.phase !== 'career') return state
  return finish({ ...state, step: state.step + 1, lastResult: null }, 'voluntary')
}

// ---------- Decisões ----------

export function decide(state: CareerState, optionId: string, catalog: Catalog): CareerState {
  if (state.phase !== 'career' || !state.decision) throw new Error('No decision to make.')
  const decision = state.decision
  const option = decision.options.find((candidate) => candidate.id === optionId)
  if (!option) throw new Error(`Unknown option: ${optionId}`)

  if (option.type === 'retire') {
    return finish({ ...state, step: state.step + 1, lastResult: null }, decision.kind === 'no_offers' ? 'no_offers' : 'voluntary')
  }

  let rng = rngOf(state)
  let s: CareerState = { ...state, step: state.step + 1, decision: null, lastResult: null }
  let effects: Effects = NO_EFFECTS

  if (option.type === 'event_choice' || option.type === 'event_join') {
    const roll = pickWeighted(rng, option.outcomes.map((outcome) => ({ item: outcome, weight: outcome.probability })))
    rng = roll.rng
    effects = withEffects(roll.value.effects)
    if (option.type === 'event_join') {
      const changedTeam = option.teamId !== s.teamId
      s = { ...s, teamId: option.teamId, benchStreak: changedTeam ? 0 : s.benchStreak }
    }
    const eventKey = decision.eventKey ?? ''
    const plan = s.eventPlan
    s = {
      ...s,
      lastResult: {
        eventTitle: decision.title,
        choiceLabel: option.label,
        text: roll.value.text,
        random: option.outcomes.length > 1,
        eventKey,
      },
      eventPlan: {
        ...plan,
        doneEventKeys: eventKey === 'injury' ? plan.doneEventKeys : [...plan.doneEventKeys, eventKey],
        injuries: eventKey === 'injury' ? plan.injuries + 1 : plan.injuries,
        lastEventAge: ageOf(s),
      },
    }
  } else {
    const changedTeam = option.teamId !== s.teamId
    s = { ...s, teamId: option.teamId, benchStreak: changedTeam ? 0 : s.benchStreak }
  }

  const period = SPLITS_PER_DECISION[s.mode]
  const hasTemporary =
    effects.tempOvr !== 0 ||
    effects.forcedRole !== null ||
    effects.roleShift !== 0 ||
    effects.teamBonus !== 0 ||
    effects.titleOverride !== null
  s = {
    ...s,
    firstTeamId: s.firstTeamId ?? s.teamId,
    player: { ...s.player, ovr: clampOvr(s.player.ovr + effects.ovr) },
    suspensionSplits: s.suspensionSplits + effects.suspensionSplits,
    pauseSplits: s.pauseSplits + effects.pauseSplits,
    effects: hasTemporary
      ? {
          tempOvr: effects.tempOvr,
          forcedRole: effects.forcedRole,
          roleShift: effects.roleShift,
          teamBonus: effects.teamBonus,
          titleOverride: effects.titleOverride,
          splitsLeft: period,
        }
      : NO_ACTIVE_EFFECTS,
  }

  for (let i = 0; i < period && s.phase === 'career'; i += 1) {
    const played = playSplit(s, rng, catalog)
    s = played.state
    rng = played.rng
    if (s.next.index === 0 && ageOf(s) > MAX_AGE) s = finish(s, 'age')
  }

  if (s.phase === 'career') {
    const next = nextDecision(s, rng, catalog)
    rng = next.rng
    s = next.state
  }
  return { ...s, rngState: rng.state }
}

// ---------- Simulação de um split ----------

function playSplit(state: CareerState, rngIn: Rng, catalog: Catalog): { state: CareerState; rng: Rng } {
  let rng = rngIn
  const { year, index } = state.next
  const age = year - state.player.birthYear
  let player = state.player

  let development = state.development
  if (!development || development.year !== year) {
    const roll = rollYearlyDevelopment(rng, player, age)
    rng = roll.rng
    development = { year, remaining: roll.value }
  }

  const team = state.teamId ? state.teams[state.teamId] : null
  const league = team?.leagueId ? catalog.leagues[team.leagueId] : null
  const effects = state.effects.splitsLeft > 0 ? state.effects : NO_ACTIVE_EFFECTS
  const ovrNow = clampOvr(player.ovr + effects.tempOvr)

  let squad: SplitRecord['squadRole']
  if (state.suspensionSplits > 0) squad = 'suspended'
  else if (state.pauseSplits > 0 || !team || !league) squad = 'paused'
  else squad = effects.forcedRole ?? shiftRole(squadRoleFor(ovrNow, team.rating), effects.roleShift)
  const plays = squad === 'starter' || squad === 'reserve' || squad === 'bench'

  let stats = EMPTY_STATS
  let titles: Title[] = []
  let awards: Award[] = []
  let placement: number | null = null

  if (team && league) {
    const members = leagueTeams(state.teams, league.id).sort((a, b) => a.id.localeCompare(b.id))
    const bonus = effects.teamBonus
    const splitTeams = members.map((t) => ({ id: t.id, rating: t.id === team.id ? t.rating + bonus : t.rating }))
    const input: PlayerTeamInput = {
      teamId: team.id,
      ratingWithPlayer: teamRatingWithPlayer(team.rating + bonus, ovrNow),
      ratingWithoutPlayer: team.rating + bonus,
      playChance: plays ? PLAY_CHANCE[squad as SquadRole] : 0,
      titleOverride: plays ? effects.titleOverride : null,
    }
    const result = simulateSplit(rng, league, splitTeams, input)
    rng = result.rng
    const generated = generateStats(rng, player.role, ovrNow, result.playerGames)
    rng = generated.rng
    stats = generated.value
    placement = result.placements[team.id] ?? null
    // O título conta para quem foi titular ou entrou em quadra nos playoffs.
    const playedPlayoffs = result.playerGames.some((game) => game.stage !== 'regular')
    if (result.championId === team.id && (squad === 'starter' || playedPlayoffs)) {
      titles = [
        { kind: 'league', leagueId: league.id, name: league.splitNames[index], year, splitIndex: index, teamId: team.id },
      ]
    }
    if (stats.games > 0) {
      const ratings = Object.fromEntries(splitTeams.map((t) => [t.id, t.rating]))
      const computed = computeAwards(rng, {
        league,
        year,
        splitIndex: index,
        ratings,
        standings: result.standings,
        championId: result.championId,
        playerTeamId: team.id,
        playerOvr: ovrNow,
        playerGames: stats.games,
        playerTeamGames: result.playerTeamGames,
        playerInFinal: result.playerInFinal,
      })
      rng = computed.rng
      awards = computed.value
    }
  }

  const ovrBefore = player.ovr
  player = applyDevelopment(player, development.remaining[index], age, plays ? (squad as SquadRole) : 'out')
  const value = marketValueWithNoise(rng, player.ovr, age)
  rng = value.rng
  player = { ...player, marketValue: value.value }

  const record: SplitRecord = {
    year,
    splitIndex: index,
    splitName: league ? league.splitNames[index] : `Split ${index + 1}`,
    leagueId: league?.id ?? null,
    teamId: team?.id ?? null,
    age,
    ovr: ovrBefore,
    ovrAfter: player.ovr,
    squadRole: squad,
    stats,
    placement,
    titles,
    awards,
    marketValue: player.marketValue,
  }

  const benchStreak = squad === 'starter' ? 0 : plays ? state.benchStreak + 1 : state.benchStreak
  const nextEffects: ActiveEffects =
    effects.splitsLeft > 1 ? { ...effects, splitsLeft: effects.splitsLeft - 1, titleOverride: null } : NO_ACTIVE_EFFECTS

  let teams = state.teams
  if (index === 2) {
    const surplus = squad === 'starter' && team ? player.ovr - team.rating : 0
    const update = offseasonUpdate(rng, teams, catalog, { year: year + 1, playerTeamId: team?.id ?? null, playerSurplus: surplus })
    rng = update.rng
    teams = update.teams
  } else {
    const drift = midseasonDrift(rng, teams, catalog)
    rng = drift.rng
    teams = drift.teams
  }

  return {
    rng,
    state: {
      ...state,
      player,
      teams,
      development,
      history: [...state.history, record],
      benchStreak,
      effects: nextEffects,
      suspensionSplits: Math.max(0, state.suspensionSplits - (squad === 'suspended' ? 1 : 0)),
      pauseSplits: Math.max(0, state.pauseSplits - (squad === 'paused' && state.pauseSplits > 0 ? 1 : 0)),
      next: index === 2 ? { year: year + 1, index: 0 } : { year, index: (index + 1) as 1 | 2 },
    },
  }
}

// ---------- Próxima decisão ----------

function buildContext(state: CareerState, team: TeamState, league: LeagueData): EventContext {
  const members = leagueTeams(state.teams, league.id).sort((a, b) => b.rating - a.rating)
  const stronger = members.filter((t) => t.id !== team.id && t.rating > team.rating + 1.5)
  return {
    state,
    age: ageOf(state),
    team,
    league,
    squadRole: squadRoleFor(state.player.ovr, team.rating),
    trend: trendOf(teamForm(team, league)),
    teamRank: members.findIndex((t) => t.id === team.id) + 1,
    nextSplitName: league.splitNames[state.next.index],
    strongerTeamId: stronger[0]?.id ?? null,
    firstTeamInLeague: state.firstTeamId !== null && state.teams[state.firstTeamId]?.leagueId === league.id,
  }
}

function offersDecision(
  state: CareerState,
  kind: 'released' | 'org_left',
  title: string,
  description: string,
  offers: readonly OfferCandidate[],
): Decision {
  return {
    id: `${state.step}-${kind}`,
    kind,
    window: windowFor(state.next.index),
    eventKey: null,
    title,
    description,
    options: offers.map((offer) => teamOption('join', offer.teamId, offer.expectedRole)),
  }
}

function noOffersDecision(state: CareerState, league: LeagueData): Decision {
  return {
    id: `${state.step}-no_offers`,
    kind: 'no_offers',
    window: windowFor(state.next.index),
    eventKey: null,
    title: 'Sem propostas',
    description: `Nenhum time do ${league.name} quer contar com você. É hora de encerrar a carreira.`,
    options: [{ id: 'retire-no-offers', type: 'retire' }],
  }
}

function eventDecision(
  state: CareerState,
  rngIn: Rng,
  event: EventDef,
  ctx: EventContext,
): { rng: Rng; decision: Decision | null } {
  let rng = rngIn
  const options: DecisionOption[] = []
  const members = leagueTeams(state.teams, ctx.league.id)
  for (const choice of event.choices(ctx)) {
    const outcomes = choice.outcomes.map((o) => ({ probability: o.probability, text: o.text, effects: o.effects }))
    if (!choice.join) {
      const option: EventChoiceOption = {
        id: `${event.key}-${choice.key}`,
        type: 'event_choice',
        choiceKey: choice.key,
        label: choice.label,
        outcomes,
      }
      options.push(option)
      continue
    }
    let targets: OfferCandidate[] = []
    if (choice.join === 'exit') {
      const offers = generateOffers(rng, members, state.player.ovr, ctx.age, [ctx.team.id], 2, 1)
      rng = offers.rng
      targets = offers.value
    } else {
      const teamId = choice.join === 'rival' ? ctx.strongerTeamId : state.firstTeamId
      if (teamId && state.teams[teamId]) {
        targets = [{ teamId, expectedRole: squadRoleFor(state.player.ovr, state.teams[teamId].rating) }]
      }
    }
    for (const target of targets) {
      const option: EventTeamOption = {
        id: `${event.key}-${choice.key}-${target.teamId}`,
        type: 'event_join',
        choiceKey: choice.key,
        label: choice.label,
        teamId: target.teamId,
        expectedRole: choice.join === 'first_team' ? 'starter' : target.expectedRole,
        outcomes: outcomes.length > 0 ? outcomes : [{ probability: 1, text: 'Você troca de time', effects: {} }],
      }
      options.push(option)
    }
  }
  if (options.length === 0) return { rng, decision: null }
  return {
    rng,
    decision: {
      id: `${state.step}-event-${event.key}`,
      kind: 'event',
      window: windowFor(state.next.index),
      eventKey: event.key,
      title: event.title(ctx),
      description: event.description(ctx),
      options,
    },
  }
}

function nextDecision(stateIn: CareerState, rngIn: Rng, catalog: Catalog): { state: CareerState; rng: Rng } {
  let rng = rngIn
  let state = stateIn
  const age = ageOf(state)
  const window = windowFor(state.next.index)
  const team = state.teamId ? state.teams[state.teamId] : null
  const league = team?.leagueId ? catalog.leagues[team.leagueId] : homeLeague(catalog, state.player.nationality)
  const members = leagueTeams(state.teams, league.id)

  // A organização saiu da liga: o jogador fica livre no mercado.
  if (team && team.leagueId === null) {
    const offers = generateOffers(rng, members, state.player.ovr, age, [team.id], 2, 0.9)
    rng = offers.rng
    const name = catalog.teams[team.id]?.name ?? team.id
    const decision =
      offers.value.length > 0
        ? offersDecision(
            state,
            'org_left',
            `A ${name} saiu do ${league.name}`,
            'A organização vendeu a vaga e encerrou o time de LoL. Você está livre no mercado.',
            offers.value,
          )
        : noOffersDecision(state, league)
    return { rng, state: { ...state, decision } }
  }

  if (!team) {
    return { rng, state: { ...state, decision: noOffersDecision(state, league) } }
  }

  // Fim de ciclo: depois de muito tempo fora da equipe titular, o time não renova.
  const role = squadRoleFor(state.player.ovr, team.rating)
  const released =
    window === '3-1' && age >= 21 && (state.benchStreak >= 6 || (role === 'bench' && state.benchStreak >= 3))
  if (released) {
    const offers = generateOffers(rng, members, state.player.ovr, age, [team.id], 2, 0.75)
    rng = offers.rng
    const name = catalog.teams[team.id]?.name ?? team.id
    const decision =
      offers.value.length > 0
        ? offersDecision(state, 'released', 'Fim de ciclo', `A ${name} decidiu não renovar o seu contrato.`, offers.value)
        : noOffersDecision(state, league)
    return { rng, state: { ...state, decision, benchStreak: 0 } }
  }

  // Lesão: rara, no máximo duas por carreira.
  if (state.eventPlan.injuries < MAX_INJURIES && state.step > 0) {
    const hurt = chance(rng, INJURY_CHANCE)
    rng = hurt.rng
    if (hurt.value) {
      const injury = pickWeighted(rng, INJURIES)
      rng = injury.rng
      const decision: Decision = {
        id: `${state.step}-event-injury`,
        kind: 'event',
        window,
        eventKey: 'injury',
        title: injury.value.name,
        description: 'A recuperação vai te deixar fora de ritmo por um tempo.',
        options: [
          {
            id: 'injury-recover',
            type: 'event_choice',
            choiceKey: 'recover',
            label: 'Começar a recuperação',
            outcomes: [{ probability: 1, text: `${injury.value.ovr} OVR`, effects: { ovr: injury.value.ovr } }],
          },
        ],
      }
      return { rng, state: { ...state, decision } }
    }
  }

  // Evento de carreira, se houver um agendado para esta idade.
  const slot = pendingSlot(state.eventPlan, age)
  if (slot !== null && state.eventPlan.lastEventAge !== age) {
    const ctx = buildContext(state, team, league)
    const picked = pickEvent(rng, ctx, state.eventPlan)
    rng = picked.rng
    if (picked.value) {
      const built = eventDecision(state, rng, picked.value, ctx)
      rng = built.rng
      if (built.decision) {
        const plan = { ...state.eventPlan, usedSlotAges: [...state.eventPlan.usedSlotAges, slot] }
        return { rng, state: { ...state, decision: built.decision, eventPlan: plan } }
      }
    }
  }

  // Janela de transferências comum.
  const { slots, chance: slotChance } = WINDOW_OFFERS[window]
  const offers = generateOffers(rng, members, state.player.ovr, age, [team.id], slots, slotChance)
  rng = offers.rng
  const name = catalog.teams[team.id]?.shortName ?? team.id
  const decision: Decision = {
    id: `${state.step}-transfer_window`,
    kind: 'transfer_window',
    window,
    eventKey: null,
    title: window === '3-1' ? `Pré-temporada ${state.next.year}` : 'Janela de transferências',
    description:
      offers.value.length > 0
        ? 'Chegaram propostas. Você pode aceitar uma ou ficar no time.'
        : `Nenhuma proposta nesta janela. Você segue na ${name}.`,
    options: [
      ...offers.value.map((offer) => teamOption('join', offer.teamId, offer.expectedRole)),
      teamOption('stay', team.id, role),
    ],
  }
  return { rng, state: { ...state, decision } }
}

export function getEvent(key: string): EventDef | undefined {
  return EVENTS_BY_KEY[key]
}
