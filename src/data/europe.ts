// Europa (EMEA): LEC (tier 1) e EMEA Masters (tier 2, os melhores das ligas regionais).
//
// Força inicial (rating) do tier 1: Global Power Rankings da Riot de 13/07/2026 (pós-MSI),
// convertido para OVR: OVR = 80 + (Elo - 1200) / 22.
// Tier 2: força estimada (esses times não aparecem no ranking da Riot).
// Estrutura (0 a 5): estimativa a partir do histórico de títulos de cada organização.

import type { LeagueData, TeamData } from '../engine/types.ts'

export const EUROPE_TEAMS: readonly TeamData[] = [
  { id: 'g2', name: 'G2 Esports', shortName: 'G2', abbreviation: 'G2', country: 'DE', structure: 5, rating: 92.6, color: '#ef3d23', logoFile: 'G2 Esportslogo square.png' },
  { id: 'kc', name: 'Karmine Corp', shortName: 'KC', abbreviation: 'KC', country: 'FR', structure: 4, rating: 87.8, color: '#00bfff', logoFile: 'Karmine Corplogo square.png' },
  { id: 'koi', name: 'Movistar KOI', shortName: 'KOI', abbreviation: 'MKOI', country: 'ES', structure: 4, rating: 85.4, color: '#0b2c5f', logoFile: 'Movistar KOIlogo square.png' },
  { id: 'vitality', name: 'Team Vitality', shortName: 'Vitality', abbreviation: 'VIT', country: 'FR', structure: 4, rating: 81.8, color: '#f4e900', logoFile: 'Team Vitalitylogo square.png' },
  { id: 'fnatic', name: 'Fnatic', shortName: 'Fnatic', abbreviation: 'FNC', country: 'GB', structure: 5, rating: 80.9, color: '#ff5900', logoFile: 'Fnaticlogo square.png' },
  { id: 'giantx', name: 'GIANTX', shortName: 'GIANTX', abbreviation: 'GX', country: 'ES', structure: 3, rating: 80.5, color: '#1a1aff', logoFile: 'GIANTXlogo square.png' },
  { id: 'navi', name: 'Natus Vincere', shortName: 'NAVI', abbreviation: 'NAVI', country: 'UA', structure: 3, rating: 78.9, color: '#ffee00', logoFile: 'Natus Vincerelogo square.png' },
  { id: 'shifters', name: 'Shifters', shortName: 'Shifters', abbreviation: 'SHFT', country: 'GB', structure: 2, rating: 78.4, color: '#7c3aed', logoFile: 'Shifterslogo square.png' },
  { id: 'sk', name: 'SK Gaming', shortName: 'SK', abbreviation: 'SK', country: 'DE', structure: 3, rating: 76.3, color: '#1d1d1b', logoFile: 'SK Gaminglogo square.png' },
  { id: 'heretics', name: 'Team Heretics', shortName: 'Heretics', abbreviation: 'TH', country: 'ES', structure: 3, rating: 75.8, color: '#c9a227', logoFile: 'Team Hereticslogo square.png' },
  { id: 'solary', name: 'Solary', shortName: 'Solary', abbreviation: 'SLY', country: 'FR', structure: 3, rating: 77, color: '#1f6feb', logoFile: 'Solarylogo square.png' },
  { id: 'galions', name: 'Galions', shortName: 'Galions', abbreviation: 'GL', country: 'FR', structure: 3, rating: 77, color: '#0b5394', logoFile: 'Galionslogo square.png' },
  { id: 'koi-fenix', name: 'Movistar KOI Fénix', shortName: 'KOI Fénix', abbreviation: 'KOIF', country: 'ES', structure: 3, rating: 76, color: '#0b2c5f', logoFile: 'Movistar KOI Fénixlogo square.png', parentId: 'koi' },
  { id: 'kc-blue', name: 'Karmine Corp Blue', shortName: 'KC Blue', abbreviation: 'KCB', country: 'FR', structure: 3, rating: 76, color: '#00bfff', logoFile: 'Karmine Corp Bluelogo square.png', parentId: 'kc' },
  { id: 'tln-pirates', name: 'TLN Pirates', shortName: 'TLN Pirates', abbreviation: 'TLN', country: 'FR', structure: 2, rating: 75, color: '#0e7c86', logoFile: 'TLN Pirateslogo square.png' },
  { id: 'big', name: 'BIG', shortName: 'BIG', abbreviation: 'BIG', country: 'DE', structure: 3, rating: 75, color: '#111111', logoFile: 'Berlin International Gaminglogo square.png' },
  { id: 'g2-nord', name: 'G2 NORD', shortName: 'G2 NORD', abbreviation: 'G2N', country: 'DE', structure: 3, rating: 75, color: '#ef3d23', logoFile: 'G2 NORDlogo square.png', parentId: 'g2' },
  { id: 'hangry-knights', name: 'Kaufland Hangry Knights', shortName: 'Hangry Knights', abbreviation: 'HK', country: 'DE', structure: 2, rating: 74, color: '#e30613', logoFile: 'Kaufland Hangry Knightslogo square.png' },
  { id: 'los-heretics', name: 'Los Heretics', shortName: 'Los Heretics', abbreviation: 'LH', country: 'ES', structure: 2, rating: 74, color: '#c9a227', logoFile: 'Los Hereticslogo square.png', parentId: 'heretics' },
  { id: 'ruddy', name: 'Ruddy Esports', shortName: 'Ruddy', abbreviation: 'RUD', country: 'GB', structure: 2, rating: 72, color: '#b3261e', logoFile: 'Ruddy Esportslogo square.png' },
  { id: 'bushido', name: 'Bushido Wildcats', shortName: 'Bushido', abbreviation: 'BW', country: 'TR', structure: 2, rating: 72, color: '#d62828', logoFile: 'Bushido Wildcatslogo square.png' },
  { id: 'hmble', name: 'HMBLE', shortName: 'HMBLE', abbreviation: 'HMB', country: 'IT', structure: 2, rating: 71, color: '#2a9d8f', logoFile: 'HMBLElogo square.png' },
]

export const LEC: LeagueData = {
  id: 'lec',
  name: 'LEC',
  feminine: true,
  region: 'EU',
  tier: 1,
  splitNames: ['LEC Versus', 'LEC Spring', 'LEC Summer'],
  ratingRange: [74, 94],
  teamIds: ['g2', 'kc', 'koi', 'vitality', 'fnatic', 'giantx', 'navi', 'shifters', 'sk', 'heretics'],
  reserveTeamIds: [],
  format: { regularBestOf: 3, playoffTeams: 4, playoffBestOf: 5 },
  franchised: true,
}

export const EMEA_MASTERS: LeagueData = {
  id: 'emea-masters',
  name: 'EMEA Masters',
  region: 'EU',
  tier: 2,
  splitNames: ['EMEA Masters Winter', 'EMEA Masters Spring', 'EMEA Masters Summer'],
  ratingRange: [66, 80],
  teamIds: ['solary', 'galions', 'koi-fenix', 'kc-blue', 'tln-pirates', 'big', 'g2-nord', 'hangry-knights', 'los-heretics', 'ruddy', 'bushido', 'hmble'],
  reserveTeamIds: [],
  format: { regularBestOf: 1, playoffTeams: 4, playoffBestOf: 3 },
  franchised: true,
}
