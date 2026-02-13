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

```bash
# ユニットテスト
npm run test

# カバレッジレポート付き
npm run test:coverage

# E2E テスト
npm run test:e2e
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
