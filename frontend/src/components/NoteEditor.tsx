/**
 * ノートエディタコンポーネント
 *
 * タイトル入力、本文入力、保存ボタンを提供する。
 */
import { useState } from 'react'
import type { CreateNoteRequest } from '../types/note'

interface NoteEditorProps {
  /** 保存ボタンクリック時のコールバック */
  onSave: (data: CreateNoteRequest) => void

  /** 初期タイトル */
  initialTitle?: string

  /** 初期本文 */
  initialContent?: string

  /** 保存中かどうか */
  isSaving?: boolean

  /** 入力変更時のコールバック */
  onChange?: () => void
}

/**
 * ノート編集用のフォームコンポーネント
 */
function NoteEditor({
  onSave,
  initialTitle = '',
  initialContent = '',
  isSaving = false,
  onChange,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)

  const isValid = title.trim().length > 0
  const isDisabled = !isValid || isSaving

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onSave({ title, content })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="note-title" className="block text-sm font-medium text-gray-700 mb-1">
          タイトル
        </label>
        <input
          id="note-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            onChange?.()
          }}
          placeholder="ノートのタイトルを入力"
          maxLength={200}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 mb-1">
          本文
        </label>
        <textarea
          id="note-content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            onChange?.()
          }}
          placeholder="Markdown形式で本文を入力"
          rows={15}
          maxLength={50000}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isDisabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  )
}

export default NoteEditor
