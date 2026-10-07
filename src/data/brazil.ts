// Brasil: CBLOL (tier 1).
//
// Força inicial (rating) vem do Global Power Rankings da Riot ao fim do
// Split 2 de 2026, convertida para a escala de OVR: OVR = 80 + (Elo - 1200) / 20.
// Estrutura (0 a 5) é uma estimativa a partir do histórico de títulos
// (ver docs/pesquisa-ciclos-e-forca.md).

import type { LeagueData, TeamData } from '../engine/types.ts'

export const BRAZIL_TEAMS: readonly TeamData[] = [
  { id: 'furia', name: 'FURIA', shortName: 'FURIA', abbreviation: 'FUR', country: 'BR', structure: 4, rating: 80.8, color: '#1f1f1f', logoFile: 'FURIAlogo square.png' },
  { id: 'red-canids', name: 'RED Canids Kalunga', shortName: 'RED', abbreviation: 'RED', country: 'BR', structure: 4, rating: 79.2, color: '#d7141a', logoFile: 'RED Canidslogo square.png' },
  { id: 'vivo-keyd', name: 'Vivo Keyd Stars', shortName: 'Keyd', abbreviation: 'VKS', country: 'BR', structure: 4, rating: 78.5, color: '#6c2bd9', logoFile: 'Vivo Keyd Starslogo square.png' },
  { id: 'loud', name: 'LOUD', shortName: 'LOUD', abbreviation: 'LLL', country: 'BR', structure: 5, rating: 77.9, color: '#13c636', logoFile: 'LOUDlogo square.png' },
  { id: 'los', name: 'Los Grandes', shortName: 'LOS', abbreviation: 'LOS', country: 'BR', structure: 3, rating: 77.0, color: '#c9a227', logoFile: 'Los Grandeslogo square.png' },
  { id: 'pain', name: 'paiN Gaming', shortName: 'paiN', abbreviation: 'PNG', country: 'BR', structure: 5, rating: 76.9, color: '#b5121b', logoFile: 'PaiN Gaminglogo square.png' },
  { id: 'fluxo-w7m', name: 'Fluxo W7M', shortName: 'Fluxo', abbreviation: 'FX', country: 'BR', structure: 3, rating: 74.1, color: '#7b3fe4', logoFile: 'Fluxo W7Mlogo square.png' },
  { id: 'leviatan', name: 'Leviatán', shortName: 'Leviatán', abbreviation: 'LEV', country: 'AR', structure: 2, rating: 73.7, color: '#1aa3d9', logoFile: 'Leviatánlogo square.png' },
  // Organizações com passado no CBLOL que podem voltar quando uma vaga abre.
  { id: 'kabum', name: 'KaBuM! Esports', shortName: 'KaBuM', abbreviation: 'KBM', country: 'BR', structure: 3, rating: 74, color: '#0a5fb4', logoFile: 'KaBuM! Esportslogo square.png' },
  { id: 'intz', name: 'INTZ', shortName: 'INTZ', abbreviation: 'ITZ', country: 'BR', structure: 3, rating: 74, color: '#5b2d8e', logoFile: 'INTZlogo square.png' },
  { id: 'flamengo', name: 'Flamengo Esports', shortName: 'Flamengo', abbreviation: 'FLA', country: 'BR', structure: 3, rating: 74, color: '#c8102e', logoFile: 'Flamengo Esportslogo square.png' },
  { id: 'isurus', name: 'Isurus', shortName: 'Isurus', abbreviation: 'ISG', country: 'AR', structure: 2, rating: 73, color: '#0b6fbf', logoFile: 'Isuruslogo square.png' },
  { id: 'liberty', name: 'Liberty', shortName: 'Liberty', abbreviation: 'LBR', country: 'BR', structure: 2, rating: 73, color: '#1b998b', logoFile: 'Libertylogo square.png' },
  { id: 'rensga', name: 'Rensga', shortName: 'Rensga', abbreviation: 'RNS', country: 'BR', structure: 2, rating: 73, color: '#e8b600', logoFile: 'Rensga Esportslogo square.png' },
]

export const CBLOL: LeagueData = {
  id: 'cblol',
  name: 'CBLOL',
  region: 'BR',
  tier: 1,
  splitNames: ['CBLOL Cup', 'CBLOL Split 1', 'CBLOL Split 2'],
  ratingRange: [72, 84],
  teamIds: ['furia', 'red-canids', 'vivo-keyd', 'loud', 'los', 'pain', 'fluxo-w7m', 'leviatan'],
  reserveTeamIds: ['kabum', 'intz', 'flamengo', 'isurus', 'liberty', 'rensga'],
  format: { regularBestOf: 3, playoffTeams: 4, playoffBestOf: 5 },
}
