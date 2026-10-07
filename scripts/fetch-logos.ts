// Baixa os logos dos times do catálogo a partir da Leaguepedia (miniaturas de 128 px)
// e gera src/data/logos.json com os arquivos disponíveis.
//
// Uso: node scripts/fetch-logos.ts
// Só baixa o que ainda não existe em public/assets/teams/.

import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { CATALOG } from '../src/data/catalog.ts'

const API = 'https://lol.fandom.com/api.php'
const USER_AGENT = 'carreira-esports-web/0.1 (fan project; github.com/anscarpetta/carreira-esports-web)'
const OUT_DIR = 'public/assets/teams'
const BATCH = 40

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function thumbnails(files: readonly string[]): Promise<Record<string, string>> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    prop: 'imageinfo',
    iiprop: 'url',
    iiurlwidth: '128',
    titles: files.map((f) => `File:${f}`).join('|'),
  })
  const response = await fetch(`${API}?${params}`, { headers: { 'User-Agent': USER_AGENT } })
  const data = (await response.json()) as {
    error?: { info: string }
    query?: {
      normalized?: { from: string; to: string }[]
      pages: Record<string, { title: string; imageinfo?: { thumburl: string }[] }>
    }
  }
  if (data.error) throw new Error(data.error.info)
  const byTitle: Record<string, string> = {}
  for (const page of Object.values(data.query?.pages ?? {})) {
    if (page.imageinfo?.[0]) byTitle[page.title] = page.imageinfo[0].thumburl
  }
  const result: Record<string, string> = {}
  for (const file of files) {
    const asked = `File:${file}`
    const normalized = data.query?.normalized?.find((n) => n.from === asked)?.to ?? asked
    if (byTitle[normalized]) result[file] = byTitle[normalized]
  }
  return result
}

async function main(): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true })
  const pending = Object.values(CATALOG.teams).filter(
    (team) => team.logoFile && !existsSync(`${OUT_DIR}/${team.id}.webp`),
  )
  console.log(`Logos a baixar: ${pending.length}`)
  for (let i = 0; i < pending.length; i += BATCH) {
    const batch = pending.slice(i, i + BATCH)
    const urls = await thumbnails(batch.map((team) => team.logoFile!))
    for (const team of batch) {
      const url = urls[team.logoFile!]
      if (!url) {
        console.log(`  sem arquivo: ${team.id} (${team.logoFile})`)
        continue
      }
      // O servidor de imagens exige o Referer da própria Leaguepedia (como num navegador).
      const image = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Referer: 'https://lol.fandom.com/' } })
      if (!image.ok) {
        console.log(`  falhou: ${team.id} (${image.status})`)
        continue
      }
      writeFileSync(`${OUT_DIR}/${team.id}.webp`, Buffer.from(await image.arrayBuffer()))
      console.log(`  ok: ${team.id}`)
      await sleep(250)
    }
    await sleep(1500)
  }

  const available = readdirSync(OUT_DIR)
    .filter((file) => file.endsWith('.webp'))
    .map((file) => file.replace(/\.webp$/, ''))
    .sort()
  writeFileSync('src/data/logos.json', `${JSON.stringify(available, null, 2)}\n`)
  console.log(`logos.json: ${available.length} times com logo`)
}

await main()
