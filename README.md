# Markdown ノート管理アプリ

Markdown 形式のノートを作成・管理するための Web アプリケーションです。
WYSIWYG エディタとMarkdown エディタの両方に対応し、リアルタイムプレビュー機能を提供します。

このプロジェクトは、SpecKit と GitHub Copilot を活用したアプリケーション設計・実装のベストプラクティスを実証するデモとして作成されています。

## 主要機能

- 📝 **Markdown ノート作成・編集・削除**
  - UUID v4 によるノート識別
  - タイトルと本文の管理
  - 作成日時・最終更新日時の自動記録

- ✏️ **2つの編集モード**
  - **WYSIWYG エディタ**: TipTap を使用した直感的な編集
  - **Markdown エディタ**: Markdown 記法による直接編集

- 👀 **リアルタイムプレビュー**
  - 編集中のMarkdown を右側パネルでリアルタイム表示
  - 300ms デバウンスによる快適な編集体験

- 🔄 **未保存変更の保護**
  - 編集中の変更を保護する確認ダイアログ
  - ブラウザの beforeunload イベントによる離脱防止

- 🔍 **検索とフィルタリング**
  - タイトルと本文の全文検索
  - 作成日時・更新日時によるソート

## 技術スタック

### バックエンド

- **言語**: Python 3.11+
- **フレームワーク**: FastAPI
- **データベース**: MongoDB 7.x (motor ドライバー)
- **バリデーション**: Pydantic v2
- **ロギング**: structlog
- **レート制限**: slowapi
- **テスト**: pytest, pytest-asyncio, pytest-cov

### フロントエンド

- **UI フレームワーク**: React 19
- **言語**: TypeScript 5.x (strict mode)
- **ビルドツール**: Vite
- **WYSIWYG エディタ**: TipTap v2
- **Markdown レンダリング**: react-markdown + remark-gfm
- **状態管理**: React Query (TanStack Query)
- **HTTP クライアント**: axios
- **スタイリング**: Tailwind CSS v4 + Headless UI
- **テスト**: Vitest, React Testing Library, Playwright

### インフラストラクチャ

- **コンテナ化**: Docker, Docker Compose
- **開発環境**: VS Code Dev Containers

## クイックスタート

### 前提条件

- **Node.js**: 18.x 以上 (推奨: 20.x LTS)
- **Python**: 3.11 以上
- **MongoDB**: 7.x 以上
- **Docker & Docker Compose** (オプション: 推奨)

### Docker Compose を使用する場合 (推奨)

```bash
# リポジトリのクローン
git clone https://github.com/shigeyf/github-copilot-sdd-work.git
cd github-copilot-sdd-work

# 環境変数の設定
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# サービスの起動
docker-compose up -d

# アプリケーションにアクセス
# フロントエンド: http://localhost:5173
# バックエンド API: http://localhost:8000
# API ドキュメント: http://localhost:8000/docs
```

### ローカル環境で個別にセットアップする場合

#### 1. MongoDB の起動

```bash
# macOS (Homebrew)
brew services start mongodb-community@7.0

# Linux (systemd)
sudo systemctl start mongod
```

#### 2. バックエンドのセットアップ

```bash
cd backend

# 仮想環境の作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係のインストール
pip install -e ".[dev]"

# 環境変数の設定
cp .env.example .env

# 開発サーバーの起動
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. フロントエンドのセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env

# 開発サーバーの起動
npm run dev
```

## 開発ガイド

### バックエンド開発

```bash
cd backend

# テストの実行
pytest

# カバレッジレポート付きテスト
pytest --cov=src --cov-report=html

# コードフォーマット
black src tests

# リンター
ruff check src tests

# 型チェック
mypy src
```

### フロントエンド開発

```bash
cd frontend

# ユニットテストの実行
npm run test

# E2E テストの実行
npm run test:e2e

# カバレッジレポート付きテスト
npm run test:coverage

# リンター
npm run lint

# コードフォーマット
npm run format

# 型チェック
npm run type-check

# 本番用ビルド
npm run build
```

### Pre-commit Hooks のセットアップ

```bash
# ルートディレクトリで実行
make setup
```

## プロジェクト構成

```text
.
├── backend/              # FastAPI バックエンド
│   ├── src/
│   │   ├── main.py      # エントリーポイント
│   │   ├── config.py    # 設定管理
│   │   ├── api/         # API エンドポイント
│   │   ├── models/      # Pydantic モデル
│   │   ├── repositories/ # データアクセス層
│   │   ├── services/    # ビジネスロジック層
│   │   └── utils/       # ユーティリティ
│   └── tests/           # テストファイル
│
├── frontend/            # React フロントエンド
│   ├── src/
│   │   ├── main.tsx     # エントリーポイント
│   │   ├── App.tsx      # ルートコンポーネント
│   │   ├── components/  # 再利用可能コンポーネント
│   │   ├── pages/       # ページコンポーネント
│   │   ├── hooks/       # カスタムフック
│   │   ├── services/    # API クライアント
│   │   └── types/       # TypeScript 型定義
│   └── tests/           # テストファイル
│
├── specs/               # 設計ドキュメント
│   └── 001-markdown-note-manager/
│       ├── spec.md      # 機能仕様書
│       ├── plan.md      # 実装計画書
│       ├── tasks.md     # タスク管理
│       ├── data-model.md # データモデル
│       └── quickstart.md # クイックスタートガイド
│
├── .specify/            # SpecKit 設定
│   ├── memory/          # プロジェクト憲章
│   ├── scripts/         # 自動化スクリプト
│   └── templates/       # ドキュメントテンプレート
│
├── .github/             # GitHub 設定
│   ├── copilot-instructions.md # Copilot 向け指示
│   └── instructions/    # 技術スタック別指示
│
├── docker-compose.yaml  # Docker Compose 設定
└── Makefile             # 開発タスク管理
```

## ドキュメント

### 仕様・設計ドキュメント

- [機能仕様書 (spec.md)](./specs/001-markdown-note-manager/spec.md) - 詳細な機能要件とユーザーストーリー
- [実装計画書 (plan.md)](./specs/001-markdown-note-manager/plan.md) - アーキテクチャと実装計画
- [データモデル (data-model.md)](./specs/001-markdown-note-manager/data-model.md) - データ構造の定義
- [タスク管理 (tasks.md)](./specs/001-markdown-note-manager/tasks.md) - 実装タスクの一覧と進捗

### 技術ドキュメント

- [クイックスタートガイド](./specs/001-markdown-note-manager/quickstart.md) - 詳細なセットアップ手順
- [バックエンド README](./backend/README.md) - バックエンド固有の情報
- [フロントエンド README](./frontend/README.md) - フロントエンド固有の情報
- [プロジェクト憲章](./.specify/memory/constitution.md) - 開発原則と品質基準

### API ドキュメント

- **Swagger UI**: `http://localhost:8000/docs` (バックエンド起動後)
- **ReDoc**: `http://localhost:8000/redoc` (バックエンド起動後)

## アーキテクチャ

### バックエンド: レイヤードアーキテクチャ

```text
API Layer (FastAPI)
    ↓
Service Layer (ビジネスロジック)
    ↓
Repository Layer (データアクセス)
    ↓
MongoDB
```

### フロントエンド: コンポーネントベースアーキテクチャ

```text
Pages (ルーティング)
    ↓
Components (再利用可能コンポーネント)
    ↓
Hooks (状態管理・副作用)
    ↓
Services (API クライアント)
```

## 品質基準

プロジェクト憲章 (Constitution) に基づく品質基準:

- ✅ **テストカバレッジ**: 80%以上（目標: 90%）
- ✅ **API ユニットテスト**: 全エンドポイント 100%
- ✅ **型安全性**: TypeScript strict mode, Python type hints
- ✅ **リンター**: エラー 0 件必須
- ✅ **テスト駆動開発 (TDD)**: Red-Green-Refactor サイクル
- ✅ **シークレット管理**: 環境変数による管理徹底

## 貢献ガイドライン

1. このリポジトリをフォークする
2. 機能ブランチを作成する (`git checkout -b feature/amazing-feature`)
3. 変更をコミットする (`git commit -m 'feat: Add amazing feature'`)
4. ブランチにプッシュする (`git push origin feature/amazing-feature`)
5. Pull Request を作成する

### コミットメッセージ規約

Conventional Commits 形式を推奨:

- `feat:` - 新機能
- `fix:` - バグ修正
- `docs:` - ドキュメント変更
- `test:` - テスト追加・修正
- `refactor:` - リファクタリング
- `chore:` - その他の変更

## ライセンス

Apache 2.0 License

詳細は [LICENSE](LICENSE) を参照してください。

## 謝辞

このプロジェクトは以下のツールとフレームワークを活用しています:

- [GitHub Copilot](https://github.com/features/copilot) - AI ペアプログラミング
- [SpecKit](https://github.com/specify) - 仕様駆動開発ツール
- [FastAPI](https://fastapi.tiangolo.com/) - モダンな Python Web フレームワーク
- [React](https://react.dev/) - UI 構築ライブラリ
- [TipTap](https://tiptap.dev/) - WYSIWYG エディタ
