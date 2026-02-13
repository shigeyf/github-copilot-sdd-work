/**
 * NoteEditor コンポーネントのユニットテスト
 *
 * 入力、バリデーション、保存ボタンの動作を検証する。
 */
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import NoteEditor from '../../../src/components/NoteEditor'

/**
 * NoteEditor をラップして BrowserRouter を提供する
 */
function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('NoteEditor', () => {
  it('タイトル入力フィールドが表示されること', () => {
    renderWithRouter(<NoteEditor onSave={vi.fn()} />)

    expect(screen.getByLabelText('タイトル')).toBeInTheDocument()
  })

  it('本文入力フィールドが表示されること', () => {
    renderWithRouter(<NoteEditor onSave={vi.fn()} />)

    expect(screen.getByLabelText('本文')).toBeInTheDocument()
  })

  it('保存ボタンが表示されること', () => {
    renderWithRouter(<NoteEditor onSave={vi.fn()} />)

    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument()
  })

  it('タイトルが空の場合、保存ボタンが無効であること', () => {
    renderWithRouter(<NoteEditor onSave={vi.fn()} />)

    const saveButton = screen.getByRole('button', { name: '保存' })
    expect(saveButton).toBeDisabled()
  })

  it('タイトルを入力すると保存ボタンが有効になること', async () => {
    const user = userEvent.setup()
    renderWithRouter(<NoteEditor onSave={vi.fn()} />)

    const titleInput = screen.getByLabelText('タイトル')
    await user.type(titleInput, 'テストタイトル')

    const saveButton = screen.getByRole('button', { name: '保存' })
    expect(saveButton).toBeEnabled()
  })

  it('保存ボタンをクリックすると onSave が呼ばれること', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    renderWithRouter(<NoteEditor onSave={onSave} />)

    const titleInput = screen.getByLabelText('タイトル')
    await user.type(titleInput, 'テストタイトル')

    const contentInput = screen.getByLabelText('本文')
    await user.type(contentInput, '# テスト本文')

    const saveButton = screen.getByRole('button', { name: '保存' })
    await user.click(saveButton)

    expect(onSave).toHaveBeenCalledWith({
      title: 'テストタイトル',
      content: '# テスト本文',
    })
  })

  it('初期値が正しく表示されること', () => {
    renderWithRouter(
      <NoteEditor
        onSave={vi.fn()}
        initialTitle="初期タイトル"
        initialContent="初期本文"
      />,
    )

    expect(screen.getByLabelText('タイトル')).toHaveValue('初期タイトル')
    expect(screen.getByLabelText('本文')).toHaveValue('初期本文')
  })

  it('読み込み中は保存ボタンが無効であること', async () => {
    const user = userEvent.setup()
    renderWithRouter(<NoteEditor onSave={vi.fn()} isSaving={true} />)

    const titleInput = screen.getByLabelText('タイトル')
    await user.type(titleInput, 'テスト')

    const saveButton = screen.getByRole('button', { name: '保存中...' })
    expect(saveButton).toBeDisabled()
  })
})
