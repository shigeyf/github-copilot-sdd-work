/**
 * ノート作成ページ
 *
 * NoteEditor を表示し、保存後に一覧画面へ遷移する。
 */
import { useNavigate } from 'react-router-dom'
import NoteEditor from '../components/NoteEditor'
import { useCreateNote } from '../hooks/useNotes'
import type { CreateNoteRequest } from '../types/note'

/**
 * ノート作成ページコンポーネント
 */
function CreateNotePage() {
  const navigate = useNavigate()
  const createNote = useCreateNote()

  const handleSave = (data: CreateNoteRequest) => {
    createNote.mutate(data, {
      onSuccess: () => {
        navigate('/')
      },
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">新規ノート作成</h2>
      </div>
      {createNote.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          ノートの作成に失敗しました。もう一度お試しください。
        </div>
      )}
      <div className="bg-white shadow rounded-lg p-6">
        <NoteEditor onSave={handleSave} isSaving={createNote.isPending} />
      </div>
    </div>
  )
}

export default CreateNotePage
