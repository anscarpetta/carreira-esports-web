// Coreia do Sul: LCK (tier 1) e LCK Challengers League (tier 2, só academies).
//
// Força inicial (rating) do tier 1: Global Power Rankings da Riot de 13/07/2026 (pós-MSI),
// convertido para OVR: OVR = 80 + (Elo - 1200) / 22.
// Tier 2: força estimada (esses times não aparecem no ranking da Riot).
// Estrutura (0 a 5): estimativa a partir do histórico de títulos de cada organização.

import type { LeagueData, TeamData } from '../engine/types.ts'

export const KOREA_TEAMS: readonly TeamData[] = [
  { id: 'hle', name: 'Hanwha Life Esports', shortName: 'HLE', abbreviation: 'HLE', country: 'KR', structure: 5, rating: 97.7, color: '#f37321', logoFile: 'Hanwha Life Esportslogo square.png' },
  { id: 'geng', name: 'Gen.G', shortName: 'Gen.G', abbreviation: 'GEN', country: 'KR', structure: 5, rating: 94.3, color: '#aa8b56', logoFile: 'Gen.Glogo square.png' },
  { id: 't1', name: 'T1', shortName: 'T1', abbreviation: 'T1', country: 'KR', structure: 5, rating: 94.1, color: '#e2012d', logoFile: 'T1logo square.png' },
  { id: 'kt', name: 'KT Rolster', shortName: 'KT', abbreviation: 'KT', country: 'KR', structure: 4, rating: 88.3, color: '#ff0a07', logoFile: 'KT Rolsterlogo square.png' },
  { id: 'dk', name: 'Dplus KIA', shortName: 'DK', abbreviation: 'DK', country: 'KR', structure: 4, rating: 86.4, color: '#1fd2b4', logoFile: 'Dplus KIAlogo square.png' },
  { id: 'fearx', name: 'BNK FEARX', shortName: 'FEARX', abbreviation: 'BFX', country: 'KR', structure: 2, rating: 83.1, color: '#ffc700', logoFile: 'BNK FEARXlogo square.png' },
  { id: 'drx', name: 'DRX', shortName: 'DRX', abbreviation: 'DRX', country: 'KR', structure: 3, rating: 80.5, color: '#5a8dff', logoFile: 'DRXlogo square.png' },
  { id: 'brion', name: 'BRION', shortName: 'BRION', abbreviation: 'BRO', country: 'KR', structure: 2, rating: 79.9, color: '#00492b', logoFile: 'BRIONlogo square.png' },
  { id: 'ns', name: 'Nongshim RedForce', shortName: 'NS', abbreviation: 'NS', country: 'KR', structure: 3, rating: 79.8, color: '#de2027', logoFile: 'Nongshim RedForcelogo square.png' },
  { id: 'soopers', name: 'DN SOOPers', shortName: 'SOOPers', abbreviation: 'DNS', country: 'KR', structure: 1, rating: 75.0, color: '#2b6cff', logoFile: 'DN SOOPerslogo square.png' },
  { id: 't1-academy', name: 'T1 Esports Academy', shortName: 'T1 Academy', abbreviation: 'T1A', country: 'KR', structure: 4, rating: 80, color: '#e2012d', logoFile: 'T1 Esports Academylogo square.png', parentId: 't1' },
  { id: 'geng-academy', name: 'Gen.G Global Academy', shortName: 'Gen.G Academy', abbreviation: 'GGA', country: 'KR', structure: 4, rating: 80, color: '#aa8b56', logoFile: 'Gen.G Global Academylogo square.png', parentId: 'geng' },
  { id: 'hle-challengers', name: 'Hanwha Life Esports Challengers', shortName: 'HLE Challengers', abbreviation: 'HLC', country: 'KR', structure: 4, rating: 79, color: '#f37321', logoFile: 'Hanwha Life Esports Challengerslogo square.png', parentId: 'hle' },
  { id: 'kt-challengers', name: 'KT Rolster Challengers', shortName: 'KT Challengers', abbreviation: 'KTC', country: 'KR', structure: 3, rating: 78, color: '#ff0a07', logoFile: 'KT Rolster Challengerslogo square.png', parentId: 'kt' },
  { id: 'dk-challengers', name: 'Dplus KIA Challengers', shortName: 'DK Challengers', abbreviation: 'DKC', country: 'KR', structure: 3, rating: 78, color: '#1fd2b4', logoFile: 'Dplus KIA Challengerslogo square.png', parentId: 'dk' },
  { id: 'ns-challengers', name: 'Nongshim RedForce Challengers', shortName: 'NS Challengers', abbreviation: 'NSC', country: 'KR', structure: 3, rating: 76, color: '#de2027', logoFile: 'Nongshim RedForce Challengerslogo square.png', parentId: 'ns' },
  { id: 'drx-challengers', name: 'DRX Challengers', shortName: 'DRX Challengers', abbreviation: 'DRC', country: 'KR', structure: 3, rating: 76, color: '#5a8dff', logoFile: 'DRX Challengerslogo square.png', parentId: 'drx' },
  { id: 'fearx-youth', name: 'BNK FEARX Youth', shortName: 'FEARX Youth', abbreviation: 'BFY', country: 'KR', structure: 2, rating: 75, color: '#ffc700', logoFile: 'BNK FEARX Youthlogo square.png', parentId: 'fearx' },
  { id: 'brion-challengers', name: 'BRION Challengers', shortName: 'BRION Challengers', abbreviation: 'BRC', country: 'KR', structure: 2, rating: 75, color: '#00492b', logoFile: 'BRION Challengerslogo square.png', parentId: 'brion' },
  { id: 'soopers-challengers', name: 'DN SOOPers Challengers', shortName: 'SOOPers Challengers', abbreviation: 'DNC', country: 'KR', structure: 2, rating: 74, color: '#2b6cff', logoFile: 'DN SOOPers Challengerslogo square.png', parentId: 'soopers' },
]

export const LCK: LeagueData = {
  id: 'lck',
  name: 'LCK',
  feminine: true,
  region: 'KR',
  tier: 1,
  splitNames: ['LCK Cup', 'LCK Road to MSI', 'LCK Season'],
  ratingRange: [78, 100],
  teamIds: ['hle', 'geng', 't1', 'kt', 'dk', 'fearx', 'drx', 'brion', 'ns', 'soopers'],
  reserveTeamIds: [],
  format: { regularBestOf: 3, playoffTeams: 4, playoffBestOf: 5 },
  franchised: true,
}

export const LCK_CL: LeagueData = {
  id: 'lck-cl',
  name: 'LCK CL',
  feminine: true,
  region: 'KR',
  tier: 2,
  splitNames: ['LCK CL Kickoff', 'LCK CL Rounds 1-2', 'LCK CL Rounds 3-4'],
  ratingRange: [72, 84],
  teamIds: ['t1-academy', 'geng-academy', 'hle-challengers', 'kt-challengers', 'dk-challengers', 'ns-challengers', 'drx-challengers', 'fearx-youth', 'brion-challengers', 'soopers-challengers'],
  reserveTeamIds: [],
  format: { regularBestOf: 3, playoffTeams: 4, playoffBestOf: 5 },
  franchised: true,
}
