---

description: "Markdownノート管理アプリの実装タスクリスト"

---

# タスク: Markdownノート管理アプリ

**入力**: `/specs/001-markdown-note-manager/` の設計ドキュメント
**前提条件**: `plan.md` (必須), `spec.md` (ユーザーストーリー), `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`

**Constitution 準拠**: すべてのタスクは `.specify/memory/constitution.md` の基本原則に従うこと
- TDD（テスト駆動開発）を採用: テストを先に書き、実装前に失敗を確認（Red-Green-Refactor）
- すべての API にユニットテストを記述
- 型安全性の確保（TypeScript strict mode、Python type hints）
- コミット前にリンター・フォーマッターを実行
- シークレットをコードに含めない

**構成**: タスクはユーザーストーリーごとにグループ化されており、各ストーリーの独立した実装とテストが可能です。

## フォーマット: `[ID] [P?] [Story] 説明`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: このタスクが属するユーザーストーリー（例: US1, US2, US3）
- 説明には正確なファイルパスを含める

## パス規約

このプロジェクトは **Web アプリケーション構成** を採用:
- **バックエンド**: `backend/src/`, `backend/tests/`
- **フロントエンド**: `frontend/src/`, `frontend/tests/`
- **共有ドキュメント**: リポジトリルートの `docs/`

## フェーズ 1: セットアップ（プロジェクト初期化）

**目的**: プロジェクトの初期構造とツールチェーンのセットアップ

- [ ] T001 リポジトリルートに backend/ と frontend/ ディレクトリを作成
- [ ] T002 backend/pyproject.toml で Python 3.11+ プロジェクトを初期化（uv または pip）
- [ ] T003 [P] backend/.env.example を作成し、環境変数テンプレートを定義
- [ ] T004 [P] frontend/package.json で React 18+ + TypeScript + Vite プロジェクトを初期化
- [ ] T005 [P] frontend/.env.example を作成し、環境変数テンプレートを定義
- [ ] T006 [P] backend/ にリンター・フォーマッター設定（Black, Ruff, mypy）
- [ ] T007 [P] frontend/ にリンター・フォーマッター設定（ESLint, Prettier）
- [ ] T008 [P] docker-compose.yml でローカル開発環境を構成（MongoDB, backend, frontend）
- [ ] T009 リポジトリルートに .gitignore を更新（.env, node_modules, venv, __pycache__ 等）

---

## フェーズ 2: 基盤（ブロッキング前提条件）

**目的**: いずれかのユーザーストーリーを実装する前に完了しなければならないコアインフラストラクチャ

**⚠️ 重要**: このフェーズが完了するまでユーザーストーリーの作業は開始できません

### バックエンド基盤

- [ ] T010 backend/src/config.py で環境変数管理（Pydantic Settings）
- [ ] T011 backend/src/utils/db.py で MongoDB 接続管理（motor）
- [ ] T012 [P] backend/src/models/__init__.py を作成し、モデルパッケージを初期化
- [ ] T013 [P] backend/src/models/note.py に Pydantic モデルを定義（NoteBase, NoteCreate, NoteUpdate, Note）
- [ ] T014 backend/src/main.py に FastAPI アプリケーションのエントリーポイントを作成
- [ ] T015 backend/src/main.py に CORS ミドルウェアを追加
- [ ] T016 [P] backend/src/api/__init__.py を作成し、API パッケージを初期化
- [ ] T017 [P] backend/src/api/routes.py でルーター集約を実装
- [ ] T018 backend/src/api/routes.py に /health ヘルスチェックエンドポイントを実装
- [ ] T019 [P] backend/tests/conftest.py で pytest フィクスチャを設定（テストDB、テストクライアント）

### フロントエンド基盤

- [ ] T020 frontend/src/main.tsx に React アプリケーションのエントリーポイントを作成
- [ ] T021 frontend/src/App.tsx にルートコンポーネントを作成
- [ ] T022 [P] frontend/src/types/note.ts に TypeScript 型定義（Note, CreateNoteRequest, UpdateNoteRequest）
- [ ] T023 [P] frontend/src/services/noteService.ts に API クライアント（axios ベース）
- [ ] T024 [P] frontend/src/hooks/useNotes.ts に React Query フックを実装
- [ ] T025 [P] frontend/src/styles/global.css にグローバルスタイル（Tailwind CSS）
- [ ] T026 frontend/vite.config.ts に Vite 設定（プロキシ、環境変数）
- [ ] T027 [P] frontend/tests/setup.ts で Vitest テスト環境をセットアップ

**チェックポイント**: 基盤準備完了 - ユーザーストーリーの実装を並列で開始可能

---

## フェーズ 3: ユーザーストーリー 1 - Markdownノートの一覧表示（優先度: P1）🎯 MVP

**ゴール**: ユーザーがアプリケーションを開いた際、既存のすべてのMarkdownノートのリストを確認できる。各ノートはタイトル、作成日時、最終更新日時が表示される。

**独立テスト**: サンプルのMarkdownファイルを複数配置した状態でアプリケーションを起動し、リストにすべてのノートが表示されることで完全にテスト可能。

### ユーザーストーリー 1 のテスト（Constitution に従い TDD を適用）🔴

> **重要 (Constitution III. TDD 原則)**: これらのテストを最初に書き、実装前に失敗することを確認してください（Red-Green-Refactor サイクル）

> **重要 (Constitution IV. API ユニットテスト必須)**: すべての API エンドポイントにユニットテストを記述すること

- [ ] T028 [P] [US1] backend/tests/integration/test_notes_api.py で GET /notes エンドポイントの統合テストを作成
- [ ] T029 [P] [US1] backend/tests/unit/test_note_repository.py で NoteRepository のユニットテストを作成
- [ ] T030 [P] [US1] backend/tests/unit/test_note_service.py で NoteService のユニットテストを作成
- [ ] T031 [P] [US1] frontend/tests/unit/components/NoteList.test.tsx で NoteList コンポーネントのテストを作成

**チェックポイント**: すべてのテストが失敗（Red）することを確認してから次へ進む

### ユーザーストーリー 1 の実装

- [ ] T032 [P] [US1] backend/src/repositories/__init__.py を作成し、リポジトリパッケージを初期化
- [ ] T033 [US1] backend/src/repositories/note_repository.py に NoteRepository を実装（list_notes メソッド、型安全性確保）
- [ ] T034 [P] [US1] backend/src/services/__init__.py を作成し、サービスパッケージを初期化
- [ ] T035 [US1] backend/src/services/note_service.py に NoteService を実装（list_notes メソッド、型安全性確保）
- [ ] T036 [US1] backend/src/api/notes.py に GET /notes エンドポイントを実装（ページネーション、ソート対応）
- [ ] T037 [US1] backend/src/api/routes.py に notes ルーターを登録
- [ ] T038 [P] [US1] frontend/src/components/NoteList.tsx にノート一覧コンポーネントを実装
- [ ] T039 [US1] frontend/src/pages/NotesPage.tsx にノート一覧ページを実装
- [ ] T040 [US1] backend/ でリンター・フォーマッター実行（Black, Ruff, mypy）
- [ ] T041 [US1] frontend/ でリンター・フォーマッター実行（ESLint, Prettier）
- [ ] T042 [US1] すべてのテストが通過（Green）することを確認

**チェックポイント**: この時点でユーザーストーリー 1 は完全に機能し、独立してテスト可能であるべき（Green 状態）

---

## フェーズ 4: ユーザーストーリー 2 - 新規Markdownノートの作成（優先度: P1）

**ゴール**: ユーザーが「新規作成」ボタンをクリックすると、新しいMarkdownノートを作成できる。タイトルを入力し、本文エリアでMarkdownを記述でき、作成したノートは即座にMongoDBに保存される。

**独立テスト**: 「新規作成」ボタンをクリックし、タイトルと本文を入力して保存ボタンをクリック。一覧画面に戻った際、新規ノートが表示されることでテスト可能。

### ユーザーストーリー 2 のテスト（Constitution に従い TDD を適用）🔴

> **重要**: TDD サイクルに従い、テストを先に書き、実装前に失敗を確認

- [ ] T043 [P] [US2] backend/tests/integration/test_notes_api.py に POST /notes エンドポイントの統合テストを追加
- [ ] T044 [P] [US2] backend/tests/unit/test_note_repository.py に create_note メソッドのテストを追加
- [ ] T045 [P] [US2] backend/tests/unit/test_note_service.py に create_note メソッドのテストを追加
- [ ] T046 [P] [US2] frontend/tests/unit/components/NoteEditor.test.tsx で NoteEditor コンポーネント（作成モード）のテストを作成

**チェックポイント**: すべてのテストが失敗（Red）することを確認

### ユーザーストーリー 2 の実装

- [ ] T047 [US2] backend/src/repositories/note_repository.py に create_note メソッドを追加（UUID v4 生成、型安全性確保）
- [ ] T048 [US2] backend/src/services/note_service.py に create_note メソッドを追加（同名タイトル処理、型安全性確保）
- [ ] T049 [US2] backend/src/api/notes.py に POST /notes エンドポイントを実装（バリデーション、エラーハンドリング）
- [ ] T050 [P] [US2] frontend/src/components/NoteEditor.tsx にノート編集コンポーネントを実装（作成モード）
- [ ] T051 [US2] frontend/src/pages/CreateNotePage.tsx にノート作成ページを実装
- [ ] T052 [US2] frontend/src/App.tsx にルーティングを追加（/ と /create）
- [ ] T053 [US2] backend/ でリンター・フォーマッター実行
- [ ] T054 [US2] frontend/ でリンター・フォーマッター実行
- [ ] T055 [US2] すべてのテストが通過（Green）することを確認

**チェックポイント**: この時点でユーザーストーリー 1 と 2 の両方が独立して動作するべき

---

## フェーズ 5: ユーザーストーリー 3 - Markdownノートの編集（優先度: P1）

**ゴール**: ユーザーが一覧から既存のノートを選択すると、そのノートを編集できる。編集時にはタイトルと本文の両方を変更でき、変更は保存ボタンをクリックすることで確定する。

**独立テスト**: 既存のノートを一覧から選択し、内容を変更して保存。再度そのノートを開いた際、変更が反映されていることでテスト可能。

### ユーザーストーリー 3 のテスト（Constitution に従い TDD を適用）🔴

> **重要**: TDD サイクルに従い、テストを先に書き、実装前に失敗を確認

- [ ] T056 [P] [US3] backend/tests/integration/test_notes_api.py に GET /notes/{note_id} エンドポイントの統合テストを追加
- [ ] T057 [P] [US3] backend/tests/integration/test_notes_api.py に PUT /notes/{note_id} エンドポイントの統合テストを追加
- [ ] T058 [P] [US3] backend/tests/unit/test_note_repository.py に get_by_id と update_note メソッドのテストを追加
- [ ] T059 [P] [US3] backend/tests/unit/test_note_service.py に get_by_id と update_note メソッドのテストを追加
- [ ] T060 [P] [US3] frontend/tests/unit/components/NoteEditor.test.tsx に NoteEditor コンポーネント（編集モード）のテストを追加

**チェックポイント**: すべてのテストが失敗（Red）することを確認

### ユーザーストーリー 3 の実装

- [ ] T061 [P] [US3] backend/src/repositories/note_repository.py に get_by_id メソッドを追加
- [ ] T062 [P] [US3] backend/src/repositories/note_repository.py に update_note メソッドを追加
- [ ] T063 [US3] backend/src/services/note_service.py に get_by_id メソッドを追加（型安全性確保）
- [ ] T064 [US3] backend/src/services/note_service.py に update_note メソッドを追加（updated_at 更新、型安全性確保）
- [ ] T065 [US3] backend/src/api/notes.py に GET /notes/{note_id} エンドポイントを実装
- [ ] T066 [US3] backend/src/api/notes.py に PUT /notes/{note_id} エンドポイントを実装
- [ ] T067 [US3] frontend/src/components/NoteEditor.tsx に編集モードのロジックを追加
- [ ] T068 [US3] frontend/src/pages/EditNotePage.tsx にノート編集ページを実装
- [ ] T069 [US3] frontend/src/App.tsx にルーティングを追加（/edit/:id）
- [ ] T070 [US3] frontend/src/components/NoteList.tsx にノートクリック時のナビゲーションを追加
- [ ] T071 [US3] backend/ でリンター・フォーマッター実行
- [ ] T072 [US3] frontend/ でリンター・フォーマッター実行
- [ ] T073 [US3] すべてのテストが通過（Green）することを確認

**チェックポイント**: この時点でユーザーストーリー 1、2、3 すべてが独立して動作するべき

---

## フェーズ 6: ユーザーストーリー 4 - Markdownノートの削除（優先度: P2）

**ゴール**: ユーザーがノートの詳細画面または一覧画面で「削除」ボタンをクリックすると、確認ダイアログが表示される。ユーザーが削除を確認すると、そのノートはMongoDBから完全に削除され、一覧から消える。

**独立テスト**: 既存のノートを選択し、削除ボタンをクリック。確認ダイアログで「削除」を選択した後、一覧画面でそのノートが表示されなくなることでテスト可能。

### ユーザーストーリー 4 のテスト（Constitution に従い TDD を適用）🔴

> **重要**: TDD サイクルに従い、テストを先に書き、実装前に失敗を確認

- [ ] T074 [P] [US4] backend/tests/integration/test_notes_api.py に DELETE /notes/{note_id} エンドポイントの統合テストを追加
- [ ] T075 [P] [US4] backend/tests/unit/test_note_repository.py に delete_note メソッドのテストを追加
- [ ] T076 [P] [US4] backend/tests/unit/test_note_service.py に delete_note メソッドのテストを追加
- [ ] T077 [P] [US4] frontend/tests/unit/components/DeleteConfirmDialog.test.tsx で削除確認ダイアログのテストを作成

**チェックポイント**: すべてのテストが失敗（Red）することを確認

### ユーザーストーリー 4 の実装

- [ ] T078 [US4] backend/src/repositories/note_repository.py に delete_note メソッドを追加
- [ ] T079 [US4] backend/src/services/note_service.py に delete_note メソッドを追加（型安全性確保）
- [ ] T080 [US4] backend/src/api/notes.py に DELETE /notes/{note_id} エンドポイントを実装
- [ ] T081 [P] [US4] frontend/src/components/DeleteConfirmDialog.tsx に削除確認ダイアログコンポーネントを実装
- [ ] T082 [US4] frontend/src/pages/EditNotePage.tsx に削除ボタンとダイアログを統合
- [ ] T083 [US4] frontend/src/hooks/useNotes.ts に削除用 mutation を追加（楽観的更新）
- [ ] T084 [US4] backend/ でリンター・フォーマッター実行
- [ ] T085 [US4] frontend/ でリンター・フォーマッター実行
- [ ] T086 [US4] すべてのテストが通過（Green）することを確認

**チェックポイント**: ユーザーストーリー 1-4 すべてが独立して動作するべき

---

## フェーズ 7: ユーザーストーリー 5 - WYSIWYG エディタでの編集（優先度: P2）

**ゴール**: ユーザーがノートを作成または編集する際、WYSIWYGエディタモードを選択できる。このモードでは、Markdown記法を直接入力する代わりに、ツールバーのボタン（太字、斜体、見出し、リストなど）をクリックすることで、視覚的にフォーマットを適用できる。

**独立テスト**: 新規ノート作成画面でWYSIWYGモードに切り替え、ツールバーのボタンを使用してテキストをフォーマット。プレビューまたは保存後、期待通りのMarkdownが生成されていることでテスト可能。

### ユーザーストーリー 5 のテスト（Constitution に従い TDD を適用）🔴

> **重要**: TDD サイクルに従い、テストを先に書き、実装前に失敗を確認

- [ ] T087 [P] [US5] frontend/tests/unit/components/WysiwygEditor.test.tsx で WysiwygEditor コンポーネントのテストを作成
- [ ] T088 [P] [US5] frontend/tests/e2e/wysiwyg-editing.spec.ts で WYSIWYG 編集の E2E テストを作成（Playwright）

**チェックポイント**: すべてのテストが失敗（Red）することを確認

### ユーザーストーリー 5 の実装

- [ ] T089 [US5] frontend/package.json に TipTap 関連パッケージを追加（@tiptap/react, @tiptap/starter-kit, @tiptap/extension-markdown）
- [ ] T090 [P] [US5] frontend/src/components/WysiwygEditor.tsx に WYSIWYG エディタコンポーネントを実装（TipTap ベース）
- [ ] T091 [US5] frontend/src/components/NoteEditor.tsx に Markdown/WYSIWYG モード切り替え機能を追加
- [ ] T092 [US5] frontend/src/components/NoteEditor.tsx に TipTap エディタを統合
- [ ] T093 [US5] frontend/ でリンター・フォーマッター実行
- [ ] T094 [US5] すべてのテストが通過（Green）することを確認

**チェックポイント**: ユーザーストーリー 1-5 すべてが独立して動作するべき

---

## フェーズ 8: ユーザーストーリー 6 - リアルタイムプレビュー表示（優先度: P2）

**ゴール**: ユーザーがMarkdownモードでノートを編集している際、画面の右側に横並びでリアルタイムレンダリングされたプレビューパネルが表示される。ユーザーがMarkdownテキストを入力すると、プレビューは即座に更新される。

**独立テスト**: Markdownモードでノートを編集し、見出し、リスト、リンクなどのMarkdown記法を入力。プレビューエリアに期待通りのHTMLがレンダリングされることでテスト可能。

### ユーザーストーリー 6 のテスト（Constitution に従い TDD を適用）🔴

> **重要**: TDD サイクルに従い、テストを先に書き、実装前に失敗を確認

- [ ] T095 [P] [US6] frontend/tests/unit/components/MarkdownPreview.test.tsx で MarkdownPreview コンポーネントのテストを作成
- [ ] T096 [P] [US6] frontend/tests/e2e/realtime-preview.spec.ts でリアルタイムプレビューの E2E テストを作成（Playwright）

**チェックポイント**: すべてのテストが失敗（Red）することを確認

### ユーザーストーリー 6 の実装

- [ ] T097 [US6] frontend/package.json に react-markdown と remark-gfm パッケージを追加
- [ ] T098 [P] [US6] frontend/src/components/MarkdownPreview.tsx にプレビューコンポーネントを実装（react-markdown ベース）
- [ ] T099 [US6] frontend/src/components/NoteEditor.tsx にリアルタイムプレビューパネルを追加（右側パネル配置）
- [ ] T100 [US6] frontend/src/components/NoteEditor.tsx にプレビュー表示/非表示切り替えボタンを追加
- [ ] T101 [US6] frontend/src/components/NoteEditor.tsx にデバウンス処理を追加（プレビュー更新最適化）
- [ ] T102 [US6] frontend/ でリンター・フォーマッター実行
- [ ] T103 [US6] すべてのテストが通過（Green）することを確認

**チェックポイント**: すべてのユーザーストーリー（1-6）が独立して機能するべき

---

## フェーズ 9: 仕上げと横断的関心事

**目的**: 複数のユーザーストーリーに影響する改善とドキュメント整備

- [ ] T104 [P] backend/README.md を作成（セットアップ手順、API エンドポイント、テスト実行方法）
- [ ] T105 [P] frontend/README.md を作成（セットアップ手順、開発サーバー起動、ビルド方法）
- [ ] T106 [P] リポジトリルートに README.md を作成（プロジェクト概要、クイックスタート）
- [ ] T107 backend/src/ のすべての public API に docstring を追加（Constitution 準拠）
- [ ] T108 frontend/src/components/ のすべてのコンポーネントに JSDoc コメントを追加
- [ ] T109 [P] backend/tests/ でテストカバレッジを確認（80% 以上、API エンドポイント 100%）
- [ ] T110 [P] frontend/tests/ でテストカバレッジを確認（80% 以上）
- [ ] T111 backend/ でセキュリティスキャンを実行（Bandit, Safety）
- [ ] T112 frontend/ でセキュリティスキャンを実行（npm audit）
- [ ] T113 backend/ のパフォーマンス最適化（MongoDB インデックス作成、クエリ最適化）
- [ ] T114 frontend/ のパフォーマンス最適化（コード分割、React.memo、デバウンス）
- [ ] T115 backend/src/api/notes.py にロギング追加（structlog 使用）
- [ ] T116 frontend/src/ にエラーバウンダリを追加（未処理エラーのキャッチ）
- [ ] T117 quickstart.md の手順を実際に実行して検証
- [ ] T118 backend/ と frontend/ で最終リンター・フォーマッター実行
- [ ] T119 すべてのユニットテスト、統合テスト、E2E テストを実行して Green 状態を確認

---

## 依存関係と実行順序

### フェーズの依存関係

- **セットアップ（フェーズ 1）**: 依存関係なし - すぐに開始可能
- **基盤（フェーズ 2）**: セットアップ完了に依存 - すべてのユーザーストーリーをブロック
- **ユーザーストーリー（フェーズ 3-8）**: すべて基盤フェーズ完了に依存
  - ユーザーストーリーは並列で進行可能（人員がいれば）
  - または優先順位に従って順次進行（P1: US1-3 → P2: US4-6）
- **仕上げ（フェーズ 9）**: 希望するすべてのユーザーストーリー完了に依存

### ユーザーストーリーの依存関係

- **ユーザーストーリー 1（P1）**: 基盤（フェーズ 2）完了後に開始可能 - 他のストーリーへの依存なし
- **ユーザーストーリー 2（P1）**: 基盤（フェーズ 2）完了後に開始可能 - US1 のルーティング概念を参考にするが独立してテスト可能
- **ユーザーストーリー 3（P1）**: 基盤（フェーズ 2）完了後に開始可能 - US2 のエディタコンポーネントを再利用するが独立してテスト可能
- **ユーザーストーリー 4（P2）**: 基盤（フェーズ 2）完了後に開始可能 - US3 の編集ページに統合するが独立してテスト可能
- **ユーザーストーリー 5（P2）**: 基盤（フェーズ 2）完了後に開始可能 - US2/US3 のエディタに統合するが独立してテスト可能
- **ユーザーストーリー 6（P2）**: 基盤（フェーズ 2）完了後に開始可能 - US2/US3 のエディタに統合するが独立してテスト可能

### 各ユーザーストーリー内

- テストは実装前に書いて失敗することを確認する必要がある（Red）
- モデル・リポジトリはサービスより先
- サービスはエンドポイント/コンポーネントより先
- コア実装は統合より先
- リンター・フォーマッター実行後にテスト通過確認（Green）
- ストーリー完了後に次の優先度へ移動

### 並列実行の機会

- [P] マークされたすべてのセットアップタスクは並列実行可能
- [P] マークされたすべての基盤タスクは並列実行可能（フェーズ 2 内）
- 基盤フェーズ完了後、すべてのユーザーストーリーを並列で開始可能（チームのキャパシティがあれば）
- [P] マークされたユーザーストーリーのすべてのテストは並列実行可能
- [P] マークされたストーリー内のモデル・コンポーネントは並列実行可能
- 異なるユーザーストーリーは異なるチームメンバーが並列で作業可能

---

## 並列実行の例

### セットアップフェーズの並列実行

```bash
# 同時に実行可能なタスク:
タスク: "backend/.env.example を作成"
タスク: "frontend/.env.example を作成"
タスク: "backend/ にリンター・フォーマッター設定"
タスク: "frontend/ にリンター・フォーマッター設定"
タスク: "docker-compose.yml でローカル開発環境を構成"
```

### 基盤フェーズの並列実行

```bash
# バックエンドとフロントエンドの基盤を並列で:
タスク: "backend/src/models/note.py に Pydantic モデルを定義"
タスク: "frontend/src/types/note.ts に TypeScript 型定義"
タスク: "backend/tests/conftest.py で pytest フィクスチャを設定"
タスク: "frontend/tests/setup.ts で Vitest テスト環境をセットアップ"
```

### ユーザーストーリー 1 のテスト並列実行

```bash
# US1 のすべてのテストを同時に:
タスク: "backend/tests/integration/test_notes_api.py で GET /notes エンドポイントの統合テストを作成"
タスク: "backend/tests/unit/test_note_repository.py で NoteRepository のユニットテストを作成"
タスク: "backend/tests/unit/test_note_service.py で NoteService のユニットテストを作成"
タスク: "frontend/tests/unit/components/NoteList.test.tsx で NoteList コンポーネントのテストを作成"
```

### ユーザーストーリー 1 の実装並列実行

```bash
# US1 のモデル・コンポーネントを同時に:
タスク: "backend/src/repositories/__init__.py を作成"
タスク: "backend/src/services/__init__.py を作成"
タスク: "frontend/src/components/NoteList.tsx にノート一覧コンポーネントを実装"
```

### 複数ユーザーストーリーの並列実行

```bash
# 基盤完了後、複数のチームメンバーで:
開発者 A: ユーザーストーリー 1（フェーズ 3）
開発者 B: ユーザーストーリー 2（フェーズ 4）
開発者 C: ユーザーストーリー 3（フェーズ 5）
```

---

## 実装戦略

### MVP ファースト（ユーザーストーリー 1 のみ）

1. フェーズ 1: セットアップを完了
2. フェーズ 2: 基盤を完了（重要 - すべてのストーリーをブロック）
3. フェーズ 3: ユーザーストーリー 1 を完了
4. **停止して検証**: ユーザーストーリー 1 を独立してテスト
5. 準備ができたらデプロイ/デモ

### 増分デリバリー（推奨）

1. セットアップ + 基盤を完了 → 基盤準備完了
2. ユーザーストーリー 1 を追加 → 独立してテスト → デプロイ/デモ（MVP!）
3. ユーザーストーリー 2 を追加 → 独立してテスト → デプロイ/デモ
4. ユーザーストーリー 3 を追加 → 独立してテスト → デプロイ/デモ
5. ユーザーストーリー 4-6（P2）を優先度順に追加
6. 各ストーリーは以前のストーリーを壊さずに価値を追加

### 並列チーム戦略

複数の開発者がいる場合:

1. チームでセットアップ + 基盤を一緒に完了
2. 基盤完了後:
   - 開発者 A: ユーザーストーリー 1（一覧表示）
   - 開発者 B: ユーザーストーリー 2（作成）
   - 開発者 C: ユーザーストーリー 3（編集）
3. P1 ストーリー完了後:
   - 開発者 A: ユーザーストーリー 4（削除）
   - 開発者 B: ユーザーストーリー 5（WYSIWYG）
   - 開発者 C: ユーザーストーリー 6（プレビュー）
4. ストーリーは独立して完了・統合

---

## タスクサマリー

- **総タスク数**: 119
- **フェーズ 1（セットアップ）**: 9 タスク
- **フェーズ 2（基盤）**: 18 タスク
- **フェーズ 3（US1 - 一覧表示）**: 15 タスク（テスト: 4、実装: 11）
- **フェーズ 4（US2 - 作成）**: 13 タスク（テスト: 4、実装: 9）
- **フェーズ 5（US3 - 編集）**: 18 タスク（テスト: 5、実装: 13）
- **フェーズ 6（US4 - 削除）**: 13 タスク（テスト: 4、実装: 9）
- **フェーズ 7（US5 - WYSIWYG）**: 8 タスク（テスト: 2、実装: 6）
- **フェーズ 8（US6 - プレビュー）**: 9 タスク（テスト: 2、実装: 7）
- **フェーズ 9（仕上げ）**: 16 タスク

### 並列化機会

- **セットアップ**: 6/9 タスクが並列実行可能
- **基盤**: 10/18 タスクが並列実行可能
- **各ユーザーストーリー**: テストフェーズで 3-5 タスクが並列実行可能、実装フェーズで 2-4 タスクが並列実行可能
- **ユーザーストーリー間**: 基盤完了後、6 つのストーリーすべてが並列で開始可能

### 推奨 MVP スコープ

**フェーズ 1 + 2 + 3 のみ**（42 タスク）:
- セットアップ: プロジェクト構造とツールチェーン
- 基盤: API とデータベース接続
- ユーザーストーリー 1: ノート一覧表示

これにより、ユーザーは既存のノートを閲覧できる最小限の動作するアプリケーションが完成します。

---

## 注意事項

- [P] タスク = 異なるファイル、依存関係なし、並列実行可能
- [Story] ラベルはトレーサビリティのためにタスクを特定のユーザーストーリーにマッピング
- 各ユーザーストーリーは独立して完了可能かつテスト可能であるべき
- TDD サイクルに従い、実装前にテストが失敗することを確認（Red → Green → Refactor）
- 各タスクまたは論理的なグループの後にコミット
- 任意のチェックポイントで停止してストーリーを独立して検証可能
- リンター・フォーマッターを各ストーリー完了時に実行（Constitution 準拠）
- すべての API にユニットテストを記述（Constitution 準拠、カバレッジ 100%）
- シークレットは環境変数で管理（.env ファイル、.gitignore に追加）
- 型安全性を確保（TypeScript strict mode、Python type hints 必須）

### 避けるべきこと

- 曖昧なタスク（具体的なファイルパスと実装内容を明記）
- 同一ファイルの競合（並列実行する場合は異なるファイルに分割）
- 独立性を壊すストーリー間依存関係（各ストーリーは単独でテスト可能であるべき）
- テストなしの実装（TDD サイクルを遵守）
- リンター・フォーマッター実行の省略（Constitution 違反）

---

**次のステップ**: `/speckit.implement` コマンドでタスクを実行し、実装を開始します。
