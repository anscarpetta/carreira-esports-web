// América do Norte: LCS (tier 1) e NACL (tier 2, com equipes universitárias em 2026).
//
// Força inicial (rating) do tier 1: Global Power Rankings da Riot de 13/07/2026 (pós-MSI),
// convertido para OVR: OVR = 80 + (Elo - 1200) / 22.
// Tier 2: força estimada (esses times não aparecem no ranking da Riot).
// Estrutura (0 a 5): estimativa a partir do histórico de títulos de cada organização.

import type { LeagueData, TeamData } from '../engine/types.ts'

export const NORTH_AMERICA_TEAMS: readonly TeamData[] = [
  { id: 'lyon', name: 'LYON', shortName: 'LYON', abbreviation: 'LYON', country: 'MX', structure: 3, rating: 91.5, color: '#1d3c78', logoFile: 'LYON (2024 American Team)logo square.png' },
  { id: 'flyquest', name: 'FlyQuest', shortName: 'FlyQuest', abbreviation: 'FLY', country: 'US', structure: 4, rating: 87.3, color: '#0a6e3c', logoFile: 'FlyQuestlogo square.png' },
  { id: 'tl', name: 'Team Liquid', shortName: 'Liquid', abbreviation: 'TL', country: 'US', structure: 5, rating: 86.0, color: '#0c223f', logoFile: 'Team Liquidlogo square.png' },
  { id: 'c9', name: 'Cloud9', shortName: 'Cloud9', abbreviation: 'C9', country: 'US', structure: 5, rating: 85.3, color: '#00aeef', logoFile: 'Cloud9logo square.png' },
  { id: 'sentinels', name: 'Sentinels', shortName: 'Sentinels', abbreviation: 'SEN', country: 'US', structure: 3, rating: 80.2, color: '#ce0037', logoFile: 'Sentinelslogo square.png' },
  { id: 'sr', name: 'Shopify Rebellion', shortName: 'Shopify', abbreviation: 'SR', country: 'US', structure: 3, rating: 79.1, color: '#95bf47', logoFile: 'Shopify Rebellionlogo square.png' },
  { id: 'disguised', name: 'Disguised', shortName: 'Disguised', abbreviation: 'DSG', country: 'US', structure: 2, rating: 78.9, color: '#f2c94c', logoFile: 'Disguisedlogo square.png' },
  { id: 'dignitas', name: 'Dignitas', shortName: 'Dignitas', abbreviation: 'DIG', country: 'US', structure: 2, rating: 76.9, color: '#fdb515', logoFile: 'Dignitaslogo square.png' },
  { id: 'nrg', name: 'NRG', shortName: 'NRG', abbreviation: 'NRG', country: 'US', structure: 3, rating: 72, color: '#1d1d1b', logoFile: 'NRGlogo square.png' },
  { id: 'cupid', name: 'Cupid Esports', shortName: 'Cupid', abbreviation: 'CUP', country: 'US', structure: 2, rating: 69, color: '#ff4f81', logoFile: 'Cupid Esportslogo square.png' },
  { id: 'conviction', name: 'Conviction', shortName: 'Conviction', abbreviation: 'CVN', country: 'US', structure: 2, rating: 69, color: '#3949ab', logoFile: 'Convictionlogo square.png' },
  { id: 'dorado', name: 'Dorado Gaming', shortName: 'Dorado', abbreviation: 'DOR', country: 'US', structure: 2, rating: 68, color: '#d4a017', logoFile: 'Dorado Gaminglogo square.png' },
  { id: 'winthrop', name: 'Winthrop University', shortName: 'Winthrop', abbreviation: 'WIN', country: 'US', structure: 2, rating: 67, color: '#872434', logoFile: 'Winthrop Universitylogo square.png' },
  { id: 'uc-irvine', name: 'UC Irvine', shortName: 'UC Irvine', abbreviation: 'UCI', country: 'US', structure: 2, rating: 65, color: '#0064a4', logoFile: 'UC Irvine Esports Goldlogo square.png' },
  { id: 'fisher', name: 'Fisher College', shortName: 'Fisher', abbreviation: 'FSH', country: 'US', structure: 1, rating: 66, color: '#004b8d', logoFile: 'Fisher Collegelogo square.png' },
  { id: 'maryville', name: 'Maryville University', shortName: 'Maryville', abbreviation: 'MVU', country: 'US', structure: 2, rating: 66, color: '#c8102e', logoFile: 'Maryville Universitylogo square.png' },
  { id: 'grand-view', name: 'Grand View University', shortName: 'Grand View', abbreviation: 'GVU', country: 'US', structure: 1, rating: 65, color: '#002f6c', logoFile: 'Grand View Universitylogo square.png' },
  { id: 'st-cloud', name: 'St. Cloud State University', shortName: 'St. Cloud State', abbreviation: 'SCS', country: 'US', structure: 1, rating: 64, color: '#c8102e', logoFile: 'St. Cloud State Universitylogo square.png' },
  { id: 'ole-miss', name: 'University of Mississippi', shortName: 'Ole Miss', abbreviation: 'OM', country: 'US', structure: 1, rating: 63, color: '#ce1126', logoFile: 'University of Mississippilogo square.png' },
]

export const LCS: LeagueData = {
  id: 'lcs',
  name: 'LCS',
  feminine: true,
  region: 'NA',
  tier: 1,
  splitNames: ['LCS Lock-In', 'LCS Spring', 'LCS Summer'],
  ratingRange: [74, 92],
  teamIds: ['lyon', 'flyquest', 'tl', 'c9', 'sentinels', 'sr', 'disguised', 'dignitas'],
  reserveTeamIds: [],
  format: { regularBestOf: 3, playoffTeams: 4, playoffBestOf: 5 },
  franchised: true,
}

export const NACL: LeagueData = {
  id: 'nacl',
  name: 'NACL',
  feminine: true,
  region: 'NA',
  tier: 2,
  splitNames: ['NACL Kickoff', 'NACL Spring', 'NACL Summer'],
  ratingRange: [60, 74],
  teamIds: ['nrg', 'cupid', 'conviction', 'dorado', 'winthrop', 'uc-irvine', 'fisher', 'maryville', 'grand-view', 'st-cloud', 'ole-miss'],
  reserveTeamIds: [],
  format: { regularBestOf: 1, playoffTeams: 4, playoffBestOf: 3 },
  franchised: true,
}
