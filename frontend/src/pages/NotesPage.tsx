/**
 * ノート一覧ページ
 *
 * ノートの一覧を表示し、空状態メッセージも管理する。
 */
import { useNotes } from '../hooks/useNotes'
import NoteList from '../components/NoteList'

/**
 * ノート一覧ページコンポーネント
 */
function NotesPage() {
  const { data, isLoading, isError, error } = useNotes()

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>エラーが発生しました</p>
        <p className="text-sm mt-2">
          {error instanceof Error ? error.message : 'ノートの取得に失敗しました'}
        </p>
      </div>
    )
  }

  const notes = data?.notes ?? []

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">ノート一覧</h2>
      </div>
      <div className="bg-white shadow rounded-lg">
        <NoteList notes={notes} />
      </div>
    </div>
  )
}

export default NotesPage
