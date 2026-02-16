/**
 * 削除確認ダイアログコンポーネント
 *
 * ノート削除前にユーザーに確認を求めるダイアログ。
 */

interface DeleteConfirmDialogProps {
  /** ダイアログを表示するかどうか */
  isOpen: boolean;

  /** 削除対象のノートタイトル */
  noteTitle: string;

  /** 「キャンセル」ボタンクリック時のコールバック */
  onCancel: () => void;

  /** 「削除」ボタンクリック時のコールバック */
  onConfirm: () => void;

  /** 削除処理中かどうか */
  isDeleting?: boolean;
}

/**
 * 削除確認ダイアログを表示するコンポーネント
 */
function DeleteConfirmDialog({
  isOpen,
  noteTitle,
  onCancel,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3
          id="delete-confirm-title"
          className="text-lg font-semibold text-gray-900 mb-2"
        >
          ノートを削除しますか？
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          「{noteTitle}」を削除します。この操作は取り消せません。
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isDeleting ? "削除中..." : "削除"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmDialog;
