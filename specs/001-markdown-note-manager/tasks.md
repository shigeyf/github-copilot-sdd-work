---

## description: "Markdownノート管理アプリを実装するためのタスクリスト"

---

# タスク: Markdownノート管理アプリ

**入力**: `/specs/001-markdown-note-manager/` の設計ドキュメント
**前提条件**:
`plan.md` (必須), `spec.md` (ユーザーストーリーに必須), `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`

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

このプロジェクトはWebアプリケーション構成を採用しており、以下の構造を使用します:
- **バックエンド**: `backend/src/`, `backend/tests/`
- **フロントエンド**: `frontend/src/`, `frontend/tests/`
- **共有ドキュメント**: `specs/001-markdown-note-manager/`

---

## フェーズ 1: セットアップ（共有インフラストラクチャ）

**目的**: プロジェクトの初期化と基本構造

- [x] T001 backend/ と frontend/ ディレクトリを作成してプロジェクト構造をセットアップ
- [x] T002 backend/pyproject.toml に FastAPI、motor、Pydantic、pytest の依存関係を含む Python プロジェクトを初期化
- [x] T003 frontend/package.json に React、TypeScript、Vite、TipTap、react-markdown の依存関係を含む Node.js プロジェクトを初期化
- [x] T004 [P] backend/ に Black、Ruff、mypy のリンティングとフォーマットツールを設定
- [x] T005 [P] frontend/ に ESLint、Prettier のリンティングとフォーマットツールを設定
- [x] T006 [P] backend/.env.example と frontend/.env.example に環境変数サンプルを作成
- [x] T007 [P] docker-compose.yaml に MongoDB、バックエンド、フロントエンドのサービスを定義
- [x] T008 [P] backend/README.md と frontend/README.md に基本的なセットアップ手順を記述

---

## フェーズ 2: 基盤（ブロッキング前提条件）

**目的**: いずれかのユーザーストーリーを実装する前に完了しなければならないコアインフラストラクチャ

**⚠️ 重要**: このフェーズが完了するまでユーザーストーリーの作業は開始できません

- [x] T010 backend/src/config.py に環境変数と設定管理を実装（Pydantic Settings を使用）
- [x] T009 backend/src/utils/db.py に MongoDB 接続管理を実装（motor を使用、T010 の config.py に依存）
- [x] T011 backend/src/main.py に FastAPI アプリケーションのエントリーポイントを作成（T009 の db.py に依存）
- [x] T012 [P] backend/src/main.py に CORS ミドルウェアを設定（フロントエンドのオリジンを許可）
- [x] T013 [P] backend/src/api/routes.py に API ルーター集約を作成
- [x] T014 [P] backend/src/models/__init__.py を作成してモデルパッケージを初期化
- [x] T015 [P] backend/src/repositories/__init__.py を作成してリポジトリパッケージを初期化
- [x] T016 [P] backend/src/services/__init__.py を作成してサービスパッケージを初期化
- [x] T017 [P] backend/src/api/__init__.py を作成して API パッケージを初期化
- [x] T018 backend/src/main.py に /health エンドポイントを実装（MongoDB 接続状態を確認）
- [x] T018a backend/src/main.py に起動時 MongoDB 接続エラーハンドリングを実装（FR-020 対応: 接続失敗時にエラーメッセージを標準エラー出力とログに表示し、アプリケーション起動を中断）
- [x] T019 [P] backend/tests/conftest.py に pytest フィクスチャ（MongoDB テストクライアント、FastAPI テストクライアント）を作成
- [x] T020 [P] frontend/src/main.tsx に React アプリケーションのエントリーポイントを作成
- [x] T021 [P] frontend/src/App.tsx にルートコンポーネントとルーティング設定を作成
- [x] T022 [P] frontend/src/services/noteService.ts に axios を使用した API クライアントの基礎を実装
- [x] T023 [P] frontend/src/types/note.ts に Note、CreateNoteRequest、UpdateNoteRequest の TypeScript 型定義を作成
- [x] T024 [P] frontend/vite.config.ts に Vite 設定（プロキシ設定でバックエンドに接続）を作成
- [x] T025 [P] frontend/tsconfig.json に TypeScript strict mode 設定を作成
- [x] T026 リンター・フォーマッター実行（backend と frontend 両方）

**チェックポイント**: 基盤準備完了 - ヘルスチェックエンドポイントが動作し、フロントエンドがバックエンドに接続可能

---

## フェーズ 3: ユーザーストーリー 1 - Markdownノートの一覧表示（優先度: P1）🎯 MVP

**ゴール**: ユーザーがアプリケーションを開いた際、既存のすべてのMarkdownノートのリストを確認できる

**独立テスト**: サンプルのMarkdownファイルを複数配置した状態でアプリケーションを起動し、リストにすべてのノートが表示されることで完全にテスト可能

### ユーザーストーリー 1 のテスト（Constitution に従い TDD を適用）🔴

> **重要 (Constitution III. TDD 原則)**: これらのテストを最初に書き、実装前に失敗することを確認してください（Red-Green-Refactor サイクル）

> **重要 (Constitution IV. API ユニットテスト必須)**: すべての API エンドポイントにユニットテストを記述すること

- [x] T027 [P] [US1] backend/tests/integration/test_notes_api.py に GET /notes エンドポイントの統合テストを記述（200 レスポンス、空リスト、ページネーション、ソート）
- [x] T028 [P] [US1] backend/tests/unit/test_note_repository.py に NoteRepository.list() のユニットテストを記述（MongoDB クエリ、ページネーション）
- [x] T029 [P] [US1] backend/tests/unit/test_note_service.py に NoteService.list_notes() のユニットテストを記述（ビジネスロジック）
- [x] T030 [P] [US1] frontend/tests/unit/components/NoteList.test.tsx に NoteList コンポーネントのユニットテストを記述（レンダリング、空状態）

**チェックポイント**: すべてのテストが失敗（Red）することを確認してから次へ進む

### ユーザーストーリー 1 の実装

- [x] T031 [P] [US1] backend/src/models/note.py に Note、NoteCreate、NoteUpdate の Pydantic モデルを作成（型安全性確保: type hints 必須、バリデーションルール）
- [x] T032 [US1] backend/src/repositories/note_repository.py に NoteRepository クラスを実装（list メソッド: MongoDB からノート一覧を取得、ページネーション、ソート）
- [x] T033 [US1] backend/src/services/note_service.py に NoteService クラスを実装（list_notes メソッド: リポジトリを呼び出し、ビジネスロジック）
- [x] T034 [US1] backend/src/api/notes.py に GET /notes エンドポイントを実装（NoteService を呼び出し、レスポンスを返す）
- [x] T035 [US1] backend/src/api/routes.py に notes ルーターを登録
- [x] T036 [US1] backend/src/api/notes.py に適切なエラーハンドリングを追加（503 Service Unavailable）
- [x] T037 [P] [US1] frontend/src/services/noteService.ts に listNotes 関数を実装（GET /notes を呼び出し）
- [x] T038 [P] [US1] frontend/src/hooks/useNotes.ts に React Query を使用した useNotes カスタムフックを実装
- [x] T039 [US1] frontend/src/components/NoteList.tsx に NoteList コンポーネントを実装（タイトル、作成日時、最終更新日時を表示）
- [x] T040 [US1] frontend/src/pages/NotesPage.tsx に NotesPage コンポーネントを実装（NoteList を表示、空状態メッセージ）
- [x] T041 [US1] frontend/src/App.tsx に NotesPage へのルーティングを追加
- [x] T042 [US1] リンター・フォーマッター実行（backend と frontend 両方）
- [x] T043 [US1] すべてのテストが通過（Green）することを確認

**チェックポイント**: この時点でユーザーストーリー 1 は完全に機能し、独立してテスト可能であるべき（Green 状態）

---

## フェーズ 4: ユーザーストーリー 2 - 新規Markdownノートの作成（優先度: P1）

**ゴール**: ユーザーが「新規作成」ボタンをクリックすると、新しいMarkdownノートを作成できる

**独立テスト**: 「新規作成」ボタンをクリックし、タイトルと本文を入力して保存ボタンをクリック。一覧画面に戻った際、新規ノートが表示されることでテスト可能

### ユーザーストーリー 2 のテスト（Constitution に従い TDD を適用）🔴

> **重要**: TDD サイクルに従い、テストを先に書き、実装前に失敗を確認

- [ ] T044 [P] [US2] backend/tests/integration/test_notes_api.py に POST /notes エンドポイントの統合テストを記述（201 レスポンス、UUID v4 生成、バリデーションエラー）
- [ ] T045 [P] [US2] backend/tests/unit/test_note_repository.py に NoteRepository.create() のユニットテストを記述（MongoDB 挿入、UUID 生成）
- [ ] T046 [P] [US2] backend/tests/unit/test_note_service.py に NoteService.create_note() のユニットテストを記述（タイトル重複処理、日時自動設定）
- [ ] T047 [P] [US2] frontend/tests/unit/components/NoteEditor.test.tsx に NoteEditor コンポーネントのユニットテストを記述（入力、バリデーション）
- [ ] T048 [P] [US2] frontend/tests/e2e/notes.spec.ts に E2E テストを記述（新規作成フロー全体）
- [ ] T048a [P] [US2] backend/tests/integration/test_notes_api.py に重複タイトル処理のテストを記述（FR-019 対応: 同名タイトルで番号付加を検証）

**チェックポイント**: すべてのテストが失敗（Red）することを確認

### ユーザーストーリー 2 の実装

- [ ] T049 [US2] backend/src/repositories/note_repository.py に create メソッドを実装（UUID v4 生成、MongoDB 挿入、created_at/updated_at 自動設定）
- [ ] T050 [US2] backend/src/services/note_service.py に create_note メソッドを実装（同名タイトル処理、リポジトリを呼び出し）
- [ ] T051 [US2] backend/src/api/notes.py に POST /notes エンドポイントを実装（NoteService を呼び出し、201 レスポンス）
- [ ] T052 [US2] backend/src/api/notes.py にバリデーションエラーハンドリングを追加（422 Unprocessable Entity）
- [ ] T053 [P] [US2] frontend/src/services/noteService.ts に createNote 関数を実装（POST /notes を呼び出し）
- [ ] T054 [US2] frontend/src/hooks/useNotes.ts に useMutation を使用した createNote ミューテーションを追加
- [ ] T055 [US2] frontend/src/components/NoteEditor.tsx に NoteEditor コンポーネントを実装（タイトル入力、本文入力、保存ボタン）
- [ ] T056 [US2] frontend/src/pages/CreateNotePage.tsx に CreateNotePage コンポーネントを実装（NoteEditor を表示、保存後に一覧へ遷移）
- [ ] T057 [US2] frontend/src/App.tsx に CreateNotePage へのルーティングを追加
- [ ] T058 [US2] frontend/src/components/NoteList.tsx に「新規作成」ボタンを追加（CreateNotePage へのナビゲーション）
- [ ] T059 [US2] リンター・フォーマッター実行（backend と frontend 両方）
- [ ] T060 [US2] すべてのテストが通過（Green）することを確認

**チェックポイント**: この時点でユーザーストーリー 1 と 2 の両方が独立して動作するべき

---

## フェーズ 5: ユーザーストーリー 3 - Markdownノートの編集（優先度: P1）

**ゴール**: ユーザーが一覧から既存のノートを選択すると、そのノートを編集できる

**独立テスト**: 既存のノートを一覧から選択し、内容を変更して保存。再度そのノートを開いた際、変更が反映されていることでテスト可能

### ユーザーストーリー 3 のテスト（Constitution に従い TDD を適用）🔴

> **重要**: TDD サイクルに従い、テストを先に書き、実装前に失敗を確認

- [ ] T061 [P] [US3] backend/tests/integration/test_notes_api.py に GET /notes/{note_id} と PUT /notes/{note_id} エンドポイントの統合テストを記述（200/404 レスポンス、更新処理）
- [ ] T062 [P] [US3] backend/tests/unit/test_note_repository.py に NoteRepository.get_by_id() と update() のユニットテストを記述
- [ ] T063 [P] [US3] backend/tests/unit/test_note_service.py に NoteService.get_note() と update_note() のユニットテストを記述（updated_at 自動更新）
- [ ] T064 [P] [US3] frontend/tests/e2e/notes.spec.ts に E2E テストを記述（編集フロー全体）

**チェックポイント**: すべてのテストが失敗（Red）することを確認

### ユーザーストーリー 3 の実装

- [ ] T065 [P] [US3] backend/src/repositories/note_repository.py に get_by_id メソッドを実装（MongoDB からノートを取得）
- [ ] T066 [P] [US3] backend/src/repositories/note_repository.py に update メソッドを実装（MongoDB 更新、updated_at 自動更新）
- [ ] T067 [US3] backend/src/services/note_service.py に get_note メソッドを実装（リポジトリを呼び出し、404 エラー処理）
- [ ] T068 [US3] backend/src/services/note_service.py に update_note メソッドを実装（リポジトリを呼び出し、部分更新対応）
- [ ] T069 [US3] backend/src/api/notes.py に GET /notes/{note_id} エンドポイントを実装（NoteService を呼び出し）
- [ ] T070 [US3] backend/src/api/notes.py に PUT /notes/{note_id} エンドポイントを実装（NoteService を呼び出し）
- [ ] T071 [US3] backend/src/api/notes.py に 404 Not Found エラーハンドリングを追加
- [ ] T072 [P] [US3] frontend/src/services/noteService.ts に getNote と updateNote 関数を実装
- [ ] T073 [US3] frontend/src/hooks/useNotes.ts に useQuery と useMutation を使用した getNote と updateNote を追加
- [ ] T074 [US3] frontend/src/pages/EditNotePage.tsx に EditNotePage コンポーネントを実装（NoteEditor を再利用、既存データをロード）
- [ ] T075 [US3] frontend/src/App.tsx に EditNotePage へのルーティングを追加
- [ ] T076 [US3] frontend/src/components/NoteList.tsx に各ノート項目にクリックイベントを追加（EditNotePage へ遷移）
- [ ] T076a [US3] frontend/src/hooks/useUnsavedChanges.ts に未保存変更検出フックを実装（FR-018 対応: フォームの変更を監視）
- [ ] T076b [US3] frontend/src/components/UnsavedChangesDialog.tsx に未保存変更警告ダイアログを実装（FR-018 対応: 「変更を保存しますか？」確認ダイアログ）
- [ ] T076c [US3] frontend/src/pages/EditNotePage.tsx と CreateNotePage.tsx に未保存変更警告を統合（FR-018 対応: ノート切り替え時に確認ダイアログを表示）
- [ ] T077 [US3] リンター・フォーマッター実行（backend と frontend 両方）
- [ ] T078 [US3] すべてのテストが通過（Green）することを確認

**チェックポイント**: ユーザーストーリー 1、2、3 が独立して機能し、基本的な CRUD 操作が完成

---

## フェーズ 6: ユーザーストーリー 4 - Markdownノートの削除（優先度: P2）

**ゴール**: ユーザーがノートの詳細画面または一覧画面で「削除」ボタンをクリックすると、確認ダイアログが表示され、削除できる

**独立テスト**: 既存のノートを選択し、削除ボタンをクリック。確認ダイアログで「削除」を選択した後、一覧画面でそのノートが表示されなくなることでテスト可能

### ユーザーストーリー 4 のテスト（Constitution に従い TDD を適用）🔴

> **重要**: TDD サイクルに従い、テストを先に書き、実装前に失敗を確認

- [ ] T079 [P] [US4] backend/tests/integration/test_notes_api.py に DELETE /notes/{note_id} エンドポイントの統合テストを記述（204 レスポンス、404 エラー）
- [ ] T080 [P] [US4] backend/tests/unit/test_note_repository.py に NoteRepository.delete() のユニットテストを記述
- [ ] T081 [P] [US4] backend/tests/unit/test_note_service.py に NoteService.delete_note() のユニットテストを記述
- [ ] T082 [P] [US4] frontend/tests/e2e/notes.spec.ts に E2E テストを記述（削除フロー全体、確認ダイアログ）

**チェックポイント**: すべてのテストが失敗（Red）することを確認

### ユーザーストーリー 4 の実装

- [ ] T083 [US4] backend/src/repositories/note_repository.py に delete メソッドを実装（MongoDB から削除）
- [ ] T084 [US4] backend/src/services/note_service.py に delete_note メソッドを実装（リポジトリを呼び出し、404 エラー処理）
- [ ] T085 [US4] backend/src/api/notes.py に DELETE /notes/{note_id} エンドポイントを実装（NoteService を呼び出し、204 レスポンス）
- [ ] T086 [P] [US4] frontend/src/services/noteService.ts に deleteNote 関数を実装
- [ ] T087 [US4] frontend/src/hooks/useNotes.ts に useMutation を使用した deleteNote ミューテーションを追加
- [ ] T088 [US4] frontend/src/components/DeleteConfirmDialog.tsx に削除確認ダイアログコンポーネントを実装
- [ ] T089 [US4] frontend/src/pages/EditNotePage.tsx に「削除」ボタンと削除確認ダイアログを追加
- [ ] T090 [US4] frontend/src/components/NoteList.tsx に各ノート項目に「削除」ボタンを追加（オプション）
- [ ] T091 [US4] リンター・フォーマッター実行（backend と frontend 両方）
- [ ] T092 [US4] すべてのテストが通過（Green）することを確認

**チェックポイント**: 基本的な CRUD 操作（作成、読取、更新、削除）がすべて完成

---

## フェーズ 7: ユーザーストーリー 5 - WYSIWYG エディタでの編集（優先度: P2）

**ゴール**: ユーザーがノートを作成または編集する際、WYSIWYGエディタモードを選択でき、ツールバーのボタンで視覚的にフォーマットを適用できる

**独立テスト**: 新規ノート作成画面でWYSIWYGモードに切り替え、ツールバーのボタンを使用してテキストをフォーマット。保存後、期待通りのMarkdownが生成されていることでテスト可能

### ユーザーストーリー 5 のテスト（Constitution に従い TDD を適用）🔴

> **重要**: TDD サイクルに従い、テストを先に書き、実装前に失敗を確認

- [ ] T093 [P] [US5] frontend/tests/unit/components/WysiwygEditor.test.tsx に WysiwygEditor コンポーネントのユニットテストを記述（ツールバー操作、Markdown 変換）
- [ ] T094 [P] [US5] frontend/tests/e2e/notes.spec.ts に E2E テストを記述（WYSIWYG モード切り替え、フォーマット適用）

**チェックポイント**: すべてのテストが失敗（Red）することを確認

### ユーザーストーリー 5 の実装

- [ ] T095 [US5] frontend/package.json に TipTap 関連パッケージを追加（@tiptap/react、@tiptap/starter-kit、@tiptap/extension-markdown）
- [ ] T096 [US5] frontend/src/components/WysiwygEditor.tsx に WysiwygEditor コンポーネントを実装（TipTap エディタ、ツールバー）
- [ ] T097 [US5] frontend/src/components/WysiwygEditor.tsx に太字、斜体、見出し、リスト、リンクのツールバーボタンを追加
- [ ] T098 [US5] frontend/src/components/WysiwygEditor.tsx に Markdown との相互変換機能を実装
- [ ] T099 [US5] frontend/src/components/NoteEditor.tsx に「Markdownモード」と「WYSIWYGモード」の切り替えボタンを追加
- [ ] T100 [US5] frontend/src/components/NoteEditor.tsx に WysiwygEditor を統合
- [ ] T101 [US5] frontend/src/styles/ に WysiwygEditor のスタイルを追加（Tailwind CSS）
- [ ] T102 [US5] リンター・フォーマッター実行（frontend）
- [ ] T103 [US5] すべてのテストが通過（Green）することを確認

**チェックポイント**: WYSIWYG エディタが機能し、Markdown との相互変換が正しく動作する

---

## フェーズ 8: ユーザーストーリー 6 - リアルタイムプレビュー表示（優先度: P2）

**ゴール**: ユーザーがMarkdownモードでノートを編集している際、画面の右側にリアルタイムレンダリングされたプレビューパネルが表示される

**独立テスト**: Markdownモードでノートを編集し、見出し、リスト、リンクなどのMarkdown記法を入力。プレビューエリアに期待通りのHTMLがレンダリングされることでテスト可能

### ユーザーストーリー 6 のテスト（Constitution に従い TDD を適用）🔴

> **重要**: TDD サイクルに従い、テストを先に書き、実装前に失敗を確認

- [ ] T104 [P] [US6] frontend/tests/unit/components/MarkdownPreview.test.tsx に MarkdownPreview コンポーネントのユニットテストを記述（レンダリング、サニタイズ）
- [ ] T105 [P] [US6] frontend/tests/e2e/notes.spec.ts に E2E テストを記述（プレビューのリアルタイム更新、表示/非表示切り替え）

**チェックポイント**: すべてのテストが失敗（Red）することを確認

### ユーザーストーリー 6 の実装

- [ ] T106 [US6] frontend/package.json に react-markdown と remark-gfm（GitHub Flavored Markdown）を追加
- [ ] T107 [US6] frontend/src/components/MarkdownPreview.tsx に MarkdownPreview コンポーネントを実装（react-markdown を使用）
- [ ] T108 [US6] frontend/src/components/MarkdownPreview.tsx に XSS 対策（react-markdown のデフォルトサニタイズ）を確認
- [ ] T109 [US6] frontend/src/components/NoteEditor.tsx にプレビューパネルを右側に配置（横並びレイアウト）
- [ ] T110 [US6] frontend/src/components/NoteEditor.tsx にプレビューパネルの表示/非表示切り替えボタンを追加
- [ ] T111 [US6] frontend/src/components/NoteEditor.tsx に入力のデバウンス処理を追加（300ms、パフォーマンス向上）
- [ ] T112 [US6] frontend/src/styles/ にプレビューパネルのスタイルを追加（Tailwind CSS、レスポンシブ対応）
- [ ] T113 [US6] リンター・フォーマッター実行（frontend）
- [ ] T114 [US6] すべてのテストが通過（Green）することを確認

**チェックポイント**: リアルタイムプレビューが機能し、Markdown が正しくレンダリングされる

---

## フェーズ 9: 仕上げと横断的関心事

**目的**: 複数のユーザーストーリーに影響する改善と品質保証

- [ ] T115 [P] backend/src/ のすべてのモジュールに docstring を追加（Constitution III. 準拠）
- [ ] T116 [P] frontend/src/ のすべてのコンポーネントと関数に JSDoc コメントを追加
- [ ] T117 [P] backend/tests/ のテストカバレッジを確認（目標: 80% 以上、API は 100%）
- [ ] T118 [P] frontend/tests/ のテストカバレッジを確認（目標: 80% 以上）
- [ ] T118a [P] backend/tests/performance/test_startup_performance.py に 100 件ノート時の起動時間テストを追加（SC-004 検証: 3 秒以内）
- [ ] T118b [P] frontend/tests/performance/wysiwyg_performance.spec.ts に WYSIWYG フォーマット反映時間テストを追加（SC-005 検証: 1 秒以内）
- [ ] T118c [P] frontend/tests/performance/large_note_performance.spec.ts に 10,000 文字ノート編集時間テストを追加（SC-008 検証: 2 秒以内）
- [ ] T119 [P] backend/ でセキュリティスキャンを実行（Bandit など）
- [ ] T120 [P] frontend/ でセキュリティスキャンを実行（npm audit）
- [ ] T121 backend/src/api/notes.py にレート制限を追加（オプション、将来的な DoS 対策）
- [ ] T122 [P] frontend/src/components/ でアクセシビリティチェックを実行（axe-core）
- [ ] T123 frontend/src/ でパフォーマンス最適化を実装（コード分割、React.lazy）
- [ ] T124 backend/src/repositories/note_repository.py に MongoDB インデックスを作成（created_at、updated_at）
- [ ] T125 [P] specs/001-markdown-note-manager/quickstart.md の手順を検証（セットアップから起動まで）
- [ ] T126 [P] README.md にプロジェクトの概要と基本的な使い方を記述
- [ ] T127 コードクリーンアップとリファクタリング（重複コード削減、命名の一貫性）
- [ ] T128 すべてのリンター・フォーマッターを最終実行（backend と frontend 両方）
- [ ] T129 全テストスイートを実行して 100% 通過することを確認

**最終チェックポイント**: すべてのユーザーストーリーが機能し、品質基準を満たしていることを確認

---

## 依存関係と実行順序

### フェーズの依存関係

- **セットアップ（フェーズ 1）**: 依存関係なし - すぐに開始可能
- **基盤（フェーズ 2）**: セットアップ完了に依存 - すべてのユーザーストーリーをブロック
- **ユーザーストーリー 1-3（フェーズ 3-5）**: すべて基盤フェーズ完了に依存、P1 優先度
  - これら 3 つのストーリーは基本的な CRUD 操作を構成し、MVP に必須
  - 理想的には順次実行（US1 → US2 → US3）
  - 複数人いれば US1 完了後に US2 と US3 を並列実行可能
- **ユーザーストーリー 4-6（フェーズ 6-8）**: 基盤フェーズ完了に依存、P2 優先度
  - これらは拡張機能で、US1-3 が完了した後に実装
  - US4、US5、US6 は独立しており、並列実行可能
- **仕上げ（フェーズ 9）**: 希望するすべてのユーザーストーリー完了に依存

### ユーザーストーリーの依存関係

```text
基盤 → US1（一覧）→ US2（作成）→ US3（編集）→ US4（削除）
                                      ↓
                                    US5（WYSIWYG）
                                      ↓
                                    US6（プレビュー）
```

- **US1（一覧表示）**: 基盤完了後に開始可能 - 他のストーリーへの依存なし
- **US2（作成）**: US1 完了推奨（一覧に表示するため）- ただし技術的には独立
- **US3（編集）**: US1 完了必須（一覧から選択するため）
- **US4（削除）**: US1、US3 完了後（編集画面または一覧から削除するため）
- **US5（WYSIWYG）**: US2、US3 完了後（作成・編集画面で使用）
- **US6（プレビュー）**: US2、US3 完了後（作成・編集画面で使用）

### 各ユーザーストーリー内

1. テストを先に書いて失敗することを確認（Red）
2. バックエンドモデルを実装
3. バックエンドリポジトリを実装
4. バックエンドサービスを実装
5. バックエンド API エンドポイントを実装
6. フロントエンドサービス（API クライアント）を実装
7. フロントエンドコンポーネントを実装
8. フロントエンドページを統合
9. リンター・フォーマッター実行
10. すべてのテストが通過することを確認（Green）

### 並列実行の機会

**フェーズ 1（セットアップ）**:
- T004 と T005（リンティング設定）
- T006（環境変数）、T007（Docker）、T008（README）

**フェーズ 2（基盤）**:
- バックエンド基盤タスク（T009-T019）とフロントエンド基盤タスク（T020-T025）は並列実行可能

**各ユーザーストーリー内**:
- [P] マークされたすべてのテストは並列実行可能
- [P] マークされたバックエンドとフロントエンドのタスクは並列実行可能

**ユーザーストーリー間**:
- US4、US5、US6 は US1-3 完了後に並列実行可能

---

## 並列実行の例

### ユーザーストーリー 1 の並列実行

```bash
# テストを同時に書く:
タスク: "backend/tests/integration/test_notes_api.py に GET /notes のテスト"
タスク: "backend/tests/unit/test_note_repository.py に list() のテスト"
タスク: "backend/tests/unit/test_note_service.py に list_notes() のテスト"
タスク: "frontend/tests/unit/components/NoteList.test.tsx のテスト"

# バックエンドとフロントエンドを同時に実装:
タスク: "backend/src/models/note.py にモデルを作成"
タスク: "frontend/src/types/note.ts に型定義を作成"

タスク: "backend/src/api/notes.py に GET /notes を実装"
タスク: "frontend/src/services/noteService.ts に listNotes を実装"
```

### ユーザーストーリー 4-6 の並列実行（MVP 後）

```bash
# US1-3 完了後、US4、US5、US6 を同時に開始:
開発者 A: ユーザーストーリー 4（削除機能）
開発者 B: ユーザーストーリー 5（WYSIWYG エディタ）
開発者 C: ユーザーストーリー 6（リアルタイムプレビュー）
```

---

## 実装戦略

### MVP ファースト（ユーザーストーリー 1-3 のみ）推奨 🎯

1. **フェーズ 1**: セットアップを完了（T001-T008）
2. **フェーズ 2**: 基盤を完了（T009-T026）→ **重要チェックポイント**
3. **フェーズ 3**: ユーザーストーリー 1（一覧表示）を完了（T027-T043）
4. **フェーズ 4**: ユーザーストーリー 2（作成）を完了（T044-T060）
5. **フェーズ 5**: ユーザーストーリー 3（編集）を完了（T061-T078）
6. **停止して検証**: US1-3 を独立してテスト、動作確認 → **MVP 完成!**
7. **オプション**: フェーズ 6-8（US4-6）を追加実装

### 増分デリバリー（推奨）

1. **セットアップ + 基盤**を完了 → 基盤準備完了
2. **US1（一覧）**を追加 → 独立してテスト → デモ可能
3. **US2（作成）**を追加 → 独立してテスト → デモ可能
4. **US3（編集）**を追加 → 独立してテスト → **MVP デモ!**
5. **US4（削除）**を追加 → 独立してテスト → デモ可能
6. **US5（WYSIWYG）**を追加 → 独立してテスト → デモ可能
7. **US6（プレビュー）**を追加 → 独立してテスト → デモ可能
8. 各ストーリーは以前のストーリーを壊さずに価値を追加

### 並列チーム戦略（複数人の場合）

複数の開発者がいる場合:

1. **チームでセットアップ + 基盤を一緒に完了**
2. **基盤完了後**:
   - 開発者 A: ユーザーストーリー 1（一覧）
   - 開発者 B: ユーザーストーリー 1 のフロントエンド（A がバックエンド完了後）
3. **US1 完了後**:
   - 開発者 A: ユーザーストーリー 2（作成）
   - 開発者 B: ユーザーストーリー 3（編集）
4. **MVP（US1-3）完了後**:
   - 開発者 A: ユーザーストーリー 4（削除）
   - 開発者 B: ユーザーストーリー 5（WYSIWYG）
   - 開発者 C: ユーザーストーリー 6（プレビュー）

---

## サマリー

- **総タスク数**: 130 タスク
- **ユーザーストーリー別タスク数**:
  - US1（一覧表示）: 17 タスク（T027-T043）
  - US2（作成）: 17 タスク（T044-T060）
  - US3（編集）: 18 タスク（T061-T078）
  - US4（削除）: 14 タスク（T079-T092）
  - US5（WYSIWYG）: 11 タスク（T093-T103）
  - US6（プレビュー）: 11 タスク（T104-T114）
  - セットアップ: 8 タスク（T001-T008）
  - 基盤: 19 タスク（T009-T026, T018a）
  - 仕上げ: 15 タスク（T115-T129）

- **MVP スコープ（推奨）**: ユーザーストーリー 1-3（基本的な CRUD 操作）
  - セットアップ + 基盤 + US1 + US2 + US3 = 70 タスク
  - これにより、ノートの一覧表示、作成、編集が可能になり、基本的な価値を提供

- **並列化機会**:
  - フェーズ 1: 3-4 タスクを並列実行可能
  - フェーズ 2: バックエンドとフロントエンドを並列実行可能（最大 2 人）
  - 各ユーザーストーリー: テスト作成時に 3-4 タスクを並列実行可能
  - MVP 後: US4、US5、US6 を並列実行可能（最大 3 人）

- **独立したテスト条件**:
  - US1: MongoDB にサンプルデータを配置し、一覧画面で表示されることを確認
  - US2: 新規ノートを作成し、一覧画面に表示されることを確認
  - US3: 既存ノートを編集し、変更が保存されることを確認
  - US4: ノートを削除し、一覧から消えることを確認
  - US5: WYSIWYG モードでフォーマットを適用し、Markdown に変換されることを確認
  - US6: Markdown を入力し、プレビューパネルにリアルタイムでレンダリングされることを確認

---

## 注意事項

- **[P] マーク**: 異なるファイルに対する操作で、依存関係がないタスク
- **[Story] ラベル**: タスクを特定のユーザーストーリーにマッピングし、トレーサビリティを確保
- **TDD 厳守**: 各ユーザーストーリーでテストを先に書き、実装前に失敗することを確認（Red-Green-Refactor）
- **型安全性**: TypeScript strict mode と Python type hints を必須とする
- **コミット戦略**: 各タスクまたは論理的なグループの後にコミット
- **独立性**: 各ユーザーストーリーは独立して完了可能かつテスト可能であるべき
- **チェックポイント**: 任意のチェックポイントで停止してストーリーを独立して検証可能

**避けるべきこと**:
- 曖昧なタスク（具体的なファイルパスが不明）
- 同一ファイルの競合（複数人が同じファイルを編集）
- ストーリー間の強い依存関係（独立性を壊す）
- テストなしでの実装（TDD 原則違反）
