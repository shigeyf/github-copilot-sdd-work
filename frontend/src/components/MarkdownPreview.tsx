/**
 * Markdown プレビューコンポーネント
 *
 * Markdown テキストをリアルタイムでレンダリングし、プレビュー表示する。
 * react-markdown のデフォルトサニタイズにより XSS 対策を実施。
 */
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownPreviewProps {
  /** プレビューする Markdown テキスト */
  content: string
}

/**
 * Markdown テキストを HTML にレンダリングして表示するコンポーネント
 *
 * react-markdown は dangerouslySetInnerHTML を使用せず、
 * AST から React 要素を生成するため、XSS 攻撃を自動的に防止する。
 */
function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="markdown-preview prose prose-sm max-w-none" data-testid="markdown-preview">
      {content ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      ) : (
        <p className="text-gray-400 italic">プレビューするコンテンツがありません</p>
      )}
    </div>
  )
}

export default MarkdownPreview
