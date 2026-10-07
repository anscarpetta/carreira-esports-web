// Pacífico: LCP (tier 1) e as ligas nacionais de tier 2 (VCS, LJL e PCS), com os times de 2026.
//
// Força do tier 1: Global Power Rankings da Riot de 13/07/2026 (pós-MSI),
// convertido para OVR: OVR = 80 + (Elo - 1200) / 22. Tier 2: força estimada.
// A LCP tem vagas de convidado: os convidados enfrentam os melhores das ligas nacionais.

import type { LeagueData, TeamData } from '../engine/types.ts'

export const PACIFIC_TEAMS: readonly TeamData[] = [
  // LCP
  { id: 'secret-whales', name: 'Team Secret Whales', shortName: 'Secret Whales', abbreviation: 'TSW', country: 'VN', structure: 3, rating: 86.0, color: '#1d1d1b', logoFile: 'Team Secret Whaleslogo square.png' },
  { id: 'cfo', name: 'CTBC Flying Oyster', shortName: 'CFO', abbreviation: 'CFO', country: 'TW', structure: 4, rating: 85.7, color: '#e40046', logoFile: 'CTBC Flying Oysterlogo square.png' },
  { id: 'gam', name: 'GAM Esports', shortName: 'GAM', abbreviation: 'GAM', country: 'VN', structure: 4, rating: 83.5, color: '#f7b500', logoFile: 'GAM Esportslogo square.png' },
  { id: 'dcg', name: 'Deep Cross Gaming', shortName: 'DCG', abbreviation: 'DCG', country: 'TW', structure: 3, rating: 83.0, color: '#00a0e9', logoFile: 'Deep Cross Gaminglogo square.png' },
  { id: 'mvk', name: 'MVK Esports', shortName: 'MVK', abbreviation: 'MVK', country: 'VN', structure: 2, rating: 82.0, color: '#d50000', logoFile: 'MVK Esportslogo square.png' },
  { id: 'shg', name: 'Fukuoka SoftBank HAWKS gaming', shortName: 'SHG', abbreviation: 'SHG', country: 'JP', structure: 3, rating: 79.5, color: '#f7c600', logoFile: 'Fukuoka SoftBank HAWKS gaminglogo square.png' },
  { id: 'gz', name: 'Ground Zero Gaming', shortName: 'GZ', abbreviation: 'GZ', country: 'AU', structure: 2, rating: 77.0, color: '#0e1b2b', logoFile: 'Ground Zero Gaminglogo square.png' },
  { id: 'dfm', name: 'DetonatioN FocusMe', shortName: 'DFM', abbreviation: 'DFM', country: 'JP', structure: 3, rating: 75.3, color: '#0057b8', logoFile: 'DetonatioN FocusMelogo square.png' },

  // VCS (Vietnã)
  { id: 'mvk-academy', name: 'MVK Academy', shortName: 'MVK Academy', abbreviation: 'MVA', country: 'VN', structure: 2, rating: 72, color: '#d50000', logoFile: 'MVK Esportslogo square.png', parentId: 'mvk' },
  { id: 'saigon-dino', name: 'Saigon Dino', shortName: 'Dino', abbreviation: 'SGD', country: 'VN', structure: 2, rating: 71, color: '#43a047', logoFile: 'Saigon Dinologo square.png' },
  { id: 'cybercore', name: 'Cybercore Esports', shortName: 'Cybercore', abbreviation: 'CC', country: 'VN', structure: 2, rating: 70, color: '#00bcd4', logoFile: 'Cybercore Esportslogo square.png' },
  { id: '9gaming', name: '9Gaming', shortName: '9Gaming', abbreviation: '9G', country: 'VN', structure: 1, rating: 68, color: '#212121', logoFile: '9Gaminglogo square.png' },
  { id: 'ngua-hi', name: 'Ngựa Hí Esports', shortName: 'Ngựa Hí', abbreviation: 'NHE', country: 'VN', structure: 1, rating: 67, color: '#6d4c41', logoFile: 'Ngựa Hí Esportslogo square.png' },
  { id: 'saigon-warriors', name: 'Saigon Warriors', shortName: 'Saigon Warriors', abbreviation: 'SGW', country: 'VN', structure: 1, rating: 66, color: '#c62828', logoFile: 'Saigon Warriorslogo square.png' },

  // LJL (Japão)
  { id: 'dfm-academy', name: 'DetonatioN FocusMe Academy', shortName: 'DFM Academy', abbreviation: 'DFA', country: 'JP', structure: 2, rating: 66, color: '#0057b8', logoFile: 'DetonatioN FocusMelogo square.png', parentId: 'dfm' },
  { id: 'fennel', name: 'FENNEL', shortName: 'FENNEL', abbreviation: 'FL', country: 'JP', structure: 2, rating: 65, color: '#8bc34a', logoFile: 'FENNELlogo square.png' },
  { id: 'rising-gaming', name: 'Rising Gaming', shortName: 'Rising', abbreviation: 'RG', country: 'JP', structure: 1, rating: 64, color: '#ff7043', logoFile: 'Rising Gaminglogo square.png' },
  { id: 'l-guide', name: 'L Guide Gaming', shortName: 'L Guide', abbreviation: 'LGG', country: 'JP', structure: 1, rating: 63, color: '#5c6bc0', logoFile: 'L Guide Gaminglogo square.png' },
  { id: 'rayn-clocks', name: 'RAYN Clocks', shortName: 'RAYN', abbreviation: 'RYN', country: 'JP', structure: 1, rating: 62, color: '#26a69a', logoFile: 'RAYN Clockslogo square.png' },
  { id: 'new-meta', name: 'New Meta', shortName: 'New Meta', abbreviation: 'NM', country: 'JP', structure: 1, rating: 61, color: '#ab47bc', logoFile: 'New Metalogo square.png' },
  { id: 'arneb', name: 'Arneb', shortName: 'Arneb', abbreviation: 'ARN', country: 'JP', structure: 1, rating: 60, color: '#78909c', logoFile: 'Arneblogo square.png' },
  { id: 'uwinks', name: 'Uwinks', shortName: 'Uwinks', abbreviation: 'UWK', country: 'JP', structure: 1, rating: 59, color: '#ec407a', logoFile: 'Uwinkslogo square.png' },

  // PCS (Taiwan, Hong Kong e Oceania)
  { id: 'cfo-academy', name: 'CTBC Flying Oyster Academy', shortName: 'CFO Academy', abbreviation: 'CFA', country: 'TW', structure: 3, rating: 71, color: '#e40046', logoFile: 'CTBC Flying Oysterlogo square.png', parentId: 'cfo' },
  { id: 'frank', name: 'Frank Esports', shortName: 'Frank', abbreviation: 'FAK', country: 'HK', structure: 2, rating: 69, color: '#ffb300', logoFile: 'Frank Esportslogo square.png' },
  { id: 'gz-academy', name: 'Ground Zero Academy', shortName: 'GZ Academy', abbreviation: 'GZA', country: 'AU', structure: 2, rating: 67, color: '#0e1b2b', logoFile: 'Ground Zero Gaminglogo square.png', parentId: 'gz' },
  { id: 'sillysilly', name: 'SillySilly Gaming', shortName: 'SillySilly', abbreviation: 'SSG', country: 'TW', structure: 1, rating: 66, color: '#7e57c2', logoFile: 'SillySilly Gaminglogo square.png' },
  { id: 'ewh', name: 'Embrace Whatever Happens', shortName: 'EWH', abbreviation: 'EWH', country: 'TW', structure: 1, rating: 65, color: '#29b6f6', logoFile: 'Embrace Whatever Happenslogo square.png' },
  { id: 'reignfall', name: 'Reignfall', shortName: 'Reignfall', abbreviation: 'RF', country: 'TW', structure: 1, rating: 64, color: '#455a64', logoFile: 'Reignfalllogo square.png' },
  { id: 'rogersama', name: 'RogerSaMa', shortName: 'RogerSaMa', abbreviation: 'RSM', country: 'TW', structure: 1, rating: 63, color: '#8d6e63', logoFile: 'RogerSaMalogo square.png' },
  { id: 'sponge', name: 'Sponge Gaming', shortName: 'Sponge', abbreviation: 'SPG', country: 'TW', structure: 1, rating: 62, color: '#fdd835', logoFile: 'Sponge Gaminglogo square.png' },
]

export const LCP: LeagueData = {
  id: 'lcp',
  name: 'LCP',
  feminine: true,
  region: 'PAC',
  tier: 1,
  splitNames: ['LCP Kickoff', 'LCP Split 2', 'LCP Split 3'],
  ratingRange: [74, 90],
  teamIds: ['secret-whales', 'cfo', 'gam', 'dcg', 'mvk', 'shg', 'gz', 'dfm'],
  reserveTeamIds: [],
  format: { regularBestOf: 3, playoffTeams: 4, playoffBestOf: 5 },
  lowerLeagueId: 'vcs',
  promotion: 'guest_series',
  guestTeamIds: ['secret-whales', 'dcg', 'mvk', 'gz', 'dfm'],
  challengerLeagueIds: ['vcs', 'ljl', 'pcs'],
}

export const VCS: LeagueData = {
  id: 'vcs',
  name: 'VCS',
  region: 'PAC',
  tier: 2,
  countries: ['VN'],
  splitNames: ['VCS Winter', 'VCS Spring', 'VCS Summer'],
  ratingRange: [62, 76],
  teamIds: ['mvk-academy', 'saigon-dino', 'cybercore', '9gaming', 'ngua-hi', 'saigon-warriors'],
  reserveTeamIds: [],
  format: { regularBestOf: 3, playoffTeams: 4, playoffBestOf: 5 },
}

export const LJL: LeagueData = {
  id: 'ljl',
  name: 'LJL',
  feminine: true,
  region: 'PAC',
  tier: 2,
  countries: ['JP'],
  splitNames: ['LJL Winter Series', 'LJL Spring Series', 'LJL Summer Championship'],
  ratingRange: [56, 70],
  teamIds: ['dfm-academy', 'fennel', 'rising-gaming', 'l-guide', 'rayn-clocks', 'new-meta', 'arneb', 'uwinks'],
  reserveTeamIds: [],
  format: { regularBestOf: 1, playoffTeams: 4, playoffBestOf: 3 },
}

export const PCS: LeagueData = {
  id: 'pcs',
  name: 'PCS',
  region: 'PAC',
  tier: 2,
  countries: ['TW', 'HK', 'AU'],
  splitNames: ['PCS Winter', 'PCS Spring', 'PCS Summer'],
  ratingRange: [60, 74],
  teamIds: ['cfo-academy', 'frank', 'gz-academy', 'sillysilly', 'ewh', 'reignfall', 'rogersama', 'sponge'],
  reserveTeamIds: [],
  format: { regularBestOf: 1, playoffTeams: 4, playoffBestOf: 3 },
}
