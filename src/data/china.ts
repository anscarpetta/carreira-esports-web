// China: LPL (tier 1) e LDL (tier 2). A LDL usa os times do Split 3 de 2025.
//
// Força inicial (rating) do tier 1: Global Power Rankings da Riot de 13/07/2026 (pós-MSI),
// convertido para OVR: OVR = 80 + (Elo - 1200) / 22.
// Tier 2: força estimada (esses times não aparecem no ranking da Riot).
// Estrutura (0 a 5): estimativa a partir do histórico de títulos de cada organização.

import type { LeagueData, TeamData } from '../engine/types.ts'

export const CHINA_TEAMS: readonly TeamData[] = [
  { id: 'bilibili', name: 'Bilibili Gaming', shortName: 'BLG', abbreviation: 'BLG', country: 'CN', structure: 5, rating: 98.0, color: '#00a1d6', logoFile: 'Bilibili Gaminglogo square.png' },
  { id: 'tes', name: 'Top Esports', shortName: 'TES', abbreviation: 'TES', country: 'CN', structure: 5, rating: 89.3, color: '#e60012', logoFile: 'Top Esportslogo square.png' },
  { id: 'jdg', name: 'JD Gaming', shortName: 'JDG', abbreviation: 'JDG', country: 'CN', structure: 5, rating: 87.9, color: '#c8102e', logoFile: 'JD Gaminglogo square.png' },
  { id: 'al', name: "Anyone's Legend", shortName: 'AL', abbreviation: 'AL', country: 'CN', structure: 4, rating: 87.8, color: '#7a1fd1', logoFile: "Anyone's Legendlogo square.png" },
  { id: 'wbg', name: 'Weibo Gaming', shortName: 'WBG', abbreviation: 'WBG', country: 'CN', structure: 4, rating: 86.5, color: '#e6162d', logoFile: 'Weibo Gaminglogo square.png' },
  { id: 'nip', name: 'Ninjas in Pyjamas', shortName: 'NiP', abbreviation: 'NIP', country: 'CN', structure: 3, rating: 84.5, color: '#1d1d1b', logoFile: 'Ninjas in Pyjamaslogo square.png' },
  { id: 'ig', name: 'Invictus Gaming', shortName: 'iG', abbreviation: 'IG', country: 'CN', structure: 4, rating: 83.9, color: '#9d2235', logoFile: 'Invictus Gaminglogo square.png' },
  { id: 'we', name: 'Team WE', shortName: 'WE', abbreviation: 'WE', country: 'CN', structure: 3, rating: 83.7, color: '#e60033', logoFile: 'Team WElogo square.png' },
  { id: 'lng', name: 'LNG Esports', shortName: 'LNG', abbreviation: 'LNG', country: 'CN', structure: 4, rating: 82.5, color: '#00b2a9', logoFile: 'LNG Esportslogo square.png' },
  { id: 'edg', name: 'EDward Gaming', shortName: 'EDG', abbreviation: 'EDG', country: 'CN', structure: 4, rating: 79.6, color: '#1d1d1b', logoFile: 'EDward Gaminglogo square.png' },
  { id: 'tt', name: 'ThunderTalk Gaming', shortName: 'TT', abbreviation: 'TT', country: 'CN', structure: 2, rating: 78.8, color: '#ff5a1f', logoFile: 'ThunderTalk Gaminglogo square.png' },
  { id: 'lgd', name: 'LGD Gaming', shortName: 'LGD', abbreviation: 'LGD', country: 'CN', structure: 2, rating: 78.8, color: '#f2a900', logoFile: 'LGD Gaminglogo square.png' },
  { id: 'omg', name: 'Oh My God', shortName: 'OMG', abbreviation: 'OMG', country: 'CN', structure: 2, rating: 77.0, color: '#d71920', logoFile: 'Oh My Godlogo square.png' },
  { id: 'up', name: 'Ultra Prime', shortName: 'UP', abbreviation: 'UP', country: 'CN', structure: 1, rating: 76.5, color: '#5c2d91', logoFile: 'Ultra Primelogo square.png' },
  { id: 'blg-junior', name: 'Bilibili Gaming Junior', shortName: 'BLG Junior', abbreviation: 'BLJ', country: 'CN', structure: 4, rating: 80, color: '#00a1d6', logoFile: 'Bilibili Gaming Juniorlogo square.png', parentId: 'bilibili' },
  { id: 'tes-challenger', name: 'Top Esports Challenger', shortName: 'TES Challenger', abbreviation: 'TSC', country: 'CN', structure: 4, rating: 79, color: '#e60012', logoFile: 'Top Esports Challengerlogo square.png', parentId: 'tes' },
  { id: 'al-young', name: "Anyone's Legend Young", shortName: 'AL Young', abbreviation: 'ALY', country: 'CN', structure: 3, rating: 78, color: '#7a1fd1', logoFile: "Anyone's Legendlogo square.png", parentId: 'al' },
  { id: 'wbg-youth', name: 'WBG Youth Team', shortName: 'WBG Youth', abbreviation: 'WBY', country: 'CN', structure: 3, rating: 77, color: '#e6162d', logoFile: 'Weibo Gaminglogo square.png', parentId: 'wbg' },
  { id: 'rng', name: 'Royal Never Give Up', shortName: 'RNG', abbreviation: 'RNG', country: 'CN', structure: 3, rating: 77, color: '#c8a24a', logoFile: 'Royal Never Give Uplogo square.png' },
  { id: 'lng-academy', name: 'LNG Esports Academy', shortName: 'LNG Academy', abbreviation: 'LNA', country: 'CN', structure: 3, rating: 76, color: '#00b2a9', logoFile: 'LNG Academylogo square.png', parentId: 'lng' },
  { id: 'we-academy', name: 'Team WE Academy', shortName: 'WE Academy', abbreviation: 'WEA', country: 'CN', structure: 3, rating: 76, color: '#e60033', logoFile: 'Team WE Academylogo square.png', parentId: 'we' },
  { id: 'edg-youth', name: 'EDward Gaming Youth Team', shortName: 'EDG Youth', abbreviation: 'EDY', country: 'CN', structure: 3, rating: 76, color: '#1d1d1b', logoFile: 'EDward Gaming Youth Teamlogo square.png', parentId: 'edg' },
  { id: 'lgd-youth', name: 'LGD Gaming Youth Team', shortName: 'LGD Youth', abbreviation: 'LGY', country: 'CN', structure: 2, rating: 74, color: '#f2a900', logoFile: 'LGD Gaming Young Teamlogo square.png', parentId: 'lgd' },
  { id: 'tt-young', name: 'TT Gaming Young', shortName: 'TT Young', abbreviation: 'TTY', country: 'CN', structure: 2, rating: 73, color: '#ff5a1f', logoFile: 'ThunderTalk Gaming Younglogo square.png', parentId: 'tt' },
  { id: 'omg-academy', name: 'Oh My God Academy', shortName: 'OMG Academy', abbreviation: 'OMA', country: 'CN', structure: 2, rating: 73, color: '#d71920', logoFile: 'Oh My God Academylogo square.png', parentId: 'omg' },
]

export const LPL: LeagueData = {
  id: 'lpl',
  name: 'LPL',
  feminine: true,
  region: 'CN',
  tier: 1,
  splitNames: ['LPL Split 1', 'LPL Split 2', 'LPL Split 3'],
  ratingRange: [78, 100],
  teamIds: ['bilibili', 'tes', 'jdg', 'al', 'wbg', 'nip', 'ig', 'we', 'lng', 'edg', 'tt', 'lgd', 'omg', 'up'],
  reserveTeamIds: [],
  format: { regularBestOf: 3, playoffTeams: 4, playoffBestOf: 5 },
  franchised: true,
}

export const LDL: LeagueData = {
  id: 'ldl',
  name: 'LDL',
  feminine: true,
  region: 'CN',
  tier: 2,
  splitNames: ['LDL Split 1', 'LDL Split 2', 'LDL Split 3'],
  ratingRange: [70, 82],
  teamIds: ['blg-junior', 'tes-challenger', 'al-young', 'wbg-youth', 'rng', 'lng-academy', 'we-academy', 'edg-youth', 'lgd-youth', 'tt-young', 'omg-academy'],
  reserveTeamIds: [],
  format: { regularBestOf: 3, playoffTeams: 4, playoffBestOf: 5 },
  franchised: true,
}
