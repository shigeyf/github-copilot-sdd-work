import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

/**
 * ページコンポーネントの遅延読み込み
 *
 * React.lazy を使用してコード分割を実現し、初期バンドルサイズを削減する。
 */
const NotesPage = lazy(() => import("./pages/NotesPage"));
const CreateNotePage = lazy(() => import("./pages/CreateNotePage"));
const EditNotePage = lazy(() => import("./pages/EditNotePage"));

/**
 * ページ読み込み中に表示するフォールバックコンポーネント
 */
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-gray-500">読み込み中...</div>
    </div>
  );
}

/**
 * ルートコンポーネント
 *
 * アプリケーション全体のルーティング設定を管理する。
 * React.lazy と Suspense を使用してコード分割を実現する。
 */
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            Markdownノート管理
          </h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<NotesPage />} />
            <Route path="/notes/new" element={<CreateNotePage />} />
            <Route path="/notes/:id/edit" element={<EditNotePage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
