// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'

function setReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

function startCareer() {
  fireEvent.click(screen.getByRole('button', { name: 'Começar carreira' }))
  fireEvent.change(screen.getByPlaceholderText('Ex.: brTT'), { target: { value: 'Teste' } })
  fireEvent.click(screen.getByLabelText(/Mid/))
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar identidade' }))
}

function decisionPanel() {
  return screen.queryByRole('region', { name: 'Decisão' })
}

beforeEach(() => {
  window.localStorage.clear()
  window.scrollTo = () => {}
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('jogo completo pela interface', () => {
  it('da intro ao resumo, escolhendo sempre a primeira opção', () => {
    setReducedMotion(true)
    render(<App />)
    startCareer()
    expect(screen.getByText('Primeira proposta')).toBeTruthy()

    for (let guard = 0; guard < 200 && decisionPanel(); guard += 1) {
      const buttons = within(decisionPanel()!).getAllByRole('button')
      fireEvent.click(buttons[0])
    }

    expect(screen.getByText('Sua carreira chegou ao fim')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Ver resumo' }))
    expect(screen.getByText('Resumo da carreira')).toBeTruthy()
    expect(screen.getByText('Teste')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Jogar novamente' })).toBeTruthy()
  })

  it('mostra a revelação animada e depois a próxima decisão', () => {
    setReducedMotion(false)
    vi.useFakeTimers()
    render(<App />)
    startCareer()
    const first = within(decisionPanel()!).getAllByRole('button')[0]
    fireEvent.click(first)
    // Durante a revelação, as opções ficam travadas.
    expect(within(decisionPanel()!).getAllByRole('button')[0].hasAttribute('disabled')).toBe(true)
    // Cada etapa da revelação agenda a próxima depois de a tela atualizar.
    for (let i = 0; i < 40; i += 1) {
      act(() => {
        vi.advanceTimersByTime(500)
      })
    }
    expect(screen.queryByText('Primeira proposta')).toBeNull()
    expect(screen.getAllByText(/CBLOL Cup 2027/).length).toBeGreaterThan(0)
  })

  it('o botão discreto encerra a carreira depois de confirmar', () => {
    setReducedMotion(true)
    render(<App />)
    startCareer()
    fireEvent.click(within(decisionPanel()!).getAllByRole('button')[0])
    fireEvent.click(screen.getByRole('button', { name: 'Encerrar carreira' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sim, encerrar' }))
    expect(screen.getByText('Sua carreira chegou ao fim')).toBeTruthy()
  })

  it('a carreira em andamento é salva e retomada', () => {
    setReducedMotion(true)
    const { unmount } = render(<App />)
    startCareer()
    fireEvent.click(within(decisionPanel()!).getAllByRole('button')[0])
    const title = within(decisionPanel()!).getByRole('heading').textContent
    unmount()
    render(<App />)
    expect(within(decisionPanel()!).getByRole('heading').textContent).toBe(title)
  })
})
