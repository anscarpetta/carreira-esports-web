import { useEffect, useRef, useState } from 'react'
import type { CareerState } from '../engine/types.ts'
import { canvasToBlob, drawCareerCard, GAME_URL } from './shareCard.ts'

type Status = { tone: 'ok' | 'error'; text: string } | null

// Card da carreira com as opções de compartilhar, copiar e salvar (como no Copero).
export function SharePanel({ career }: { career: CareerState }) {
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>(null)

  useEffect(() => {
    let cancelled = false
    const element = document.createElement('canvas')
    canvas.current = element
    drawCareerCard(element, career)
      .then((ok) => {
        if (!cancelled && ok) setPreview(element.toDataURL('image/png'))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [career])

  async function blob(): Promise<Blob | null> {
    return canvas.current ? canvasToBlob(canvas.current) : null
  }

  async function share() {
    const image = await blob()
    const file = image ? new File([image], 'minha-carreira.png', { type: 'image/png' }) : null
    const data: ShareData = {
      title: 'Minha carreira no LoL',
      text: 'Esta foi a minha carreira no Carreira Esports. Como seria a sua?',
      url: GAME_URL,
    }
    try {
      if (file && navigator.canShare?.({ files: [file] })) await navigator.share({ ...data, files: [file] })
      else if (navigator.share) await navigator.share(data)
      else setStatus({ tone: 'error', text: 'Este navegador não tem menu de compartilhamento. Use "Salvar imagem".' })
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setStatus({ tone: 'error', text: 'Não foi possível compartilhar.' })
    }
  }

  async function copyImage() {
    try {
      const image = await blob()
      if (!image || typeof ClipboardItem === 'undefined') throw new Error('unsupported')
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': image })])
      setStatus({ tone: 'ok', text: 'Imagem copiada.' })
    } catch {
      setStatus({ tone: 'error', text: 'Este navegador não deixa copiar imagens. Use "Salvar imagem".' })
    }
  }

  function save() {
    if (!preview) return
    const link = document.createElement('a')
    link.href = preview
    link.download = `carreira-${career.player.nick.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`
    link.click()
    setStatus({ tone: 'ok', text: 'Imagem salva.' })
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(GAME_URL)
      setStatus({ tone: 'ok', text: 'Link do jogo copiado.' })
    } catch {
      setStatus({ tone: 'error', text: 'Não foi possível copiar o link.' })
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-panel p-4" aria-label="Compartilhar">
      <h2 className="text-sm font-bold tracking-wide text-muted uppercase">Compartilhe sua carreira</h2>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row">
        <div className="mx-auto w-56 shrink-0 overflow-hidden rounded-xl border border-line bg-night sm:mx-0">
          {preview ? (
            <img src={preview} alt="Card da carreira" className="block w-full" />
          ) : (
            <div className="grid aspect-[4/5] place-items-center text-xs text-muted">Preparando imagem…</div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <button type="button" onClick={share} disabled={!preview} className="rounded-full bg-white px-4 py-2.5 font-black text-night disabled:opacity-50">
            Compartilhar
          </button>
          <button type="button" onClick={copyImage} disabled={!preview} className="rounded-full border border-white/30 px-4 py-2.5 font-bold disabled:opacity-50">
            Copiar imagem
          </button>
          <button type="button" onClick={save} disabled={!preview} className="rounded-full border border-white/30 px-4 py-2.5 font-bold disabled:opacity-50">
            Salvar imagem
          </button>
          <button type="button" onClick={copyLink} className="rounded-full border border-white/30 px-4 py-2.5 font-bold">
            Copiar link do jogo
          </button>
          {status && (
            <p className={`text-sm ${status.tone === 'ok' ? 'text-emerald-300' : 'text-rose-300'}`} role="status">
              {status.text}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
