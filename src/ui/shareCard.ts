// Card compartilhável da carreira (1080 × 1350, formato de post), desenhado em canvas.
// Usa só imagens do próprio site (logos, bandeiras e troféus), então o canvas pode virar arquivo.

import { CATALOG } from '../data/catalog.ts'
import logos from '../data/logos.json'
import { summarize } from '../engine/summary.ts'
import type { CareerState } from '../engine/types.ts'
import { kdaText, ROLE_LABEL } from './format.ts'
import { ovrColor } from './ovr.ts'
import { groupTrophies, trophyImage } from './trophies.ts'

export const GAME_URL = 'https://anscarpetta.github.io/carreira-esports-web/'

const W = 1080
const H = 1350
const GOLD = '#c8a24a'
const GOLD_SOFT = '#e6c979'
const MUTED = '#8f9bb3'
const WITH_LOGO = new Set<string>(logos)

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function grouped(names: readonly string[]): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const name of names) counts.set(name, (counts.get(name) ?? 0) + 1)
  return [...counts.entries()].map(([name, count]) => ({ name, count }))
}

export async function drawCareerCard(canvas: HTMLCanvasElement, career: CareerState): Promise<boolean> {
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return false
  const base = import.meta.env.BASE_URL
  const s = summarize(career)
  const font = (weight: number, size: number) => `${weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`

  // Fundo
  const gradient = ctx.createLinearGradient(0, 0, W, H)
  gradient.addColorStop(0, '#09090b')
  gradient.addColorStop(1, '#17171c')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 6
  roundRect(ctx, 24, 24, W - 48, H - 48, 36)
  ctx.stroke()

  // Cabeçalho
  ctx.textAlign = 'center'
  ctx.fillStyle = GOLD
  ctx.font = font(800, 30)
  ctx.fillText('CARREIRA ESPORTS', W / 2, 110)
  ctx.fillStyle = '#ffffff'
  ctx.font = font(900, 104)
  ctx.fillText(career.player.nick, W / 2, 230)

  const flag = await loadImage(`${base}assets/flags/${career.player.nationality.toLowerCase()}.png`)
  const years = s.firstYear !== null ? `${s.firstYear}–${s.lastYear}` : ''
  const subtitle = `${ROLE_LABEL[career.player.role]} · ${years}`
  ctx.font = font(600, 38)
  const subtitleWidth = ctx.measureText(subtitle).width
  const flagW = flag ? 60 : 0
  const startX = W / 2 - (subtitleWidth + flagW + 16) / 2
  if (flag) ctx.drawImage(flag, startX, 262, 60, 42)
  ctx.fillStyle = MUTED
  ctx.textAlign = 'left'
  ctx.fillText(subtitle, startX + flagW + 16, 297)

  // Números principais
  const stats: [string, string][] = [
    ['OVR MÁXIMO', String(s.peakOvr)],
    ['TÍTULOS', String(s.titles.length)],
    ['JOGOS', String(s.totals.games)],
    ['KDA', kdaText(s.totals.kills, s.totals.deaths, s.totals.assists)],
  ]
  stats.forEach(([label, value], i) => {
    const x = 60 + i * 245
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    roundRect(ctx, x, 350, 225, 170, 24)
    ctx.fill()
    ctx.textAlign = 'center'
    ctx.fillStyle = MUTED
    ctx.font = font(700, 24)
    ctx.fillText(label, x + 112, 400)
    ctx.fillStyle = i === 0 ? ovrColor(s.peakOvr) : '#ffffff'
    ctx.font = font(900, 72)
    ctx.fillText(value, x + 112, 480)
  })

  // Vitrine
  ctx.textAlign = 'left'
  ctx.fillStyle = MUTED
  ctx.font = font(800, 28)
  ctx.fillText('VITRINE', 60, 590)
  // Taças (até 6), com a quantidade embaixo; os prêmios individuais vêm numa linha só.
  const trophies = groupTrophies(s.titles).slice(0, 6)
  const awards = grouped(s.awards.map((a) => a.name.replace(/ (do|da) .*$/, '')))
  ctx.textAlign = 'center'
  for (let i = 0; i < trophies.length; i += 1) {
    const { key, name, count } = trophies[i]
    const cx = 60 + i * 160 + 80
    const image = await loadImage(trophyImage(key))
    if (image) ctx.drawImage(image, cx - 54, 615, 108, 151)
    ctx.fillStyle = GOLD_SOFT
    ctx.font = font(800, 26)
    ctx.fillText(count > 1 ? `${count}× ${name}` : name, cx, 805, 150)
  }
  ctx.textAlign = 'left'
  const awardsLine = awards.map((a) => `${a.count}× ${a.name}`).join(' · ')
  if (trophies.length === 0 && awards.length === 0) {
    ctx.fillStyle = MUTED
    ctx.font = font(700, 36)
    ctx.fillText('Vitrine vazia', 60, 645)
  } else if (awards.length > 0) {
    ctx.fillStyle = '#ffffff'
    ctx.font = font(700, 30)
    ctx.fillText(`⭐ ${awardsLine}`, 60, trophies.length > 0 ? 865 : 650, 960)
  }

  // Times da carreira
  ctx.fillStyle = MUTED
  ctx.font = font(800, 28)
  ctx.fillText('TIMES', 60, 920)
  const spells = s.spells.slice(0, 8)
  for (let i = 0; i < spells.length; i += 1) {
    const spell = spells[i]
    const x = 60 + (i % 4) * 245
    const y = 950 + Math.floor(i / 4) * 150
    ctx.fillStyle = '#f1f5f9'
    roundRect(ctx, x, y, 96, 96, 18)
    ctx.fill()
    const team = CATALOG.teams[spell.teamId]
    const logo = WITH_LOGO.has(spell.teamId) ? await loadImage(`${base}assets/teams/${spell.teamId}.webp`) : null
    if (logo) ctx.drawImage(logo, x + 8, y + 8, 80, 80)
    else {
      ctx.fillStyle = team?.color ?? '#334155'
      roundRect(ctx, x, y, 96, 96, 18)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.font = font(900, 28)
      ctx.fillText(team?.abbreviation ?? '?', x + 48, y + 58)
      ctx.textAlign = 'left'
    }
    ctx.fillStyle = '#ffffff'
    ctx.font = font(700, 24)
    ctx.fillText(team?.shortName ?? spell.teamId, x + 108, y + 40, 125)
    ctx.fillStyle = MUTED
    ctx.font = font(600, 22)
    const span = spell.from.year === spell.to.year ? `${spell.from.year}` : `${spell.from.year}–${spell.to.year}`
    ctx.fillText(span, x + 108, y + 72, 125)
  }

  // Rodapé
  ctx.textAlign = 'center'
  ctx.fillStyle = GOLD
  ctx.font = font(800, 32)
  ctx.fillText('Jogue a sua carreira:', W / 2, H - 110)
  ctx.fillStyle = '#ffffff'
  ctx.font = font(700, 30)
  ctx.fillText(GAME_URL.replace('https://', ''), W / 2, H - 65)
  return true
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'))
}
