/**
 * ノートエディタコンポーネント
 *
 * タイトル入力、本文入力（Markdown / WYSIWYG モード切り替え）、保存ボタンを提供する。
 * Markdown モードではリアルタイムプレビューパネルを右側に表示可能。
 */
import { useState, useRef, useEffect } from 'react'
import WysiwygEditor from './WysiwygEditor'
import MarkdownPreview from './MarkdownPreview'
import type { CreateNoteRequest } from '../types/note'

/** エディタモードの型定義 */
type EditorMode = 'markdown' | 'wysiwyg'

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
 *
 * Markdown モードと WYSIWYG モードを切り替えて編集できる。
 * Markdown モードではリアルタイムプレビューパネルを右側に表示可能。
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
  const [editorMode, setEditorMode] = useState<EditorMode>('markdown')
  const [showPreview, setShowPreview] = useState(true)
  const [debouncedContent, setDebouncedContent] = useState(initialContent)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** デバウンス処理: 300ms 後にプレビュー用コンテンツを更新 */
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedContent(content)
    }, 300)
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [content])

  const isValid = title.trim().length > 0
  const isDisabled = !isValid || isSaving

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onSave({ title, content })
    }
  }

  /** WYSIWYG エディタからのコンテンツ変更を処理 */
  const handleWysiwygChange = (markdown: string) => {
    setContent(markdown)
    onChange?.()
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
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor={editorMode === 'markdown' ? 'note-content' : undefined}
            id="note-content-label"
            className="block text-sm font-medium text-gray-700"
          >
            本文
          </label>
          <div className="flex items-center gap-2">
            {editorMode === 'markdown' && (
              <button
                type="button"
                onClick={() => setShowPreview((prev) => !prev)}
                className="px-3 py-1 text-xs font-medium rounded-md border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                aria-label={showPreview ? 'プレビューを非表示' : 'プレビューを表示'}
              >
                {showPreview ? 'プレビューを非表示' : 'プレビューを表示'}
              </button>
            )}
            <div
              className="flex rounded-md shadow-sm"
              role="group"
              aria-label="エディタモード切り替え"
            >
              <button
                type="button"
                onClick={() => setEditorMode('markdown')}
                className={`px-3 py-1 text-xs font-medium rounded-l-md border ${
                  editorMode === 'markdown'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                aria-pressed={editorMode === 'markdown'}
              >
                Markdownモード
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('wysiwyg')}
                className={`px-3 py-1 text-xs font-medium rounded-r-md border-t border-r border-b ${
                  editorMode === 'wysiwyg'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                aria-pressed={editorMode === 'wysiwyg'}
              >
                WYSIWYGモード
              </button>
            </div>
          </div>
        </div>
        {editorMode === 'markdown' ? (
          <div className={`flex gap-4 ${showPreview ? '' : ''}`}>
            <div className={showPreview ? 'w-1/2' : 'w-full'}>
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
            {showPreview && (
              <div
                className="w-1/2 border border-gray-300 rounded-md p-4 overflow-y-auto"
                style={{ maxHeight: '400px' }}
                aria-label="プレビューパネル"
              >
                <MarkdownPreview content={debouncedContent} />
              </div>
            )}
          </div>
        ) : (
          <WysiwygEditor content={content} onChange={handleWysiwygChange} />
        )}
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
