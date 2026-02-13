/**
 * WYSIWYG エディタコンポーネント
 *
 * TipTap ベースのリッチテキストエディタ。
 * ツールバーで太字、斜体、見出し、リスト、リンクの操作が可能。
 * Markdown との相互変換機能を提供する。
 */
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'
import { useEffect, useCallback } from 'react'

interface WysiwygEditorProps {
  /** Markdown 形式の初期コンテンツ */
  content: string

  /** コンテンツ変更時のコールバック（Markdown 形式で返す） */
  onChange: (markdown: string) => void
}

/**
 * ツールバーコンポーネント
 *
 * エディタの書式設定ボタンを提供する。
 */
function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  /** リンクの追加・編集 */
  const handleLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL を入力してください', previousUrl ?? '')

    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div
      className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-md"
      role="toolbar"
      aria-label="書式設定ツールバー"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 text-sm rounded hover:bg-gray-200 ${
          editor.isActive('bold') ? 'bg-gray-300 font-bold' : ''
        }`}
        aria-label="太字"
        aria-pressed={editor.isActive('bold')}
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 text-sm rounded hover:bg-gray-200 ${
          editor.isActive('italic') ? 'bg-gray-300' : ''
        }`}
        aria-label="斜体"
        aria-pressed={editor.isActive('italic')}
      >
        <em>I</em>
      </button>
      <div className="w-px bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-2 py-1 text-sm rounded hover:bg-gray-200 ${
          editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''
        }`}
        aria-label="見出し1"
        aria-pressed={editor.isActive('heading', { level: 1 })}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 text-sm rounded hover:bg-gray-200 ${
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
        }`}
        aria-label="見出し2"
        aria-pressed={editor.isActive('heading', { level: 2 })}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-2 py-1 text-sm rounded hover:bg-gray-200 ${
          editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''
        }`}
        aria-label="見出し3"
        aria-pressed={editor.isActive('heading', { level: 3 })}
      >
        H3
      </button>
      <div className="w-px bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 text-sm rounded hover:bg-gray-200 ${
          editor.isActive('bulletList') ? 'bg-gray-300' : ''
        }`}
        aria-label="箇条書きリスト"
        aria-pressed={editor.isActive('bulletList')}
      >
        • リスト
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 text-sm rounded hover:bg-gray-200 ${
          editor.isActive('orderedList') ? 'bg-gray-300' : ''
        }`}
        aria-label="番号付きリスト"
        aria-pressed={editor.isActive('orderedList')}
      >
        1. リスト
      </button>
      <div className="w-px bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={handleLink}
        className={`px-2 py-1 text-sm rounded hover:bg-gray-200 ${
          editor.isActive('link') ? 'bg-gray-300' : ''
        }`}
        aria-label="リンク"
        aria-pressed={editor.isActive('link')}
      >
        🔗 リンク
      </button>
    </div>
  )
}

/**
 * WYSIWYG エディタコンポーネント
 *
 * TipTap を使用したリッチテキストエディタ。
 * Markdown との相互変換を tiptap-markdown で行う。
 */
function WysiwygEditor({ content, onChange }: WysiwygEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder: 'ここに本文を入力...',
      }),
      Markdown,
    ],
    content,
    onUpdate: ({ editor: updatedEditor }) => {
      const markdown = updatedEditor.storage.markdown.getMarkdown() as string
      onChange(markdown)
    },
  })

  /** 外部からのコンテンツ更新に対応 */
  useEffect(() => {
    if (editor && content !== editor.storage.markdown.getMarkdown()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div
      className="wysiwyg-editor border border-gray-300 rounded-md shadow-sm"
      role="textbox"
      aria-labelledby="note-content-label"
      aria-multiline="true"
    >
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose max-w-none p-3 min-h-[300px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
      />
    </div>
  )
}

export default WysiwygEditor
