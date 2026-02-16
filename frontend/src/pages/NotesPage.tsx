/**
 * ノート一覧ページ
 *
 * ノートの一覧を表示し、空状態メッセージも管理する。
 */
import { Link } from "react-router-dom";
import { useNotes } from "../hooks/useNotes";
import NoteList from "../components/NoteList";

/**
 * ノート一覧ページコンポーネント
 */
function NotesPage() {
  const { data, isLoading, isError, error } = useNotes();

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>エラーが発生しました</p>
        <p className="text-sm mt-2">
          {error instanceof Error
            ? error.message
            : "ノートの取得に失敗しました"}
        </p>
      </div>
    );
  }

  const notes = data?.notes ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">ノート一覧</h2>
        <Link
          to="/notes/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          新規作成
        </Link>
      </div>
      <div className="bg-white shadow rounded-lg">
        <NoteList notes={notes} />
      </div>
    </div>
  );
}

export default NotesPage;
