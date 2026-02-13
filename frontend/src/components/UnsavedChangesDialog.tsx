/**
 * 未保存変更警告ダイアログコンポーネント
 *
 * 未保存の変更がある状態でページ遷移しようとした場合に表示される確認ダイアログ。
 */

interface UnsavedChangesDialogProps {
  /** ダイアログを表示するかどうか */
  isOpen: boolean

  /** 「キャンセル」ボタンクリック時のコールバック（編集に戻る） */
  onCancel: () => void

  /** 「破棄」ボタンクリック時のコールバック（変更を破棄して遷移） */
  onDiscard: () => void
}

/**
 * 未保存変更の確認ダイアログを表示するコンポーネント
 */
function UnsavedChangesDialog({ isOpen, onCancel, onDiscard }: UnsavedChangesDialogProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-changes-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 id="unsaved-changes-title" className="text-lg font-semibold text-gray-900 mb-2">
          未保存の変更があります
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          変更が保存されていません。このまま移動すると変更内容は失われます。
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            編集に戻る
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            変更を破棄
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnsavedChangesDialog
