import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import DashboardPage from '../pages/DashboardPage'
import { useAppStore } from '../store/appStore'

describe('DashboardPage', () => {
  afterEach(cleanup)

  beforeEach(() => {
    useAppStore.setState({ documents: [] })
  })

  it('mostra estado vazio quando não há documentos', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Documentos')).toBeTruthy()
    expect(screen.getAllByText('0').length).toBe(4)
  })

  it('conta documentos, processados e análises a partir do store', () => {
    useAppStore.setState({
      documents: [
        { id: '1', name: 'a.pdf', type: 'application/pdf', size: 10, uploadedAt: '2026-01-01', processed: true, analysis: {} },
        { id: '2', name: 'b.txt', type: 'text/plain', size: 5, uploadedAt: '2026-01-02', processed: false },
      ],
    })
    render(<DashboardPage />)
    const value = (label: string) => screen.getByText(label).nextElementSibling?.textContent
    expect(value('Documentos')).toBe('2')
    expect(value('Processados')).toBe('1')
    expect(value('Análises')).toBe('1')
    expect(screen.getByText('a.pdf')).toBeTruthy()
  })
})
