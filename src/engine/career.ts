// Orquestrador da carreira: cria a carreira, aplica decisões, simula splits
// e monta a próxima decisão. Função pura: estado + decisão → novo estado.

import { computeAwards } from './awards.ts'
import { art, in_, of } from './grammar.ts'
import {
  EVENTS_BY_KEY,
  INJURIES,
  NO_EFFECTS,
  pendingSlot,
  pickEvent,
  planEvents,
  withEffects,
  type EventContext,
  type EventDef,
} from './events.ts'
import { internationalAfter, qualifiers, simulateInternational, stageReached } from './international.ts'
import { simulateSplit, type PlayerTeamInput } from './league.ts'
import { SPLITS_PER_DECISION, type SimulationMode } from './modes.ts'
import { guaranteedOffers, type OfferCandidate, type OfferTeam } from './offers.ts'
import {
  applyDevelopment,
  createPlayer,
  rollSplitDevelopment,
  MAX_AGE,
  marketValueWithNoise,
  PLAY_CHANCE,
  shiftRole,
  squadRoleFor,
} from './player.ts'
import { chance, createRng, float, pick, pickWeighted, type Rng } from './rng.ts'
import { EMPTY_STATS, generateStats } from './stats.ts'
import { teamRatingWithPlayer } from './strength.ts'
import {
  initialTeams,
  leagueTeams,
  midseasonDrift,
  offseasonUpdate,
  teamForm,
  trendOf,
  type LeagueChange,
} from './teams.ts'
import type {
  ActiveEffects,
  Award,
  InternationalRecord,
  TeamMove,
  CareerState,
  Catalog,
  Decision,
  DecisionOption,
  Effects,
  EventChoiceOption,
  EventTeamOption,
  LeagueData,
  Player,
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

export const SAVE_VERSION = 4

// Ninguém estreia no tier 1 antes dos 18 anos.
export const MIN_TIER1_AGE = 18

// A partir desta idade, o fim de ciclo oferece a aposentadoria como uma das 3 opções.
export const VETERAN_AGE = 28

const NO_ACTIVE_EFFECTS: ActiveEffects = {
  tempOvr: 0,
  forcedRole: null,
  roleShift: 0,
  teamBonus: 0,
  titleOverride: null,
  internationalBonus: 0,
  splitsLeft: 0,
  roleSplitsLeft: 0,
}

// Chance de lesão em cada decisão (no máximo 2 por carreira).
// Chance de lesão por split jogado (aplicada a cada decisão, conforme os splits do período):
// ~0,3 lesão por carreira, em qualquer modo.
const INJURY_CHANCE_PER_SPLIT = 0.007
const MAX_INJURIES = 2

// Titular estabelecido (foi titular deste time no split anterior) só perde a vaga se ficar
// bem abaixo do nível do time: o reforço do elenco não derruba quem está rendendo.
const INCUMBENT_MARGIN = 3

function isIncumbent(state: CareerState, teamId: string): boolean {
  const last = state.history.at(-1)
  return !!last && last.teamId === teamId && last.squadRole === 'starter'
}

export function roleAt(state: CareerState, teamId: string, ovr = state.player.ovr): SquadRole {
  const team = state.teams[teamId]
  return squadRoleFor(ovr + (isIncumbent(state, teamId) ? INCUMBENT_MARGIN : 0), team.rating)
}

function rngOf(state: CareerState): Rng {
  return { seed: state.seed, state: state.rngState }
}

function clampOvr(ovr: number): number {
  return Math.max(40, Math.min(99, ovr))
}

// Ganho de OVR por evento: o talento tem margem, mas não infinita (até 2 acima do potencial).
function eventOvr(player: Player, delta: number): number {
  if (delta <= 0) return clampOvr(player.ovr + delta)
  const ceiling = Math.max(player.ovr, player.potential + 2)
  return clampOvr(Math.min(player.ovr + delta, ceiling))
}

export function ageOf(state: CareerState): number {
  return state.next.year - state.player.birthYear
}

// Região em que o jogador começa a carreira.
export function regionOf(catalog: Catalog, nationality: string): string {
  return catalog.countries[nationality]?.region ?? (nationality === 'AR' ? 'BR' : nationality)
}

// Três anos (9 splits) jogando numa região dão residência: o jogador deixa de ser importado.
export const RESIDENCY_SPLITS = 9

export function residentRegions(state: CareerState, catalog: Catalog): string[] {
  const home = regionOf(catalog, state.player.nationality)
  const earned = Object.entries(state.residency)
    .filter(([region, splits]) => region !== home && splits >= RESIDENCY_SPLITS)
    .map(([region]) => region)
  const regions = [home, ...earned]
  // Latino-americanos: dupla residência (CBLOL e LCS) até o fim da regra; depois,
  // ficam com a região onde mais jogaram.
  const dual = catalog.latamDualResidency
  if (home === 'LATAM' && dual) {
    if (state.next.year <= dual.untilYear) regions.push(...dual.regions)
    else {
      const best = [...dual.regions].sort((a, b) => (state.residency[b] ?? 0) - (state.residency[a] ?? 0))[0]
      if ((state.residency[best] ?? 0) > 0) regions.push(best)
    }
  }
  return [...new Set(regions)]
}

export function isImportIn(state: CareerState, catalog: Catalog, leagueId: string | null): boolean {
  if (!leagueId) return false
  return !residentRegions(state, catalog).includes(catalog.leagues[leagueId].region)
}

export function regionLeagues(catalog: Catalog, region: string): LeagueData[] {
  return Object.values(catalog.leagues)
    .filter((league) => league.region === region)
    .sort((a, b) => a.tier - b.tier || a.id.localeCompare(b.id))
}

export function homeLeague(catalog: Catalog, nationality: string): LeagueData {
  return regionLeagues(catalog, regionOf(catalog, nationality))[0] ?? Object.values(catalog.leagues)[0]
}

// Times que podem fazer proposta, respeitando a idade mínima do tier 1:
// - nas regiões onde o jogador é residente, todos os tiers;
// - nas outras, só o tier 1, como importado (matriz de mobilidade da pesquisa).
function offerPool(state: CareerState, catalog: Catalog, age: number, onlyRegion: string | null = null): OfferTeam[] {
  const resident = residentRegions(state, catalog)
  const home = regionOf(catalog, state.player.nationality)
  const pool: OfferTeam[] = []
  const leagues = Object.values(catalog.leagues).sort((a, b) => a.id.localeCompare(b.id))
  for (const league of leagues) {
    if (onlyRegion && league.region !== onlyRegion) continue
    if (league.tier === 1 && age < MIN_TIER1_AGE) continue
    let importFactor = 1
    if (!resident.includes(league.region)) {
      if (league.tier !== 1) continue
      importFactor = catalog.mobility[home]?.[league.region] ?? 0
      if (importFactor <= 0) continue
    } else if (league.countries && !league.countries.includes(state.player.nationality)) {
      // Liga nacional de outro país da mesma região (ex.: japonês na VCS): só como titular.
      importFactor = 0.25
    }
    for (const team of leagueTeams(state.teams, league.id)) pool.push({ team, tier: league.tier, importFactor })
  }
  return pool
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
    region: regionOf(catalog, input.nationality),
  })
  rng = player.rng
  const plan = planEvents(rng, input.mode)
  rng = plan.rng
  const base: CareerState = {
    version: SAVE_VERSION,
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
    paused: null,
    seasonPlacements: {},
    news: [],
    residency: {},
    teamMove: null,
  }

  // Primeira proposta: academies, Desafiante ou qualificatória (o tier 1 só a partir dos 18).
  const age = ageOf(base)
  const pool = offerPool(base, catalog, age)
  const offers = guaranteedOffers(rng, pool, base.player.ovr, age, [], 3, null)
  rng = offers.rng
  const chosen = [...offers.value]
  while (chosen.length < 3) {
    const remaining = pool.filter((c) => !chosen.some((o) => o.teamId === c.team.id))
    if (remaining.length === 0) break
    const extra = pick(rng, remaining.sort((a, b) => a.team.id.localeCompare(b.team.id)))
    rng = extra.rng
    chosen.push({ teamId: extra.value.team.id, expectedRole: squadRoleFor(base.player.ovr, extra.value.team.rating) })
  }
  const decision: Decision = {
    id: '0-initial_offer',
    kind: 'initial_offer',
    window: null,
    eventKey: null,
    title: 'Primeira proposta',
    description: 'Três times querem te dar a primeira chance. Escolha onde sua carreira começa.',
    options: chosen.map((offer) => teamOption('join', offer.teamId, offer.expectedRole)),
  }
  return { ...base, rngState: rng.state, decision }
}

// ---------- Fim de carreira ----------

function finish(state: CareerState, reason: RetirementReason): CareerState {
  const age = state.history.at(-1)?.age ?? ageOf(state)
  return { ...state, phase: 'summary', decision: null, retirement: { reason, age } }
}

// Botão "Encerrar carreira": disponível a qualquer momento.
// Código secreto (easter egg na tela): uma vez por carreira, sobe OVR e teto.
// Funciona como trapaça assumida: a carreira fica marcada e não conta para as conquistas.
export const SECRET_BOOST = 5

export function secretBoost(state: CareerState): CareerState {
  if (state.phase !== 'career' || state.secretBoost) return state
  const potential = Math.min(99, state.player.potential + SECRET_BOOST)
  return {
    ...state,
    secretBoost: true,
    player: { ...state.player, potential, ovr: clampOvr(Math.min(potential, state.player.ovr + SECRET_BOOST)) },
  }
}

export function retire(state: CareerState): CareerState {
  if (state.phase !== 'career') return state
  return finish({ ...state, step: state.step + 1, lastResult: null }, 'voluntary')
}

// ---------- Decisões ----------

function joinTeam(state: CareerState, teamId: string): CareerState {
  const changedTeam = teamId !== state.teamId
  return { ...state, teamId, paused: null, benchStreak: changedTeam ? 0 : state.benchStreak }
}

// Visto atrasado (caso Ceos): na primeira ida para outra região, o jogador pode perder um split.
const VISA_DELAY_CHANCE = 0.35

function visaCheck(state: CareerState, rng: Rng, catalog: Catalog): { state: CareerState; rng: Rng } {
  const team = state.teamId ? state.teams[state.teamId] : null
  const league = team?.leagueId ? catalog.leagues[team.leagueId] : null
  if (!league || !isImportIn(state, catalog, league.id) || (state.residency[league.region] ?? 0) > 0) {
    return { state, rng }
  }
  const delayed = chance(rng, VISA_DELAY_CHANCE)
  if (!delayed.value) return { state, rng: delayed.rng }
  return {
    rng: delayed.rng,
    state: {
      ...state,
      pauseSplits: state.pauseSplits + 1,
      news: [`Problemas com o visto: você vai perder o primeiro split ${in_(league)} ${league.name}.`, ...state.news],
    },
  }
}

export function decide(state: CareerState, optionId: string, catalog: Catalog): CareerState {
  if (state.phase !== 'career' || !state.decision) throw new Error('No decision to make.')
  const decision = state.decision
  const option = decision.options.find((candidate) => candidate.id === optionId)
  if (!option) throw new Error(`Unknown option: ${optionId}`)

  if (option.type === 'retire') {
    const reason = decision.kind === 'no_offers' ? 'no_offers' : 'voluntary'
    return finish({ ...state, step: state.step + 1, lastResult: null }, reason)
  }

  let rng = rngOf(state)
  let s: CareerState = { ...state, step: state.step + 1, decision: null, lastResult: null, news: [], teamMove: null }
  let effects: Effects = NO_EFFECTS

  if (option.type === 'event_choice' || option.type === 'event_join') {
    const roll = pickWeighted(rng, option.outcomes.map((outcome) => ({ item: outcome, weight: outcome.probability })))
    rng = roll.rng
    effects = withEffects(roll.value.effects)
    if (option.type === 'event_join') s = joinTeam(s, option.teamId)
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
  } else if (option.type === 'wait') {
    s = { ...s, teamId: null, paused: s.paused ?? { reason: 'free_agent', splits: 0 } }
  } else {
    s = joinTeam(s, option.teamId)
  }

  if (effects.pause === 'streamer') {
    s = { ...s, teamId: null, paused: { reason: 'streamer', splits: 0 } }
  }

  if (s.teamId !== state.teamId && s.teamId) {
    const visa = visaCheck(s, rng, catalog)
    s = visa.state
    rng = visa.rng
  }

  const period = SPLITS_PER_DECISION[s.mode]
  const hasTemporary =
    effects.tempOvr !== 0 ||
    effects.forcedRole !== null ||
    effects.roleShift !== 0 ||
    effects.teamBonus !== 0 ||
    effects.titleOverride !== null ||
    effects.internationalBonus !== 0
  s = {
    ...s,
    firstTeamId: s.firstTeamId ?? s.teamId,
    // O boost secreto sobe o teto antes do ganho, para o ganho caber no teto novo.
    player: (() => {
      const raised = { ...s.player, potential: Math.min(99, s.player.potential + (effects.potential ?? 0)) }
      return { ...raised, ovr: eventOvr(raised, effects.ovr) }
    })(),
    suspensionSplits: s.suspensionSplits + effects.suspensionSplits,
    pauseSplits: s.pauseSplits + effects.pauseSplits,
    // Sem efeito novo, mantém o que já estava valendo (ex.: evento logo antes da janela).
    effects: hasTemporary
      ? {
          tempOvr: effects.tempOvr,
          forcedRole: effects.forcedRole,
          roleShift: effects.roleShift,
          teamBonus: effects.teamBonus,
          titleOverride: effects.titleOverride,
          internationalBonus: effects.internationalBonus,
          splitsLeft: period,
          // Ganhar a vaga vale o período inteiro; perder a vaga, só o próximo split.
          roleSplitsLeft:
            effects.forcedRole === 'starter' ? period : effects.forcedRole !== null || effects.roleShift < 0 ? 1 : 0,
        }
      : s.effects,
  }

  // Evento na pré-temporada não rouba a janela: sem troca de time, a janela vem em seguida.
  const chainWindow =
    decision.kind === 'event' && decision.window === '3-1' && option.type === 'event_choice' && !s.paused
  if (chainWindow && s.teamId === state.teamId) {
    const windowDecision = nextDecision(s, rng, catalog, { forceWindow: true })
    return { ...windowDecision.state, rngState: windowDecision.rng.state }
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

// ---------- Notícias da pré-temporada ----------

function newsFor(
  changes: readonly LeagueChange[],
  catalog: Catalog,
  playerTeamId: string | null,
  region: string,
): string[] {
  const name = (id: string) => catalog.teams[id]?.name ?? id
  const data = (id: string | null) => (id ? catalog.leagues[id] : null)
  const league = (id: string | null) => data(id)?.name ?? ''
  // Só as notícias da região onde o jogador está (e as do próprio time).
  const relevant = changes.filter(
    (c) => c.teamId === playerTeamId || data(c.from)?.region === region || data(c.to)?.region === region,
  )
  const lines = relevant.map((change) => {
    const yours = change.teamId === playerTeamId ? ' (o seu time)' : ''
    switch (change.kind) {
      case 'promoted':
        return { mine: !!yours, text: `${name(change.teamId)}${yours} subiu para ${art(data(change.to))} ${league(change.to)}.` }
      case 'relegated':
        return { mine: !!yours, text: `${name(change.teamId)}${yours} caiu para ${art(data(change.to))} ${league(change.to)}.` }
      case 'left':
        return { mine: !!yours, text: `${name(change.teamId)}${yours} saiu ${of(data(change.from))} ${league(change.from)}.` }
      case 'joined':
        return { mine: !!yours, text: `${name(change.teamId)} entrou ${in_(data(change.to))} ${league(change.to)}.` }
      default:
        return { mine: !!yours, text: `${name(change.teamId)}${yours} anunciou um projeto ambicioso.` }
    }
  })
  return [...lines.filter((l) => l.mine), ...lines.filter((l) => !l.mine)].map((l) => l.text)
}

// ---------- Simulação de um split ----------

function playSplit(state: CareerState, rngIn: Rng, catalog: Catalog): { state: CareerState; rng: Rng } {
  let rng = rngIn
  const { year, index } = state.next
  const age = year - state.player.birthYear
  let player = state.player


  // Time do contrato (pode ser diferente de onde o jogador atua neste split).
  const contractTeam = state.teamId ? state.teams[state.teamId] : null
  let team = contractTeam
  let league = team?.leagueId ? catalog.leagues[team.leagueId] : null
  const effects = state.effects.splitsLeft > 0 ? state.effects : NO_ACTIVE_EFFECTS
  const roleEffects = effects.roleSplitsLeft > 0
  const ovrNow = clampOvr(player.ovr + effects.tempOvr)

  let squad: SplitRecord['squadRole']
  let outOfTeam = false
  if (state.suspensionSplits > 0) squad = 'suspended'
  else if (state.paused || state.pauseSplits > 0 || !team || !league) squad = 'paused'
  else {
    const forced = roleEffects ? effects.forcedRole : null
    squad = forced ?? shiftRole(roleAt(state, team.id, ovrNow), roleEffects ? effects.roleShift : 0)
    // No tier 1 não existe reserva que joga de vez em quando: ou é titular, ou atua no
    // academy do próprio time (menores de 18 também). Sem academy, fica fora do time.
    const underage = league.tier === 1 && age < MIN_TIER1_AGE
    if (league.tier === 1 && (underage || squad !== 'starter')) {
      const academyId = academyOf(state, catalog, team.id)
      if (academyId) {
        team = state.teams[academyId]
        league = catalog.leagues[team.leagueId!]
        squad = forced && forced !== 'starter' ? forced : squadRoleFor(ovrNow, team.rating)
      } else {
        squad = 'bench'
        outOfTeam = true
      }
    }
  }
  const plays = !outOfTeam && (squad === 'starter' || squad === 'reserve' || squad === 'bench')

  let stats = EMPTY_STATS
  let titles: Title[] = []
  let awards: Award[] = []
  let placement: number | null = null
  let leaguePlacements: Readonly<Record<string, number>> = {}

  if (team && league && !state.paused) {
    const members = leagueTeams(state.teams, league.id).sort((a, b) => a.id.localeCompare(b.id))
    // Forma do split: cada time varia um pouco de split para split (até o favorito tem split ruim).
    const form: Record<string, number> = {}
    for (const t of members) {
      const roll = float(rng, -2, 2)
      rng = roll.rng
      form[t.id] = roll.value
    }
    const bonus = effects.teamBonus + form[team.id]
    const splitTeams = members.map((t) => ({ id: t.id, rating: t.rating + (t.id === team.id ? bonus : form[t.id]) }))
    const input: PlayerTeamInput = {
      teamId: team.id,
      ratingWithPlayer: teamRatingWithPlayer(team.rating + bonus, ovrNow),
      ratingWithoutPlayer: team.rating + bonus,
      playChance: plays ? PLAY_CHANCE[squad as SquadRole] : 0,
      titleOverride: plays ? effects.titleOverride : null,
    }
    const result = simulateSplit(rng, league, splitTeams, input)
    rng = result.rng
    leaguePlacements = result.placements
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

    // Guarda as colocações do ano para acesso e rebaixamento.
    const yearPlacements: Record<string, readonly number[]> = index === 0 ? {} : { ...state.seasonPlacements }
    for (const [teamId, place] of Object.entries(result.placements)) {
      yearPlacements[teamId] = [...(yearPlacements[teamId] ?? []), place]
    }
    state = { ...state, seasonPlacements: yearPlacements }
  }

  // Torneio internacional logo depois do split (First Stand, MSI ou Worlds).
  let international: InternationalRecord | null = null
  const newsLines: string[] = []
  const event = internationalAfter(index)
  if (event) {
    const playerLeagueId = team && league && !state.paused ? league.id : null
    const picked = qualifiers(rng, event, state.teams, catalog, playerLeagueId, leaguePlacements)
    rng = picked.rng
    const qualified = team !== null && picked.teamIds.includes(team.id) && plays
    const bonus = effects.teamBonus + effects.internationalBonus
    const entrants = picked.teamIds.map((id) => ({
      id,
      rating: qualified && id === team!.id ? state.teams[id].rating + bonus : state.teams[id].rating,
    }))
    const input: PlayerTeamInput | null = qualified
      ? {
          teamId: team!.id,
          ratingWithPlayer: teamRatingWithPlayer(team!.rating + bonus, ovrNow),
          ratingWithoutPlayer: team!.rating + bonus,
          playChance: PLAY_CHANCE[squad as SquadRole],
          titleOverride: null,
        }
      : null
    const tournament = simulateInternational(rng, event, entrants, input)
    rng = tournament.rng
    const champion = catalog.teams[tournament.championId]
    newsLines.push(`${champion?.name ?? tournament.championId} é campeã do ${event.name} ${year}.`)
    if (qualified) {
      const generated = generateStats(rng, player.role, ovrNow, tournament.playerGames)
      rng = generated.rng
      const place = tournament.placements[team!.id] ?? entrants.length
      const playedKnockout = tournament.playerGames.some((game) => game.stage !== 'regular')
      const won = tournament.championId === team!.id && (squad === 'starter' || playedKnockout)
      const intlAwards: Award[] = []
      if (won && tournament.playerInFinal) {
        const mvp = chance(rng, Math.min(0.7, Math.max(0.05, 0.2 * Math.exp((ovrNow - team!.rating) / 4))))
        rng = mvp.rng
        if (mvp.value) {
          intlAwards.push({
            kind: 'international_finals_mvp',
            leagueId: event.id,
            name: `MVP da final do ${event.name}`,
            year,
            splitIndex: index,
          })
        }
      }
      international = {
        id: event.id,
        name: event.name,
        placement: place,
        stage: stageReached(event, place),
        stats: generated.value,
        titles: won ? [{ kind: event.id, leagueId: event.id, name: event.name, year, splitIndex: index, teamId: team!.id }] : [],
        awards: intlAwards,
      }
      newsLines.unshift(
        `${catalog.teams[team!.id]?.shortName ?? team!.id} no ${event.name} ${year}: ${international.stage.toLowerCase()}.`,
      )
    }
  }

  const ovrBefore = player.ovr
  // Evolução do split (minutos, idade, distância do potencial e chance de explosão).
  const growth = rollSplitDevelopment(rng, player, age, plays ? (squad as SquadRole) : 'out')
  rng = growth.rng
  let delta = growth.value.delta
  // Streamer perde ritmo: não evolui e cai um pouco a cada split.
  if (state.paused?.reason === 'streamer') delta = Math.min(0, delta) - 1
  player = applyDevelopment(player, delta)
  const value = marketValueWithNoise(rng, player.ovr, age)
  rng = value.rng
  player = { ...player, marketValue: value.value }

  const record: SplitRecord = {
    year,
    splitIndex: index,
    splitName: league && !state.paused ? league.splitNames[index] : `Split ${index + 1}`,
    leagueId: state.paused ? null : (league?.id ?? null),
    teamId: state.paused ? null : (team?.id ?? null),
    age,
    ovr: ovrBefore,
    ovrAfter: player.ovr,
    squadRole: squad,
    stats,
    placement,
    titles,
    awards,
    marketValue: player.marketValue,
    international,
    breakout: growth.value.breakout && delta >= 2,
  }

  const benchStreak = squad === 'starter' ? 0 : plays ? state.benchStreak + 1 : state.benchStreak
  const residency =
    league && !state.paused
      ? { ...state.residency, [league.region]: (state.residency[league.region] ?? 0) + 1 }
      : state.residency
  const nextEffects: ActiveEffects =
    effects.splitsLeft > 1
      ? {
          ...effects,
          splitsLeft: effects.splitsLeft - 1,
          roleSplitsLeft: Math.max(0, effects.roleSplitsLeft - 1),
          titleOverride: null,
        }
      : NO_ACTIVE_EFFECTS

  let teams = state.teams
  let news = [...state.news, ...newsLines]
  let teamMove = state.teamMove
  let finalRecord = record
  if (index === 2) {
    const surplus = squad === 'starter' && team ? player.ovr - team.rating : 0
    const update = offseasonUpdate(rng, teams, catalog, {
      year: year + 1,
      playerTeamId: team?.id ?? null,
      playerSurplus: surplus,
      placements: state.seasonPlacements,
    })
    rng = update.rng
    teams = update.teams
    news = [
      ...news,
      ...newsFor(update.changes, catalog, state.paused ? null : state.teamId, league?.region ?? regionOf(catalog, player.nationality)),
    ]
    // Registra quando o time do jogador sobe, cai ou sai da liga.
    const move =
      !state.paused && contractTeam
        ? update.changes.find((c) => c.teamId === contractTeam.id && c.kind !== 'ambitious' && c.kind !== 'joined')
        : undefined
    if (move) {
      teamMove = { kind: move.kind as TeamMove['kind'], teamId: move.teamId, from: move.from, to: move.to }
      finalRecord = { ...record, leagueChange: teamMove }
    }
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
      news,
      development: null,
      history: [...state.history, finalRecord],
      teamMove,
      residency,
      benchStreak,
      effects: nextEffects,
      paused: state.paused ? { ...state.paused, splits: state.paused.splits + 1 } : null,
      suspensionSplits: Math.max(0, state.suspensionSplits - (squad === 'suspended' ? 1 : 0)),
      pauseSplits: Math.max(0, state.pauseSplits - (squad === 'paused' && state.pauseSplits > 0 ? 1 : 0)),
      next: index === 2 ? { year: year + 1, index: 0 } : { year, index: (index + 1) as 1 | 2 },
    },
  }
}

// ---------- Próxima decisão ----------

function academyOf(state: CareerState, catalog: Catalog, teamId: string): string | null {
  const academy = Object.values(catalog.teams).find((t) => t.parentId === teamId)
  return academy && state.teams[academy.id]?.leagueId ? academy.id : null
}

function buildContext(state: CareerState, catalog: Catalog, team: TeamState, league: LeagueData): EventContext {
  const members = leagueTeams(state.teams, league.id).sort((a, b) => b.rating - a.rating)
  // Super time: mais forte, e onde o jogador ainda seria titular (no tier 1 só se contrata titular).
  const stronger = members.filter(
    (t) => t.id !== team.id && t.rating > team.rating + 1.5 && squadRoleFor(state.player.ovr, t.rating) === 'starter',
  )
  return {
    state,
    age: ageOf(state),
    team,
    league,
    squadRole: roleAt(state, team.id),
    trend: trendOf(teamForm(team, league)),
    teamRank: members.findIndex((t) => t.id === team.id) + 1,
    nextSplitName: league.splitNames[state.next.index],
    strongerTeamId: stronger[0]?.id ?? null,
    firstTeamInLeague: state.firstTeamId !== null && state.teams[state.firstTeamId]?.leagueId === league.id,
    academyId: academyOf(state, catalog, team.id),
    isAcademy: catalog.teams[team.id]?.parentId !== undefined,
    homeRegion: regionOf(catalog, state.player.nationality),
    teamRegion: league.region,
    ...moneyTarget(state, catalog, team, league),
  }
}

// Proposta milionária: um time de tier 1 mais rico e mais fraco, na região que paga melhor
// para quem é da sua origem (coreanos → China; europeus e brasileiros → América do Norte).
const MONEY_DESTINATION: Readonly<Record<string, string>> = { KR: 'CN', EU: 'NA', BR: 'NA' }

function moneyTarget(
  state: CareerState,
  catalog: Catalog,
  team: TeamState,
  league: LeagueData,
): { moneyTeamId: string | null; moneyLeagueName: string } {
  const destination = MONEY_DESTINATION[regionOf(catalog, state.player.nationality)]
  const none = { moneyTeamId: null, moneyLeagueName: '' }
  if (!destination || league.region === destination || state.player.ovr < 80) return none
  const target = Object.values(catalog.leagues).find((l) => l.region === destination && l.tier === 1)
  if (!target) return none
  const candidates = leagueTeams(state.teams, target.id)
    .filter((t) => t.rating < team.rating && t.rating >= state.player.ovr - 8)
    .sort((a, b) => b.rating - a.rating || a.id.localeCompare(b.id))
  return candidates[0] ? { moneyTeamId: candidates[0].id, moneyLeagueName: target.name } : none
}

function waitOption(state: CareerState): DecisionOption {
  return {
    id: 'wait',
    type: 'wait',
    label: state.paused?.reason === 'streamer' ? 'Seguir streamando' : 'Ficar sem time e esperar propostas',
  }
}

function offersDecision(
  state: CareerState,
  kind: 'released' | 'org_left',
  title: string,
  description: string,
  offers: readonly OfferCandidate[],
  withRetire = false,
): Decision {
  return {
    id: `${state.step}-${kind}`,
    kind,
    window: windowFor(state.next.index),
    eventKey: null,
    title,
    description,
    options: [
      ...offers.map((offer) => teamOption('join', offer.teamId, offer.expectedRole)),
      ...(withRetire ? [{ id: `retire-${state.step}`, type: 'retire' as const }] : []),
    ],
  }
}

function eventDecision(
  state: CareerState,
  rngIn: Rng,
  catalog: Catalog,
  event: EventDef,
  ctx: EventContext,
): { rng: Rng; decision: Decision | null } {
  let rng = rngIn
  const options: DecisionOption[] = []
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
    if (choice.join === 'exit' || choice.join === 'home') {
      const region = choice.join === 'home' ? ctx.homeRegion : null
      const pool = offerPool(state, catalog, ctx.age, region)
      const offers = guaranteedOffers(rng, pool, state.player.ovr, ctx.age, [ctx.team.id], 2, windowFor(state.next.index))
      rng = offers.rng
      targets = offers.value
    } else {
      const teamId =
        choice.join === 'rival'
          ? ctx.strongerTeamId
          : choice.join === 'academy'
            ? ctx.academyId
            : choice.join === 'money'
              ? ctx.moneyTeamId
              : state.firstTeamId
      if (teamId && state.teams[teamId]) {
        targets = [{ teamId, expectedRole: squadRoleFor(state.player.ovr, state.teams[teamId].rating) }]
      }
    }
    for (const target of targets) {
      const forcedStarter = choice.join === 'first_team' || choice.join === 'academy'
      const option: EventTeamOption = {
        id: `${event.key}-${choice.key}-${target.teamId}`,
        type: 'event_join',
        choiceKey: choice.key,
        label: choice.label,
        teamId: target.teamId,
        expectedRole: forcedStarter ? 'starter' : target.expectedRole,
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

function nextDecision(
  stateIn: CareerState,
  rngIn: Rng,
  catalog: Catalog,
  options: { readonly forceWindow?: boolean } = {},
): { state: CareerState; rng: Rng } {
  let rng = rngIn
  const state = stateIn
  const age = ageOf(state)
  const window = windowFor(state.next.index)
  const pool = offerPool(state, catalog, age)
  // Toda janela tem 3 cards: propostas garantidas + ficar, aposentar ou esperar.
  const offersFor = (count: number, exclude: readonly string[]) => {
    const roll = guaranteedOffers(rng, pool, state.player.ovr, age, exclude, count, window)
    rng = roll.rng
    return roll.value
  }

  // Fora do competitivo: agente livre ou streamer. 2 propostas + seguir esperando.
  if (state.paused) {
    const streamer = state.paused.reason === 'streamer'
    const offers = offersFor(2, [])
    const decision: Decision = {
      id: `${state.step}-paused`,
      kind: 'paused',
      window,
      eventKey: null,
      title: streamer ? 'Vida de streamer' : 'Agente livre',
      description: 'Chegaram propostas para você voltar ao competitivo. Ou dá para seguir esperando.',
      options: [...offers.map((offer) => teamOption('join', offer.teamId, offer.expectedRole)), waitOption(state)],
    }
    return { rng, state: { ...state, decision } }
  }

  const team = state.teamId ? state.teams[state.teamId] : null
  if (!team) {
    const decision = offersDecision(state, 'org_left', 'Sem time', 'Você está livre no mercado.', offersFor(3, []))
    return { rng, state: { ...state, decision } }
  }
  const name = catalog.teams[team.id]?.name ?? team.id

  // A organização saiu da liga: o jogador fica livre no mercado (3 propostas).
  if (team.leagueId === null) {
    const decision = offersDecision(
      state,
      'org_left',
      `A ${name} encerrou o time`,
      'A organização saiu do LoL. Você está livre no mercado.',
      offersFor(3, [team.id]),
    )
    return { rng, state: { ...state, decision } }
  }
  const league = catalog.leagues[team.leagueId]

  // Tier 1: perdeu o nível de titular. O time manda para o academy (ou libera, se não tiver).
  const role = roleAt(state, team.id)
  if (league.tier === 1 && role !== 'starter' && !options.forceWindow) {
    const academyId = academyOf(state, catalog, team.id)
    if (academyId) {
      const academy = state.teams[academyId]
      const academyName = catalog.teams[academyId]?.name ?? academyId
      const decision: Decision = {
        id: `${state.step}-demoted`,
        kind: 'demoted',
        window,
        eventKey: null,
        title: 'Rebaixado para o academy',
        description: `A ${name} se reforçou e, para ser titular, agora é preciso OVR ${Math.ceil(team.rating - 2)} (o seu é ${state.player.ovr}). O time quer que você siga na ${academyName}, ou dá para procurar outro time.`,
        options: [
          teamOption('join', academyId, squadRoleFor(state.player.ovr, academy.rating)),
          ...offersFor(2, [team.id, academyId]).map((offer) => teamOption('join', offer.teamId, offer.expectedRole)),
        ],
      }
      return { rng, state: { ...state, decision } }
    }
  }

  // Fim de ciclo (só na pré-temporada): mais comum para quem passou muito tempo sem ser titular.
  // No tier 1, sem academy e sem nível de titular, o time também libera o jogador.
  let released = league.tier === 1 && role !== 'starter' && !options.forceWindow
  if (!released && !options.forceWindow && window === '3-1' && age >= 19) {
    if (state.benchStreak >= 6) released = true
    else if (state.benchStreak >= 3) {
      const cut = chance(rng, 0.6)
      rng = cut.rng
      released = cut.value
    }
  }
  // Veteranos: a cada pré-temporada cresce a chance de o time apostar em alguém mais novo.
  if (!released && !options.forceWindow && window === '3-1' && age >= 27) {
    const renew = chance(rng, Math.min(0.9, 0.2 + 0.15 * (age - 27) + (role === 'starter' ? 0 : 0.25)))
    rng = renew.rng
    released = renew.value
  }
  if (released) {
    // Jovem: 3 times novos. Veterano: 2 times novos ou se aposentar.
    const veteran = age >= VETERAN_AGE
    const offers = offersFor(veteran ? 2 : 3, [team.id])
    const decision = offersDecision(
      state,
      'released',
      'Fim de ciclo',
      veteran
        ? `A ${name} decidiu não renovar o seu contrato. Aos ${age} anos, dá para seguir em outro time ou encerrar a carreira.`
        : `A ${name} decidiu não renovar o seu contrato. Escolha o seu próximo time.`,
      offers,
      veteran,
    )
    return { rng, state: { ...state, decision, benchStreak: 0 } }
  }

  // Lesão: rara, no máximo duas por carreira.
  if (!options.forceWindow && state.eventPlan.injuries < MAX_INJURIES && state.step > 0) {
    const hurt = chance(rng, INJURY_CHANCE_PER_SPLIT * SPLITS_PER_DECISION[state.mode])
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
          {
            id: 'injury-play',
            type: 'event_choice',
            choiceKey: 'play',
            label: 'Jogar no sacrifício',
            outcomes: [
              { probability: 0.5, text: 'Aguenta: só −1 OVR', effects: { ovr: -1 } },
              {
                probability: 0.5,
                text: `A lesão piora: ${injury.value.ovr - 2} OVR`,
                effects: { ovr: injury.value.ovr - 2 },
              },
            ],
          },
        ],
      }
      return { rng, state: { ...state, decision } }
    }
  }

  // Evento de carreira, se houver um agendado para esta idade.
  const slot = pendingSlot(state.eventPlan, age)
  if (!options.forceWindow && slot !== null && state.eventPlan.lastEventAge !== age) {
    const ctx = buildContext(state, catalog, team, league)
    const picked = pickEvent(rng, ctx, state.eventPlan)
    rng = picked.rng
    if (picked.value) {
      const built = eventDecision(state, rng, catalog, picked.value, ctx)
      rng = built.rng
      if (built.decision) {
        const plan = { ...state.eventPlan, usedSlotAges: [...state.eventPlan.usedSlotAges, slot] }
        return { rng, state: { ...state, decision: built.decision, eventPlan: plan } }
      }
    }
  }

  // Janela de transferências comum: 2 times novos + ficar no time atual.
  const cards: DecisionOption[] = []

  // Subir do academy para o time principal, se o desempenho justificar (conta como uma das 2 propostas).
  const parentId = catalog.teams[team.id]?.parentId
  const parent = parentId ? state.teams[parentId] : null
  const parentLeague = parent?.leagueId ? catalog.leagues[parent.leagueId] : null
  if (parent && parentLeague && (parentLeague.tier !== 1 || age >= MIN_TIER1_AGE)) {
    const parentRole = squadRoleFor(state.player.ovr, parent.rating)
    if (parentRole === 'starter') {
      const called = chance(rng, window === '3-1' ? 1 : 0.5)
      rng = called.rng
      if (called.value) cards.push(teamOption('join', parent.id, parentRole))
    }
  }
  const taken = cards.map((o) => ('teamId' in o ? o.teamId : ''))
  for (const offer of offersFor(2 - cards.length, [team.id, ...taken])) {
    cards.push(teamOption('join', offer.teamId, offer.expectedRole))
  }

  const decision: Decision = {
    id: `${state.step}-transfer_window`,
    kind: 'transfer_window',
    window,
    eventKey: null,
    title: window === '3-1' ? `Pré-temporada ${state.next.year}` : 'Janela de transferências',
    description: 'Chegaram propostas. Você pode aceitar uma ou ficar no time.',
    options: [...cards, teamOption('stay', team.id, role)],
  }
  return { rng, state: { ...state, decision } }
}

export function getEvent(key: string): EventDef | undefined {
  return EVENTS_BY_KEY[key]
}
