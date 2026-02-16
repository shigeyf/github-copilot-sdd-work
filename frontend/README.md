# Markdownノート管理アプリ - フロントエンド

React + TypeScript + Vite を使用した Markdownノート管理アプリのフロントエンドです。

## 技術スタック

- **UI フレームワーク**: React 19
- **言語**: TypeScript 5.x (strict mode)
- **ビルドツール**: Vite
- **エディタ**: TipTap (WYSIWYG)
- **Markdown レンダリング**: react-markdown
- **状態管理**: Zustand + React Query
- **HTTP クライアント**: axios
- **スタイリング**: Tailwind CSS + Headless UI
- **テスト**: Vitest + React Testing Library

## セットアップ

### 前提条件

- Node.js 18 以上 (推奨: 20.x LTS)

### インストール

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
```

### 開発サーバーの起動

```bash
npm run dev
```

アプリケーション: `http://localhost:5173`

## テスト

本プロジェクトでは、複数のタイプのテストを実装しています。

### ユニットテスト

コンポーネントとカスタムフックの単体テストです。

```bash
# すべてのユニットテストを実行
npm run test

# ウォッチモードで実行
npm run test:watch

# カバレッジレポート付きで実行
npm run test:coverage
```

**テストファイルの場所**: `tests/unit/`

### E2E テスト

Playwright を使用したエンドツーエンドテストです。

```bash
# すべての E2E テストを実行
npm run test:e2e

# ヘッドレスモードで実行
npx playwright test

# UI モードで実行
npx playwright test --ui

# 特定のテストファイルのみ実行
npx playwright test tests/e2e/notes.spec.ts
```

**テストファイルの場所**: `tests/e2e/`

**前提条件**:

- バックエンド API が `http://localhost:8000` で起動していること
- MongoDB が起動していること

### アクセシビリティテスト

WCAG 2.1 AA 準拠を確認するためのテストです。

```bash
# アクセシビリティテストを実行
npx playwright test tests/a11y/

# 特定のページのみテスト
npx playwright test tests/a11y/accessibility.spec.ts
```

**テストファイルの場所**: `tests/a11y/`

### パフォーマンステスト

アプリケーションのパフォーマンス要件を検証するテストです。

```bash
# パフォーマンステストを実行
npx playwright test tests/performance/

# 特定のパフォーマンステストのみ実行
npx playwright test tests/performance/startup_performance.spec.ts
```

**テストファイルの場所**: `tests/performance/`

**検証項目**:

- SC-003: プレビュー更新時間（500ms 以内）
- SC-004: 大規模データでの起動時間（100 個のノートで 3 秒以内）
- SC-005: WYSIWYG エディタのパフォーマンス
- SC-008: 大規模ノートの編集（10,000 文字で 2 秒以内）

### すべてのテストを実行

```bash
# ユニットテスト + E2E テスト + アクセシビリティテスト + パフォーマンステスト
npm run test && npm run test:e2e
```

### テストカバレッジの確認

```bash
# カバレッジレポートを生成
npm run test:coverage

# カバレッジレポートを表示（ブラウザで開く）
# カバレッジレポートは coverage/ ディレクトリに生成されます
open coverage/index.html
```

**カバレッジ目標**: 80% 以上（QC-001 準拠）

### テストヘルパー関数

テストで再利用可能なヘルパー関数は `tests/utils/testHelpers.ts` に定義されています。

```typescript
import {
  createBulkNotes,
  cleanupNotes,
  simulateNetworkError,
  simulateServerError,
  measureTime,
  generateLargeText,
} from "../utils/testHelpers";

// 100 個のテストノートを作成
await createBulkNotes(100);

// すべてのノートをクリーンアップ
await cleanupNotes();

// ネットワークエラーをシミュレート
await simulateNetworkError(page);

// 実行時間を計測
const time = await measureTime(async () => {
  await page.goto("/");
});
```

## リンティング

```bash
# ESLint
npm run lint

# Prettier
npm run format

# 型チェック
npm run type-check
```

## ビルド

```bash
# 本番用ビルド
npm run build

# ビルドプレビュー
npm run preview
```

## プロジェクト構造

```text
frontend/
├── src/
│   ├── main.tsx             # React エントリーポイント
│   ├── App.tsx              # ルートコンポーネント
│   ├── components/          # 再利用可能コンポーネント
│   ├── pages/               # ページコンポーネント
│   ├── services/            # API クライアント
│   ├── types/               # TypeScript 型定義
│   ├── hooks/               # カスタムフック
│   └── styles/              # スタイル定義
├── tests/                   # テストファイル
├── public/                  # 静的アセット
├── index.html               # HTML エントリーポイント
├── vite.config.ts           # Vite 設定
├── tsconfig.json            # TypeScript 設定
└── .env.example             # 環境変数サンプル
```
