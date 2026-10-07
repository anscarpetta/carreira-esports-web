// Catálogo de eventos de carreira (docs/eventos.md).
//
// Cada evento tem uma condição (só aparece no contexto certo), opções com
// resultados e probabilidades visíveis, e efeitos aplicados pelo motor.
// Os textos ficam aqui porque o jogo é só em português.

import { int, pickWeighted, type Rng, type Roll } from './rng.ts'
import type { CareerState, Effects, EventPlan, LeagueData, SquadRole, TeamState } from './types.ts'
import type { Trend } from './teams.ts'

export const NO_EFFECTS: Effects = {
  ovr: 0,
  tempOvr: 0,
  forcedRole: null,
  roleShift: 0,
  suspensionSplits: 0,
  teamBonus: 0,
  titleOverride: null,
  pauseSplits: 0,
  pause: null,
  internationalBonus: 0,
}

export interface EventContext {
  readonly state: CareerState
  readonly age: number
  readonly team: TeamState
  readonly league: LeagueData
  readonly squadRole: SquadRole
  readonly trend: Trend
  // Posição da força do time na liga (1 = mais forte).
  readonly teamRank: number
  // Nome do próximo split, usado nos textos.
  readonly nextSplitName: string
  // Time mais forte que o atual, para a "oferta do super time".
  readonly strongerTeamId: string | null
  readonly firstTeamInLeague: boolean
  // Academy do time atual, se existir e estiver ativo.
  readonly academyId: string | null
  // Região de origem do jogador e região da liga do time atual.
  readonly homeRegion: string
  readonly teamRegion: string
  // Time da "proposta milionária", se houver.
  readonly moneyTeamId: string | null
  readonly moneyLeagueName: string
}

export interface EventOutcomeDef {
  readonly probability: number
  readonly text: string
  readonly effects: Partial<Effects>
}

export interface EventChoiceDef {
  readonly key: string
  readonly label: string
  readonly outcomes: readonly EventOutcomeDef[]
  // Opções que levam a outro time: "exit" gera ofertas, "rival" é o super time,
  // "first_team" é o primeiro time da carreira, "academy" é o academy do time.
  readonly join?: 'exit' | 'rival' | 'first_team' | 'academy' | 'home' | 'money'
}

export interface EventDef {
  readonly key: string
  readonly weight: number
  readonly title: (ctx: EventContext) => string
  readonly description: (ctx: EventContext) => string
  readonly condition: (ctx: EventContext) => boolean
  readonly choices: (ctx: EventContext) => readonly EventChoiceDef[]
}

const always = (): boolean => true
const nothing: readonly EventOutcomeDef[] = [{ probability: 1, text: 'Sem mudanças', effects: {} }]

export const INJURIES: readonly { item: { name: string; ovr: number }; weight: number }[] = [
  { item: { name: 'Tendinite no punho', ovr: -2 }, weight: 30 },
  { item: { name: 'Síndrome do túnel do carpo', ovr: -3 }, weight: 20 },
  { item: { name: 'Dor nas costas', ovr: -2 }, weight: 25 },
  { item: { name: 'Lesão no punho', ovr: -4 }, weight: 15 },
  { item: { name: 'Hérnia de disco', ovr: -5 }, weight: 10 },
]

export const EVENTS: readonly EventDef[] = [
  {
    key: 'korea_bootcamp',
    weight: 60,
    title: () => 'Bootcamp na Coreia',
    description: () =>
      'O time vai passar a pré-temporada treinando na Coreia. Jogar contra os melhores pode te levar a outro nível, ou te desgastar.',
    condition: (ctx) => ctx.league.tier === 1 && ctx.squadRole !== 'bench',
    choices: () => [
      {
        key: 'go',
        label: 'Ir para a Coreia',
        outcomes: [
          { probability: 0.65, text: '+3 OVR', effects: { ovr: 3 } },
          { probability: 0.35, text: '−2 OVR (choque cultural e cansaço)', effects: { ovr: -2 } },
        ],
      },
      { key: 'stay', label: 'Treinar em casa', outcomes: nothing },
    ],
  },
  {
    key: 'soloq_marathon',
    weight: 100,
    title: () => 'Maratona de solo queue',
    description: () =>
      'Você pode virar noites na fila ranqueada para chegar ao topo do Challenger. Evolução garantida, se o punho aguentar.',
    condition: always,
    choices: () => [
      {
        key: 'grind',
        label: 'Virar as noites',
        outcomes: [
          { probability: 0.7, text: '+3 OVR', effects: { ovr: 3 } },
          { probability: 0.3, text: 'Tendinite: −2 OVR', effects: { ovr: -2 } },
        ],
      },
      { key: 'rest', label: 'Priorizar o descanso', outcomes: nothing },
    ],
  },
  {
    key: 'mechanics_coach',
    weight: 100,
    title: () => 'Coach de mecânica',
    description: () => 'Um coach propõe mudar sua mecânica de lane. Pode refinar seu jogo ou te desregular.',
    condition: always,
    choices: () => [
      {
        key: 'change',
        label: 'Mudar a mecânica',
        outcomes: [
          { probability: 0.5, text: '+2 OVR', effects: { ovr: 2 } },
          { probability: 0.5, text: '−2 OVR', effects: { ovr: -2 } },
        ],
      },
      { key: 'keep', label: 'Manter o seu jogo', outcomes: nothing },
    ],
  },
  {
    key: 'new_setup',
    weight: 50,
    title: () => 'Setup novo',
    description: () =>
      'Uma marca oferece mouse, teclado e cadeira novos. Trocar de setup no meio da temporada é arriscado.',
    condition: always,
    choices: () => [
      {
        key: 'switch',
        label: 'Trocar o setup',
        outcomes: [
          { probability: 0.7, text: '+2 OVR', effects: { ovr: 2 } },
          { probability: 0.3, text: '−2 OVR', effects: { ovr: -2 } },
        ],
      },
      { key: 'keep', label: 'Manter o setup', outcomes: nothing },
    ],
  },
  {
    key: 'shady_stimulant',
    weight: 20,
    title: () => 'Estimulante de origem duvidosa',
    description: () => 'Alguém do circuito oferece um "remédio para foco". Ninguém precisa saber.',
    condition: always,
    choices: () => [
      {
        key: 'take',
        label: 'Tomar',
        outcomes: [
          { probability: 0.75, text: '+5 OVR', effects: { ovr: 5 } },
          { probability: 0.25, text: 'Pego no antidoping: suspensão de 2 splits', effects: { suspensionSplits: 2 } },
        ],
      },
      { key: 'refuse', label: 'Recusar', outcomes: nothing },
    ],
  },
  {
    key: 'patch_meta',
    weight: 100,
    title: () => 'O patch enterrou seus campeões',
    description: () => 'O novo patch acabou com os campeões do seu pool. O meta mudou de vez.',
    condition: always,
    choices: () => [
      {
        key: 'adapt',
        label: 'Ampliar o pool',
        outcomes: [
          { probability: 0.5, text: '+2 OVR', effects: { ovr: 2 } },
          { probability: 0.5, text: '−2 OVR', effects: { ovr: -2 } },
        ],
      },
      {
        key: 'insist',
        label: 'Insistir nos seus campeões',
        outcomes: [{ probability: 1, text: '−2 OVR temporário', effects: { tempOvr: -2 } }],
      },
    ],
  },
  {
    key: 'role_swap',
    weight: 100,
    title: () => 'Troca de rota',
    description: () => 'O coach precisa de você em outra rota por um tempo.',
    condition: always,
    choices: () => [
      {
        key: 'accept',
        label: 'Aceitar',
        outcomes: [
          {
            probability: 1,
            text: 'Titular no período, mas −2 OVR temporário',
            effects: { forcedRole: 'starter', tempOvr: -2 },
          },
        ],
      },
      {
        key: 'refuse',
        label: 'Recusar',
        outcomes: [{ probability: 1, text: 'Menos jogos no período', effects: { roleShift: -1 } }],
      },
    ],
  },
  {
    key: 'korean_import',
    weight: 100,
    title: () => 'Importado coreano na sua vaga',
    description: () => 'O time contratou um coreano da sua rota para disputar a vaga com você.',
    condition: (ctx) => ctx.squadRole === 'starter',
    choices: () => [
      {
        key: 'compete',
        label: 'Disputar a vaga',
        outcomes: [
          { probability: 0.5, text: 'Você segue titular', effects: { forcedRole: 'starter' } },
          { probability: 0.5, text: 'Reserva no período', effects: { forcedRole: 'reserve' } },
        ],
      },
    ],
  },
  {
    key: 'academy_prodigy',
    weight: 45,
    title: () => 'Prodígio do academy',
    description: () => 'Um garoto de 17 anos da sua rota está voando no academy e quer a sua vaga.',
    condition: (ctx) => ctx.age >= 22 && ctx.squadRole === 'starter',
    choices: () => [
      {
        key: 'mentor',
        label: 'Ser mentor dele',
        outcomes: [
          {
            probability: 1,
            text: 'Mais chance de título, menos jogos para você',
            effects: { teamBonus: 1.5, roleShift: -1 },
          },
        ],
      },
      { key: 'exit', label: 'Buscar saída', join: 'exit', outcomes: [] },
    ],
  },
  {
    key: 'super_team',
    weight: 80,
    title: () => 'O super time te quer',
    description: () => 'Um dos gigantes do CBLOL quer montar um super time e te chamou.',
    condition: (ctx) => ctx.squadRole === 'starter' && ctx.strongerTeamId !== null,
    choices: () => [
      {
        key: 'accept',
        label: 'Ir para o super time',
        join: 'rival',
        outcomes: [{ probability: 1, text: 'Mais chance de título, mas a vaga não é garantida', effects: {} }],
      },
      {
        key: 'refuse',
        label: 'Ficar',
        outcomes: [{ probability: 1, text: 'Você segue titular', effects: { forcedRole: 'starter' } }],
      },
    ],
  },
  {
    key: 'unpaid_salaries',
    weight: 45,
    title: () => 'Salários atrasados',
    description: () => 'A organização está há meses sem pagar o elenco.',
    condition: (ctx) => ctx.team.structure <= 3,
    choices: () => [
      {
        key: 'stay',
        label: 'Ficar e lutar',
        outcomes: [{ probability: 1, text: 'Menos chance de título', effects: { teamBonus: -2 } }],
      },
      { key: 'exit', label: 'Buscar saída', join: 'exit', outcomes: [] },
    ],
  },
  {
    key: 'twitter_hate',
    weight: 80,
    title: () => 'Hate no Twitter',
    description: () => 'A torcida culpa você pela fase ruim do time e pede a sua saída.',
    condition: (ctx) => ctx.age >= 20 && (ctx.trend === 'falling' || ctx.trend === 'down'),
    choices: () => [
      {
        key: 'stay',
        label: 'Ficar e responder em quadra',
        outcomes: [{ probability: 1, text: '−2 OVR temporário (pressão)', effects: { tempOvr: -2 } }],
      },
      { key: 'exit', label: 'Sair do time', join: 'exit', outcomes: [] },
    ],
  },
  {
    key: 'triumphant_return',
    weight: 50,
    title: () => 'Retorno triunfal',
    description: () => 'Seu primeiro time quer você de volta, como titular, para fechar a carreira em casa.',
    condition: (ctx) => ctx.age >= 25 && ctx.firstTeamInLeague && ctx.state.teamId !== ctx.state.firstTeamId,
    choices: () => [
      {
        key: 'return',
        label: 'Voltar',
        join: 'first_team',
        outcomes: [{ probability: 1, text: 'Titular no período', effects: { forcedRole: 'starter' } }],
      },
      { key: 'stay', label: 'Seguir no time atual', outcomes: nothing },
    ],
  },
  {
    key: 'soloq_flame',
    weight: 100,
    title: () => 'Flame na solo queue',
    description: () => 'Um clipe seu xingando um aliado viralizou, e a Riot está de olho.',
    condition: always,
    choices: () => [
      {
        key: 'apologize',
        label: 'Pedir desculpas',
        outcomes: [{ probability: 1, text: 'Menos jogos no período', effects: { roleShift: -1 } }],
      },
      {
        key: 'ignore',
        label: 'Ignorar',
        outcomes: [
          { probability: 0.5, text: 'Nada acontece', effects: {} },
          { probability: 0.5, text: 'Suspensão de 1 split', effects: { suspensionSplits: 1 } },
        ],
      },
    ],
  },
  {
    key: 'criticized_coach',
    weight: 45,
    title: () => 'Criticou o coach na live',
    description: () => 'Depois de uma derrota dura, você criticou o coach ao vivo. O clima pesou.',
    condition: always,
    choices: () => [
      {
        key: 'apologize',
        label: 'Pedir desculpas',
        outcomes: [{ probability: 1, text: 'Menos jogos no período', effects: { roleShift: -1 } }],
      },
    ],
  },
  {
    key: 'family_post',
    weight: 35,
    title: () => 'Familiar critica o time',
    description: () => 'Seu irmão detonou o time nas redes sociais.',
    condition: always,
    choices: () => [
      {
        key: 'support_family',
        label: 'Apoiar seu irmão',
        outcomes: [{ probability: 1, text: 'Menos jogos no período', effects: { roleShift: -1 } }],
      },
      {
        key: 'support_team',
        label: 'Apoiar o time',
        outcomes: [{ probability: 1, text: '−2 OVR temporário (clima ruim em casa)', effects: { tempOvr: -2 } }],
      },
    ],
  },
  {
    key: 'match_fixing',
    weight: 20,
    title: () => 'Proposta de manipulação',
    description: () => 'Um apostador oferece dinheiro para você entregar um jogo.',
    condition: always,
    choices: () => [
      {
        key: 'accept',
        label: 'Aceitar',
        outcomes: [
          { probability: 0.5, text: '+2 OVR (ninguém descobre)', effects: { ovr: 2 } },
          { probability: 0.5, text: 'Banimento de 6 splits', effects: { suspensionSplits: 6 } },
        ],
      },
      { key: 'refuse', label: 'Recusar', outcomes: [{ probability: 1, text: 'Nada acontece', effects: {} }] },
    ],
  },
  {
    key: 'finish_school',
    weight: 35,
    title: () => 'Terminar os estudos',
    description: () => 'Sua família quer que você conclua o ensino médio junto com a carreira.',
    condition: (ctx) => ctx.age <= 18,
    choices: () => [
      {
        key: 'accept',
        label: 'Estudar',
        outcomes: [
          { probability: 1, text: '+1 OVR (maturidade), menos jogos no período', effects: { ovr: 1, roleShift: -1 } },
        ],
      },
      { key: 'refuse', label: 'Focar só no jogo', outcomes: nothing },
    ],
  },
  {
    key: 'burnout',
    weight: 60,
    title: () => 'Burnout',
    description: () => 'Meses de treino sem folga cobraram o preço. Você está esgotado.',
    condition: (ctx) => ctx.age >= 19 && ctx.squadRole === 'starter',
    choices: () => [
      {
        key: 'rest',
        label: 'Parar um split',
        outcomes: [{ probability: 1, text: 'Fica 1 split fora e volta inteiro', effects: { pauseSplits: 1 } }],
      },
      {
        key: 'push',
        label: 'Seguir jogando',
        outcomes: [
          { probability: 0.5, text: 'Nada acontece', effects: {} },
          { probability: 0.5, text: '−3 OVR', effects: { ovr: -3 } },
        ],
      },
    ],
  },
  {
    key: 'play_through_pain',
    weight: 20,
    title: () => 'Jogar com dor',
    description: (ctx) => `Uma dor no punho apareceu às vésperas dos playoffs do ${ctx.nextSplitName}.`,
    condition: (ctx) => ctx.squadRole === 'starter' && ctx.teamRank <= 2,
    choices: () => [
      {
        key: 'play',
        label: 'Jogar assim mesmo',
        outcomes: [
          { probability: 0.6, text: 'Título', effects: { titleOverride: 'force' } },
          { probability: 0.4, text: 'A dor piora: −1 OVR e sem título', effects: { ovr: -1, titleOverride: 'skip' } },
        ],
      },
      {
        key: 'recover',
        label: 'Se recuperar',
        outcomes: [{ probability: 1, text: 'Baixa chance de título', effects: { teamBonus: -3 } }],
      },
    ],
  },
  {
    key: 'baron_call',
    weight: 20,
    title: () => 'A call do Barão',
    description: (ctx) =>
      `Final do ${ctx.nextSplitName}, jogo 5, 35 minutos. O Barão está de pé e o Ancião nasce em um minuto. A call é sua.`,
    condition: (ctx) => ctx.squadRole === 'starter' && ctx.teamRank <= 2,
    choices: () => [
      {
        key: 'baron',
        label: 'Forçar o Barão',
        outcomes: [
          { probability: 0.5, text: 'Título', effects: { titleOverride: 'force' } },
          { probability: 0.5, text: 'Vice', effects: { titleOverride: 'skip' } },
        ],
      },
      {
        key: 'elder',
        label: 'Esperar o Ancião',
        outcomes: [
          { probability: 0.5, text: 'Título', effects: { titleOverride: 'force' } },
          { probability: 0.5, text: 'Vice', effects: { titleOverride: 'skip' } },
        ],
      },
    ],
  },
]

export const SLICE_2_EVENTS: readonly EventDef[] = [
  {
    key: 'academy_demotion',
    weight: 70,
    title: () => 'De volta ao academy',
    description: () => 'Você quase não está jogando. O coach quer que você ganhe ritmo no academy.',
    condition: (ctx) => ctx.league.tier === 1 && ctx.squadRole !== 'starter' && ctx.age <= 22 && ctx.academyId !== null,
    choices: () => [
      {
        key: 'accept',
        label: 'Descer para o academy',
        join: 'academy',
        outcomes: [{ probability: 1, text: 'Titular no academy no período', effects: { forcedRole: 'starter' } }],
      },
      { key: 'exit', label: 'Pedir para sair', join: 'exit', outcomes: [] },
    ],
  },
  {
    key: 'streamer_offer',
    weight: 50,
    title: () => 'Proposta para virar streamer',
    description: () =>
      'Uma plataforma oferece um contrato para você largar o competitivo e fazer lives. Dá para voltar depois… se alguém ainda te quiser.',
    condition: (ctx) => ctx.age >= 19,
    choices: () => [
      {
        key: 'accept',
        label: 'Virar streamer',
        outcomes: [{ probability: 1, text: 'Você sai do competitivo (pode voltar)', effects: { pause: 'streamer' } }],
      },
      { key: 'refuse', label: 'Seguir no competitivo', outcomes: nothing },
    ],
  },
]

export const SLICE_3_EVENTS: readonly EventDef[] = [
  {
    key: 'homesick',
    weight: 70,
    title: () => 'Saudade de casa',
    description: () =>
      'Longe da família, da comida e da língua, o rendimento começa a cair. Sua família pede que você volte.',
    condition: (ctx) => ctx.teamRegion !== ctx.homeRegion && ctx.age >= 19,
    choices: () => [
      {
        key: 'stay',
        label: 'Ficar',
        outcomes: [{ probability: 1, text: '−5 OVR temporário (saudade)', effects: { tempOvr: -5 } }],
      },
      { key: 'return', label: 'Voltar para casa', join: 'home', outcomes: [] },
    ],
  },
  {
    key: 'money_offer',
    weight: 70,
    title: (ctx) => `Proposta milionária da ${ctx.moneyLeagueName}`,
    description: () => 'Um time mais fraco, mas muito mais rico, oferece um salário que você nunca viu.',
    condition: (ctx) => ctx.moneyTeamId !== null,
    choices: () => [
      {
        key: 'accept',
        label: 'Aceitar a proposta',
        join: 'money',
        outcomes: [
          { probability: 0.5, text: '+2 OVR (motivado pelo novo desafio)', effects: { ovr: 2 } },
          { probability: 0.5, text: '−2 OVR (se acomodou)', effects: { ovr: -2 } },
        ],
      },
      { key: 'refuse', label: 'Ficar e brigar por títulos', outcomes: nothing },
    ],
  },
]

export const SLICE_4_EVENTS: readonly EventDef[] = [
  {
    key: 'club_priority',
    weight: 80,
    title: () => 'Liga ou internacional?',
    description: () =>
      'A comissão técnica quer focar a preparação. Treinar para a liga ou guardar estratégias para os internacionais?',
    condition: (ctx) => ctx.squadRole === 'starter' && ctx.league.tier === 1 && ctx.teamRank <= 3,
    choices: () => [
      {
        key: 'league',
        label: 'Priorizar a liga',
        outcomes: [
          {
            probability: 1,
            text: 'Mais chance na liga, menos nos internacionais',
            effects: { teamBonus: 1.5, internationalBonus: -3 },
          },
        ],
      },
      {
        key: 'international',
        label: 'Priorizar os internacionais',
        outcomes: [
          {
            probability: 1,
            text: 'Mais chance nos internacionais, menos na liga',
            effects: { teamBonus: -1.5, internationalBonus: 3 },
          },
        ],
      },
    ],
  },
]

export const ALL_EVENTS: readonly EventDef[] = [...EVENTS, ...SLICE_2_EVENTS, ...SLICE_3_EVENTS, ...SLICE_4_EVENTS]

export const EVENTS_BY_KEY: Readonly<Record<string, EventDef>> = Object.fromEntries(
  ALL_EVENTS.map((event) => [event.key, event]),
)

// Quantos eventos cada modo terá na carreira (mín, máx).
const EVENT_COUNT: Record<CareerState['mode'], readonly [number, number]> = {
  intense: [7, 9],
  normal: [3, 4],
  express: [2, 2],
}

const SLOT_AGES = [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]

export function planEvents(rng: Rng, mode: CareerState['mode']): Roll<EventPlan> {
  const [min, max] = EVENT_COUNT[mode]
  const count = int(rng, min, max)
  let r = count.rng
  const available = [...SLOT_AGES]
  const chosen: number[] = []
  for (let i = 0; i < count.value && available.length > 0; i += 1) {
    const roll = int(r, 0, available.length - 1)
    r = roll.rng
    chosen.push(available[roll.value])
    available.splice(roll.value, 1)
  }
  chosen.sort((a, b) => a - b)
  return {
    rng: r,
    value: { slotAges: chosen, usedSlotAges: [], doneEventKeys: [], lastEventAge: null, injuries: 0 },
  }
}

export function pendingSlot(plan: EventPlan, age: number): number | null {
  return plan.slotAges.find((slot) => slot <= age && !plan.usedSlotAges.includes(slot)) ?? null
}

export function pickEvent(rng: Rng, ctx: EventContext, plan: EventPlan): Roll<EventDef | null> {
  const eligible = ALL_EVENTS.filter((event) => !plan.doneEventKeys.includes(event.key) && event.condition(ctx))
  if (eligible.length === 0) return { rng, value: null }
  return pickWeighted(rng, eligible.map((event) => ({ item: event as EventDef | null, weight: event.weight })))
}

export function withEffects(partial: Partial<Effects>): Effects {
  return { ...NO_EFFECTS, ...partial }
}
