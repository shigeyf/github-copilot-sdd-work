---

description: "Markdownノート管理アプリ実装計画"

---

# 実装計画書: Markdownノート管理アプリ

**ブランチ**: `001-markdown-note-manager` | **日付**: 2026-02-12 | **仕様書**: [spec.md](./spec.md)
**入力**: `/specs/001-markdown-note-manager/spec.md` からの機能仕様書

**備考**: この計画書は `/speckit.plan` コマンドによって作成されました。

## 概要

Markdownノート管理アプリは、ユーザーがブラウザ上でMarkdown形式のノートを作成、編集、削除、閲覧できるWebアプリケーションです。主要な機能は以下の通り：

- **ノート一覧表示**: すべてのMarkdownノートを一覧表示（タイトル、作成日時、最終更新日時）
- **ノート作成**: 新しいMarkdownノートを作成し、MongoDB に保存
- **ノート編集**: 既存のノートを編集し、変更を保存
- **ノート削除**: 確認ダイアログ付きでノートを削除
- **WYSIWYG エディタ**: Markdown記法に不慣れなユーザー向けのビジュアルエディタ
- **リアルタイムプレビュー**: Markdownテキストの入力時に、右側パネルでリアルタイムレンダリング

技術的アプローチ：
- フロントエンド: React 18+ と TypeScript (strict mode) で構築、Vite をビルドツールとして使用
- バックエンド: FastAPI (Python 3.11+) で RESTful API を提供
- データ永続化: MongoDB (NoSQL) でノートデータを JSON ドキュメントとして保存
- 将来的には Azure Cosmos DB へ移行予定（MongoDB API 互換）

## 技術コンテキスト

**言語/バージョン**:
- フロントエンド: TypeScript 5.x (strict mode), React 18+
- バックエンド: Python 3.11+

**主要な依存関係**:
- フロントエンド:
  - React 18+ (UI フレームワーク)
  - Vite (ビルドツール、開発サーバー)
  - TipTap (Markdown エディタライブラリ、WYSIWYG 機能用)
  - react-markdown (Markdown パーサー/レンダラー、プレビュー機能用)
  - Zustand (クライアント状態管理) + React Query (サーバー状態管理)
  - axios (HTTP クライアントライブラリ)
  - Tailwind CSS + Headless UI (UI コンポーネントライブラリ)
- バックエンド:
  - FastAPI (Web フレームワーク)
  - Pydantic (データバリデーション、シリアライゼーション)
  - motor (MongoDB ドライバー、非同期対応)
  - FastAPI CORSMiddleware (CORS 設定)
  - structlog (構造化ロギング)

**ストレージ**:
- MongoDB (NoSQL ドキュメントデータベース)
  - ノートを JSON ドキュメントとして保存
  - UUID v4 を識別子として使用
  - 将来的に Azure Cosmos DB (MongoDB API) へ移行予定

**テスト**:
- フロントエンド: Vitest, React Testing Library
- バックエンド: pytest, pytest-asyncio
- E2E テスト: Playwright (複数ブラウザ対応、TypeScript サポート)
- API 契約テスト: pytest + httpx + OpenAPI スキーマ検証

**ターゲットプラットフォーム**:
- Web ブラウザ (Chrome, Firefox, Safari, Edge の最新版)
- ローカル開発環境 (Windows, macOS, Linux)
- 将来的に Azure App Service へデプロイ予定

**プロジェクトタイプ**: Web アプリケーション (frontend + backend 分離構成)

**パフォーマンス目標**:
- ノート一覧読み込み: 3秒以内 (100個のノートがある場合でも)
- Markdown プレビュー更新: 500ミリ秒以内
- ノート保存/削除: 2秒以内
- 10,000文字以上の長文ノート編集: 2秒以内でプレビュー表示

**制約**:
- ローカル環境での開発・動作が必須
- 将来的なクラウド移行を考慮した設計
- セキュリティ: XSS 対策、入力バリデーション必須
- アクセシビリティ: WCAG 2.1 AA レベル準拠を推奨

**規模/スコープ**:
- 初期段階: シングルユーザー向け
- 想定ノート数: 100〜1,000件
- コードベース規模: 小〜中規模 (5,000〜10,000 LOC 見込み)
- UI 画面数: 3〜5画面 (一覧、作成、編集、削除確認、設定)

## 構成チェック

_ゲート: フェーズ 0 の調査開始前に通過必須。フェーズ 1 の設計後に再確認。_

_参照: `.specify/memory/constitution.md` の基本原則に準拠すること。_

### Constitution 準拠チェックリスト

#### フェーズ 0 開始前 (初期評価)

- [x] **最新の安定バージョンを使用しているか**
  - Python 3.11+, FastAPI 最新安定版
  - React 18+, TypeScript 5.x, Vite 最新安定版
  - ✅ 準拠

- [x] **型安全性が確保されているか**
  - TypeScript strict mode を使用
  - Python type hints を全関数に記述予定
  - ✅ 準拠

- [x] **TDD アプローチを採用しているか**
  - Red-Green-Refactor サイクルを遵守予定
  - ✅ 計画済み

- [x] **すべての API にユニットテストが計画されているか**
  - すべての FastAPI エンドポイントにテストを記述予定
  - ✅ 計画済み

- [x] **リンター・フォーマッターが設定されているか**
  - フロントエンド: ESLint, Prettier
  - バックエンド: Black, Ruff (または Pylint)
  - ✅ 計画済み

- [x] **シークレット管理が適切に計画されているか**
  - MongoDB 接続文字列は環境変数で管理
  - `.env` ファイルは `.gitignore` に追加
  - ✅ 計画済み

**結果**: すべてのゲートを通過。フェーズ 0 調査を開始可能。

#### フェーズ 1 設計後 (再評価)

- [x] **最新の安定バージョンを使用しているか**
  - research.md で選定した技術はすべて最新安定版
  - TipTap, react-markdown, Zustand, React Query, axios, motor すべて最新版
  - ✅ 準拠

- [x] **型安全性が確保されているか**
  - data-model.md で TypeScript 型定義と Pydantic モデルを定義
  - すべての API エンドポイントに型が定義されている
  - ✅ 準拠

- [x] **TDD アプローチを採用しているか**
  - quickstart.md でテスト実行方法を記載
  - contracts/openapi.yaml で API 契約を明確に定義
  - ✅ 準拠

- [x] **すべての API にユニットテストが計画されているか**
  - openapi.yaml で全エンドポイントを定義
  - quickstart.md でテスト実行方法を記載
  - ✅ 準拠

- [x] **リンター・フォーマッターが設定されているか**
  - quickstart.md で Black, Ruff, ESLint, Prettier の実行方法を記載
  - ✅ 準拠

- [x] **シークレット管理が適切に計画されているか**
  - quickstart.md で .env ファイルの使用方法を記載
  - MongoDB 接続文字列を環境変数で管理
  - ✅ 準拠

**結果**: フェーズ 1 完了後もすべてのゲートを通過。Constitution に準拠している。

## プロジェクト構造

### ドキュメント (この機能用)

```text
specs/001-markdown-note-manager/
├── plan.md              # このファイル (/speckit.plan コマンド出力)
├── research.md          # フェーズ 0 出力 (調査・技術選定)
├── data-model.md        # フェーズ 1 出力 (データモデル定義)
├── quickstart.md        # フェーズ 1 出力 (クイックスタートガイド)
├── contracts/           # フェーズ 1 出力 (API 契約定義)
│   └── openapi.yaml     # OpenAPI 3.0 仕様
└── tasks.md             # フェーズ 2 出力 (/speckit.tasks コマンド)
```

### ソースコード (リポジトリルート)

このプロジェクトは Web アプリケーション構成を採用します。フロントエンドとバックエンドを分離し、それぞれ独立して開発・テスト・デプロイ可能な構造とします。

```text
backend/
├── src/
│   ├── main.py                 # FastAPI アプリケーションエントリーポイント
│   ├── config.py               # 環境変数・設定管理
│   ├── models/                 # Pydantic モデル (リクエスト/レスポンス)
│   │   ├── __init__.py
│   │   └── note.py             # ノートモデル定義
│   ├── repositories/           # データアクセス層 (MongoDB 操作)
│   │   ├── __init__.py
│   │   └── note_repository.py # ノートリポジトリ
│   ├── services/               # ビジネスロジック層
│   │   ├── __init__.py
│   │   └── note_service.py     # ノートサービス
│   ├── api/                    # API エンドポイント (ルーター)
│   │   ├── __init__.py
│   │   ├── routes.py           # ルーター集約
│   │   └── notes.py            # ノート関連エンドポイント
│   └── utils/                  # ユーティリティ関数
│       ├── __init__.py
│       └── db.py               # MongoDB 接続管理
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # pytest フィクスチャ
│   ├── unit/                   # ユニットテスト
│   │   ├── test_note_service.py
│   │   └── test_note_repository.py
│   └── integration/            # 統合テスト (API テスト)
│       └── test_notes_api.py
├── pyproject.toml              # プロジェクト設定、依存関係
├── .env.example                # 環境変数サンプル
└── README.md                   # バックエンド README

frontend/
├── src/
│   ├── main.tsx                # React アプリケーションエントリーポイント
│   ├── App.tsx                 # ルートコンポーネント
│   ├── components/             # 再利用可能コンポーネント
│   │   ├── NoteList.tsx        # ノート一覧コンポーネント
│   │   ├── NoteEditor.tsx      # ノート編集コンポーネント
│   │   ├── MarkdownPreview.tsx # Markdown プレビューコンポーネント
│   │   └── WysiwygEditor.tsx   # WYSIWYG エディタコンポーネント
│   ├── pages/                  # ページコンポーネント
│   │   ├── NotesPage.tsx       # ノート一覧ページ
│   │   ├── CreateNotePage.tsx  # ノート作成ページ
│   │   └── EditNotePage.tsx    # ノート編集ページ
│   ├── services/               # API クライアント
│   │   └── noteService.ts      # ノート API 呼び出し
│   ├── types/                  # TypeScript 型定義
│   │   └── note.ts             # ノート型定義
│   ├── hooks/                  # カスタムフック
│   │   └── useNotes.ts         # ノート管理フック
│   └── styles/                 # スタイル定義
│       └── global.css          # グローバルスタイル
├── tests/
│   ├── unit/                   # ユニットテスト
│   │   └── components/
│   │       ├── NoteList.test.tsx
│   │       └── NoteEditor.test.tsx
│   └── e2e/                    # E2E テスト
│       └── notes.spec.ts
├── public/                     # 静的アセット
├── index.html                  # HTML エントリーポイント
├── vite.config.ts              # Vite 設定
├── tsconfig.json               # TypeScript 設定
├── .env.example                # 環境変数サンプル
└── README.md                   # フロントエンド README
```

**構造の決定**:
- Web アプリケーション構成 (frontend + backend 分離) を採用
- レイヤードアーキテクチャ: Router → Service → Repository の3層構造
- フロントエンドは React コンポーネントベースで構成
- バックエンドは FastAPI のルーター、サービス、リポジトリパターンを使用
- テストは各層に対応して配置 (unit, integration, e2e)

## 複雑性の追跡

現時点では、Constitution の基本原則に違反する項目はありません。すべての要件が規約に準拠しています。

| 違反項目 | 必要な理由 | より単純な代替案を却下した理由 |
| -------- | ---------- | ------------------------------ |
| なし     | -          | -                              |

---

**次のステップ**: フェーズ 0 (調査) を開始し、`research.md` を作成します。

---

## フェーズ完了サマリー

### フェーズ 0: 調査 ✅ 完了

**成果物**: `research.md`

調査完了項目:
- Markdown エディタライブラリ: **TipTap** を選定
- Markdown パーサー/レンダラー: **react-markdown** を選定
- 状態管理ライブラリ: **Zustand** + **React Query** を選定
- HTTP クライアント: **axios** を選定
- UI コンポーネント: **Tailwind CSS** + **Headless UI** を選定
- MongoDB ドライバー: **motor** (非同期) を選定
- E2E テスト: **Playwright** を選定
- ロギング: **structlog** を選定

すべての「要確認」項目が解決され、技術スタックが確定しました。

### フェーズ 1: 設計 ✅ 完了

**成果物**:
- `data-model.md`: データモデル、バリデーション、スキーマ定義
- `contracts/openapi.yaml`: REST API の OpenAPI 3.0 仕様
- `quickstart.md`: 開発者向けクイックスタートガイド

主要な設計決定:
- MongoDB コレクション `notes` にノートを保存
- UUID v4 を識別子として使用
- REST API で 5 つのエンドポイントを提供 (GET /notes, POST /notes, GET /notes/{id}, PUT /notes/{id}, DELETE /notes/{id})
- フロントエンドは React 18+ + TypeScript + Vite
- バックエンドは FastAPI + Python 3.11+
- レイヤードアーキテクチャ: Router → Service → Repository

Constitution 準拠チェック: ✅ すべてのゲートを通過

### 次のフェーズ: タスク分解 (フェーズ 2)

次のステップは `/speckit.tasks` コマンドで実行可能です。
このコマンドは、実装計画 (plan.md) とデータモデル (data-model.md)、API 契約 (contracts/openapi.yaml) に基づいて、
実行可能なタスクリスト (`tasks.md`) を生成します。

**コマンド**: `/speckit.tasks`

---

## 最終確認

- ✅ すべての技術選定が完了
- ✅ データモデルが定義されている
- ✅ API 契約が OpenAPI 形式で文書化されている
- ✅ 開発環境のセットアップ手順が明確
- ✅ Constitution の基本原則に準拠
- ✅ テスト戦略が明確 (pytest, Vitest, Playwright)

**ブランチ**: `copilot/create-project-implementation-plan` (現在のブランチ)
**実装計画パス**: `specs/001-markdown-note-manager/plan.md`

この計画書は、実装フェーズに進むための完全な技術仕様と設計ガイドラインを提供しています。
