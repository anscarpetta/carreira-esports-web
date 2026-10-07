// América Latina (tier 2): Liga Regional Sur e Liga Regional Norte, com os times do Split 2 de 2026.
//
// Força estimada (esses times não aparecem no ranking da Riot). Desde 2026, o melhor da
// Liga Regional Sur também pode disputar a vaga de convidado do CBLOL.

import type { LeagueData, TeamData } from '../engine/types.ts'

export const LATAM_TEAMS: readonly TeamData[] = [
  // Liga Regional Sur
  { id: '9z', name: '9z Team', shortName: '9z', abbreviation: '9Z', country: 'AR', structure: 3, rating: 68, color: '#1d1d1b', logoFile: '9z Teamlogo square.png' },
  { id: 'docta', name: 'Docta Esports Club', shortName: 'Docta', abbreviation: 'DOC', country: 'AR', structure: 2, rating: 67, color: '#00a3e0', logoFile: 'Docta Esports Clublogo square.png' },
  { id: 'malvinas', name: 'Malvinas Gaming', shortName: 'Malvinas', abbreviation: 'MLV', country: 'AR', structure: 2, rating: 66, color: '#75aadb', logoFile: 'Malvinas Gaminglogo square.png' },
  { id: 'golden-lions', name: 'Golden Lions', shortName: 'Golden Lions', abbreviation: 'GL', country: 'CL', structure: 2, rating: 65, color: '#d4a017', logoFile: 'Golden Lionslogo square.png' },
  { id: 'maze', name: 'Maze Gaming', shortName: 'Maze', abbreviation: 'MZE', country: 'AR', structure: 1, rating: 64, color: '#6a1b9a', logoFile: 'Maze Gaminglogo square.png' },
  { id: 'seven-dark', name: 'Seven Dark', shortName: 'Seven Dark', abbreviation: 'SVD', country: 'PE', structure: 1, rating: 63, color: '#263238', logoFile: 'Seven Darklogo square.png' },
  { id: 'volticons', name: 'Volticons', shortName: 'Volticons', abbreviation: 'VOL', country: 'CL', structure: 1, rating: 62, color: '#fbc02d', logoFile: 'Volticonslogo square.png' },
  { id: 'zen', name: 'ZEN Esports', shortName: 'ZEN', abbreviation: 'ZEN', country: 'CL', structure: 1, rating: 62, color: '#2e7d32', logoFile: 'ZEN Esportslogo square.png' },
  { id: 'wap', name: 'WAP Esports', shortName: 'WAP', abbreviation: 'WAP', country: 'AR', structure: 1, rating: 60, color: '#e64a19', logoFile: 'WAP Esportslogo square.png' },

  // Liga Regional Norte
  { id: 'lyon-academy', name: 'LYON Academy', shortName: 'LYON Academy', abbreviation: 'LYA', country: 'MX', structure: 3, rating: 68, color: '#1d3c78', logoFile: 'LYON (2024 American Team)logo square.png', parentId: 'lyon' },
  { id: 'sdm-tigres', name: 'SDM Tigres', shortName: 'Tigres', abbreviation: 'TIG', country: 'MX', structure: 2, rating: 67, color: '#f9a825', logoFile: 'SDM Tigreslogo square.png' },
  { id: 'kits', name: 'Kits Esports', shortName: 'Kits', abbreviation: 'KTS', country: 'MX', structure: 2, rating: 66, color: '#d32f2f', logoFile: 'Kits Esportslogo square.png' },
  { id: 'fuego', name: 'Fuego', shortName: 'Fuego', abbreviation: 'FG', country: 'MX', structure: 2, rating: 65, color: '#ff6f00', logoFile: 'Fuegologo square.png' },
  { id: 'ncg', name: 'NCG Esports', shortName: 'NCG', abbreviation: 'NCG', country: 'MX', structure: 1, rating: 64, color: '#283593', logoFile: 'NCG Esportslogo square.png' },
  { id: 'polar-squad', name: 'Polar Squad Esports', shortName: 'Polar Squad', abbreviation: 'PSQ', country: 'MX', structure: 1, rating: 63, color: '#4fc3f7', logoFile: 'Polar Squad Esportslogo square.png' },
  { id: 'zeu5', name: 'Zeu5 Esports', shortName: 'Zeu5', abbreviation: 'ZEU', country: 'CO', structure: 1, rating: 62, color: '#8e24aa', logoFile: 'Zeu5 Esportslogo square.png' },
  { id: '3v', name: '3V Team', shortName: '3V', abbreviation: '3V', country: 'MX', structure: 1, rating: 61, color: '#455a64', logoFile: '3V Teamlogo square.png' },
]

export const LIGA_REGIONAL_SUR: LeagueData = {
  id: 'lrs',
  name: 'Liga Regional Sur',
  feminine: true,
  region: 'LATAM',
  tier: 2,
  splitNames: ['Liga Regional Sur Apertura', 'Liga Regional Sur Split 1', 'Liga Regional Sur Split 2'],
  ratingRange: [58, 72],
  teamIds: ['9z', 'docta', 'malvinas', 'golden-lions', 'maze', 'seven-dark', 'volticons', 'zen'],
  reserveTeamIds: ['wap', 'isurus'],
  format: { regularBestOf: 1, playoffTeams: 4, playoffBestOf: 3 },
}

export const LIGA_REGIONAL_NORTE: LeagueData = {
  id: 'lrn',
  name: 'Liga Regional Norte',
  feminine: true,
  region: 'LATAM',
  tier: 2,
  splitNames: ['Liga Regional Norte Apertura', 'Liga Regional Norte Split 1', 'Liga Regional Norte Split 2'],
  ratingRange: [58, 72],
  teamIds: ['lyon-academy', 'sdm-tigres', 'kits', 'fuego', 'ncg', 'polar-squad', 'zeu5', '3v'],
  reserveTeamIds: [],
  format: { regularBestOf: 1, playoffTeams: 4, playoffBestOf: 3 },
  franchised: true,
}
