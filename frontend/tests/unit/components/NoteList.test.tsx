/**
 * NoteList コンポーネントのユニットテスト
 *
 * レンダリング、空状態の表示を検証する。
 */
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import NoteList from '../../../src/components/NoteList'
import type { Note } from '../../../src/types/note'

const sampleNotes: Note[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'テストノート1',
    content: '# テスト\n\n本文1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T12:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'テストノート2',
    content: '# テスト\n\n本文2',
    created_at: '2026-01-02T00:00:00Z',
    updated_at: '2026-01-02T12:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'テストノート3',
    content: '# テスト\n\n本文3',
    created_at: '2026-01-03T00:00:00Z',
    updated_at: '2026-01-03T12:00:00Z',
  },
]

/**
 * NoteList をラップして BrowserRouter を提供する
 */
function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('NoteList', () => {
  it('ノート一覧が表示されること', () => {
    renderWithRouter(<NoteList notes={sampleNotes} />)

    expect(screen.getByText('テストノート1')).toBeInTheDocument()
    expect(screen.getByText('テストノート2')).toBeInTheDocument()
    expect(screen.getByText('テストノート3')).toBeInTheDocument()
  })

  it('ノートが0件の場合、空状態メッセージが表示されること', () => {
    renderWithRouter(<NoteList notes={[]} />)

    expect(screen.getByText('ノートがありません')).toBeInTheDocument()
  })

  it('各ノートにタイトル、作成日時、更新日時が表示されること', () => {
    renderWithRouter(<NoteList notes={[sampleNotes[0]]} />)

    expect(screen.getByText('テストノート1')).toBeInTheDocument()
    // 作成日時と更新日時のテキストが表示されていることを確認
    const dateElements = screen.getAllByText(/2026/)
    expect(dateElements.length).toBeGreaterThanOrEqual(2)
  })
})
