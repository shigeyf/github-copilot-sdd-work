/**
 * ノート一覧コンポーネント
 *
 * ノートのリストを表示し、各ノートのタイトル、作成日時、最終更新日時を表示する。
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Note } from '../types/note'
import { useDeleteNote } from '../hooks/useNotes'
import DeleteConfirmDialog from './DeleteConfirmDialog'

interface NoteListProps {
  /** 表示するノートの配列 */
  notes: Note[]
}

/**
 * 日時文字列をフォーマットする
 */
function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * ノート一覧を表示するコンポーネント
 */
function NoteList({ notes }: NoteListProps) {
  const deleteNote = useDeleteNote()
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null)

  const handleDeleteClick = (e: React.MouseEvent, note: Note) => {
    e.preventDefault()
    setDeleteTarget(note)
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    deleteNote.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null)
      },
    })
  }

  const handleDeleteCancel = () => {
    setDeleteTarget(null)
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">ノートがありません</p>
        <p className="text-sm mt-2">「新規作成」ボタンをクリックして最初のノートを作成しましょう</p>
      </div>
    )
  }

  return (
    <>
      <ul className="divide-y divide-gray-200">
        {notes.map((note) => (
          <li key={note.id}>
            <div className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors">
              <Link to={`/notes/${note.id}/edit`} className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{note.title}</h3>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                  <span>作成: {formatDateTime(note.created_at)}</span>
                  <span>更新: {formatDateTime(note.updated_at)}</span>
                </div>
              </Link>
              <button
                type="button"
                onClick={(e) => handleDeleteClick(e, note)}
                className="ml-4 flex-shrink-0 px-3 py-1 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                削除
              </button>
            </div>
          </li>
        ))}
      </ul>
      <DeleteConfirmDialog
        isOpen={deleteTarget !== null}
        noteTitle={deleteTarget?.title ?? ''}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteNote.isPending}
      />
    </>
  )
}

export default NoteList
