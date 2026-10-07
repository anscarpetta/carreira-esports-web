// Brasil: CBLOL (tier 1), Circuito Desafiante (tier 2) e Qualificatória Aberta (tier 3).
//
// Força inicial (rating) do CBLOL vem do Global Power Rankings da Riot ao fim do
// Split 2 de 2026, convertida para a escala de OVR: OVR = 80 + (Elo - 1200) / 20.
// Tiers 2 e 3 não aparecem no ranking: a força é estimada pela campanha de 2026.
// Estrutura (0 a 5) é uma estimativa a partir do histórico (docs/pesquisa-ciclos-e-forca.md).

import type { LeagueData, TeamData } from '../engine/types.ts'

export const BRAZIL_TEAMS: readonly TeamData[] = [
  // CBLOL 2026
  { id: 'furia', name: 'FURIA', shortName: 'FURIA', abbreviation: 'FUR', country: 'BR', structure: 4, rating: 80.8, color: '#1f1f1f', logoFile: 'FURIAlogo square.png' },
  { id: 'red-canids', name: 'RED Canids Kalunga', shortName: 'RED', abbreviation: 'RED', country: 'BR', structure: 4, rating: 79.2, color: '#d7141a', logoFile: 'RED Canidslogo square.png' },
  { id: 'vivo-keyd', name: 'Vivo Keyd Stars', shortName: 'Keyd', abbreviation: 'VKS', country: 'BR', structure: 4, rating: 78.5, color: '#6c2bd9', logoFile: 'Vivo Keyd Starslogo square.png' },
  { id: 'loud', name: 'LOUD', shortName: 'LOUD', abbreviation: 'LLL', country: 'BR', structure: 5, rating: 77.9, color: '#13c636', logoFile: 'LOUDlogo square.png' },
  { id: 'los', name: 'Los Grandes', shortName: 'LOS', abbreviation: 'LOS', country: 'BR', structure: 3, rating: 77.0, color: '#c9a227', logoFile: 'Los Grandeslogo square.png' },
  { id: 'pain', name: 'paiN Gaming', shortName: 'paiN', abbreviation: 'PNG', country: 'BR', structure: 5, rating: 76.9, color: '#b5121b', logoFile: 'PaiN Gaminglogo square.png' },
  { id: 'fluxo-w7m', name: 'Fluxo W7M', shortName: 'Fluxo', abbreviation: 'FX', country: 'BR', structure: 3, rating: 74.1, color: '#7b3fe4', logoFile: 'Fluxo W7Mlogo square.png' },
  { id: 'leviatan', name: 'Leviatán', shortName: 'Leviatán', abbreviation: 'LEV', country: 'AR', structure: 2, rating: 73.7, color: '#1aa3d9', logoFile: 'Leviatánlogo square.png' },

  // Circuito Desafiante 2026 (Split 2)
  { id: 'estral', name: 'Estral Esports', shortName: 'Estral', abbreviation: 'EST', country: 'MX', structure: 3, rating: 71, color: '#e2231a', logoFile: 'Estral Esportslogo square.png' },
  { id: 'kabum', name: 'KaBuM! Ilha das Lendas', shortName: 'KaBuM', abbreviation: 'KBM', country: 'BR', structure: 3, rating: 70, color: '#0a5fb4', logoFile: 'KaBuM! Ilha das Lendaslogo square.png' },
  { id: 'vivo-keyd-academy', name: 'Vivo Keyd Stars Academy', shortName: 'Keyd Academy', abbreviation: 'VKA', country: 'BR', structure: 3, rating: 69, color: '#6c2bd9', logoFile: 'Vivo Keyd Stars Academylogo square.png', parentId: 'vivo-keyd' },
  { id: 'intz', name: 'INTZ', shortName: 'INTZ', abbreviation: 'ITZ', country: 'BR', structure: 3, rating: 68, color: '#5b2d8e', logoFile: 'INTZ e-Sportslogo square.png' },
  { id: 'red-academy', name: 'RED Academy', shortName: 'RED Academy', abbreviation: 'REA', country: 'BR', structure: 3, rating: 68, color: '#d7141a', logoFile: 'RED Academylogo square.png', parentId: 'red-canids' },
  { id: 'pain-academy', name: 'paiN Gaming Academy', shortName: 'paiN Academy', abbreviation: 'PNA', country: 'BR', structure: 3, rating: 67, color: '#b5121b', logoFile: 'PaiN Gaming Academylogo square.png', parentId: 'pain' },
  { id: '7rex', name: '7REX', shortName: '7REX', abbreviation: '7RX', country: 'BR', structure: 2, rating: 66, color: '#f5a623', logoFile: '7REXlogo square.png' },
  { id: 'ei-nerd', name: 'Ei Nerd Esports', shortName: 'Ei Nerd', abbreviation: 'EIN', country: 'BR', structure: 2, rating: 65, color: '#ff4f9a', logoFile: 'Ei Nerd Esportslogo square.png' },
  { id: 'rmd', name: 'RMD Gaming', shortName: 'RMD', abbreviation: 'RMD', country: 'BR', structure: 1, rating: 64, color: '#2f80ed', logoFile: 'RMD Gaminglogo square.png' },
  { id: 'team-solid', name: 'Team Solid', shortName: 'Solid', abbreviation: 'SLD', country: 'BR', structure: 1, rating: 63, color: '#27ae60' },

  // Qualificatória aberta (tier 3): times de 2026 e organizações tentando voltar.
  { id: 'barulhinhos', name: 'Barulhinhos', shortName: 'Barulhinhos', abbreviation: 'BRL', country: 'BR', structure: 1, rating: 60, color: '#f2994a', logoFile: 'Barulhinhoslogo square.png' },
  { id: 'marere', name: 'Marere Invokers', shortName: 'Marere', abbreviation: 'MRI', country: 'BR', structure: 1, rating: 59, color: '#9b51e0', logoFile: 'Marere Invokerslogo square.png' },
  { id: 'kuma', name: 'KUMA', shortName: 'KUMA', abbreviation: 'KUM', country: 'BR', structure: 1, rating: 58, color: '#4f4f4f' },
  { id: 'flamengo', name: 'Flamengo Esports', shortName: 'Flamengo', abbreviation: 'FLA', country: 'BR', structure: 3, rating: 57, color: '#c8102e', logoFile: 'Flamengo Esportslogo square.png' },
  { id: 'rampage', name: 'RAMPAGE', shortName: 'RAMPAGE', abbreviation: 'RMP', country: 'BR', structure: 1, rating: 56, color: '#eb5757' },
  { id: 'liberty', name: 'Liberty', shortName: 'Liberty', abbreviation: 'LBR', country: 'BR', structure: 2, rating: 55, color: '#1b998b', logoFile: 'Libertylogo square.png' },
  { id: 'rensga', name: 'Rensga', shortName: 'Rensga', abbreviation: 'RNS', country: 'BR', structure: 2, rating: 55, color: '#e8b600', logoFile: 'Rensga Esportslogo square.png' },
  { id: 'vorax', name: 'Vorax', shortName: 'Vorax', abbreviation: 'VRX', country: 'BR', structure: 1, rating: 54, color: '#6fcf97', logoFile: 'Voraxlogo square.png' },

  // Organizações fora da pirâmide que podem voltar quando uma vaga abre no tier 3.
  { id: 'netshoes-miners', name: 'Netshoes Miners', shortName: 'Miners', abbreviation: 'MIN', country: 'BR', structure: 2, rating: 54, color: '#ff8c00', logoFile: 'Netshoes Minerslogo square.png' },
  { id: 'isurus', name: 'Isurus', shortName: 'Isurus', abbreviation: 'ISG', country: 'AR', structure: 2, rating: 54, color: '#0b6fbf', logoFile: 'Isuruslogo square.png' },
]

export const CBLOL: LeagueData = {
  id: 'cblol',
  name: 'CBLOL',
  region: 'BR',
  tier: 1,
  splitNames: ['CBLOL Cup', 'CBLOL Split 1', 'CBLOL Split 2'],
  ratingRange: [72, 84],
  teamIds: ['furia', 'red-canids', 'vivo-keyd', 'loud', 'los', 'pain', 'fluxo-w7m', 'leviatan'],
  reserveTeamIds: [],
  format: { regularBestOf: 3, playoffTeams: 4, playoffBestOf: 5 },
  // Desde 2026, uma vaga de convidado disputa acesso contra o melhor do Desafiante.
  lowerLeagueId: 'circuito-desafiante',
  promotion: 'guest_series',
  guestTeamIds: ['los'],
}

export const CIRCUITO_DESAFIANTE: LeagueData = {
  id: 'circuito-desafiante',
  name: 'Circuito Desafiante',
  region: 'BR',
  tier: 2,
  splitNames: ['Circuito Desafiante Etapa 1', 'Circuito Desafiante Etapa 2', 'Circuito Desafiante Etapa 3'],
  ratingRange: [62, 74],
  teamIds: ['estral', 'kabum', 'vivo-keyd-academy', 'intz', 'red-academy', 'pain-academy', '7rex', 'ei-nerd', 'rmd', 'team-solid'],
  reserveTeamIds: [],
  format: { regularBestOf: 1, playoffTeams: 4, playoffBestOf: 3 },
  // Os 2 piores trocam de lugar com os 2 melhores da qualificatória.
  lowerLeagueId: 'qualificatoria-aberta',
  promotion: 'swap',
}

export const QUALIFICATORIA_ABERTA: LeagueData = {
  id: 'qualificatoria-aberta',
  name: 'Qualificatória Aberta',
  feminine: true,
  region: 'BR',
  tier: 3,
  splitNames: ['Qualificatória Aberta 1', 'Qualificatória Aberta 2', 'Qualificatória Aberta 3'],
  ratingRange: [50, 64],
  teamIds: ['barulhinhos', 'marere', 'kuma', 'flamengo', 'rampage', 'liberty', 'rensga', 'vorax'],
  reserveTeamIds: ['netshoes-miners', 'isurus'],
  format: { regularBestOf: 1, playoffTeams: 4, playoffBestOf: 3 },
}
