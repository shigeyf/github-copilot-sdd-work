import { Routes, Route } from 'react-router-dom'
import NotesPage from './pages/NotesPage'

/**
 * ルートコンポーネント
 *
 * アプリケーション全体のルーティング設定を管理する。
 */
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Markdownノート管理</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<NotesPage />} />
          <Route path="/notes/new" element={<div>ノート作成（実装予定）</div>} />
          <Route path="/notes/:id/edit" element={<div>ノート編集（実装予定）</div>} />
        </Routes>
      </main>
    </div>
  )
}

export default App
