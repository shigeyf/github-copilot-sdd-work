# GitHub Copilot ベストプラクティス (日本語)

GitHub Copilot の構成ファイルのテンプレートとベストプラクティスを提供するリポジトリです。
また、これらのベストプラクティスを実証するためのサンプルアプリケーション「**Markdown ノート管理アプリ**」を含んでいます。

## Markdown ノート管理アプリ

ブラウザ上で Markdown 形式のノートを作成、編集、削除、閲覧できる Web アプリケーションです。
Specification-Driven Development (SDD) のアプローチで、GitHub Copilot Coding Agent を活用して開発されました。

### 主な機能

- **ノート一覧表示**: すべてのノートをタイトル、作成日時、最終更新日時とともに一覧表示
- **ノート作成・編集・削除**: CRUD 操作の完全なサポート
- **WYSIWYG エディタ**: TipTap ベースのリッチテキストエディタ（Markdown との相互変換対応）
- **リアルタイムプレビュー**: Markdown 入力時に右側パネルでリアルタイムレンダリング
- **重複タイトル処理**: 同名タイトルのノート作成時に自動番号付加
- **未保存変更の警告**: ページ遷移時に確認ダイアログを表示
- **レート制限**: API エンドポイントごとのレート制限によるセキュリティ強化

### 技術スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | React 19, TypeScript 5.9 (strict mode), Vite 7, Tailwind CSS 4 |
| バックエンド | Python 3.11+, FastAPI 0.115+, Pydantic v2 |
| データベース | MongoDB 7+ (motor ドライバー) |
| エディタ | TipTap v2 (WYSIWYG), react-markdown (プレビュー) |
| テスト | pytest + pytest-asyncio (バックエンド), Vitest (フロントエンド), Playwright (E2E) |
| インフラ | Docker Compose |

### クイックスタート

```bash
# Docker Compose で起動
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker-compose up -d

# ブラウザで http://localhost:5173 にアクセス
```

### ローカル開発 (Docker を使用しない場合)

#### バックエンド

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -e ".[dev]"
cp .env.example .env
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

#### フロントエンド

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

#### 開発コマンド

| コマンド | バックエンド | フロントエンド |
|----------|-------------|---------------|
| テスト実行 | `pytest` | `npm run test` |
| E2E テスト | - | `npm run test:e2e` |
| リンター | `ruff check src/` | `npm run lint` |
| フォーマット | `black src/` | `npm run format` |
| 型チェック | `mypy src/` | `npm run type-check` |

詳細なセットアップ手順は [クイックスタートガイド](specs/001-markdown-note-manager/quickstart.md) を参照してください。

### プロジェクト構造

```text
├── backend/              # FastAPI バックエンド
│   ├── src/
│   │   ├── api/          # REST API エンドポイント
│   │   ├── models/       # Pydantic モデル
│   │   ├── repositories/ # データアクセス層
│   │   ├── services/     # ビジネスロジック層
│   │   └── utils/        # ユーティリティ
│   └── tests/            # テスト
├── frontend/             # React フロントエンド
│   ├── src/
│   │   ├── components/   # UI コンポーネント
│   │   ├── hooks/        # カスタムフック
│   │   ├── pages/        # ページコンポーネント
│   │   ├── services/     # API サービス
│   │   └── types/        # TypeScript 型定義
│   └── tests/            # テスト
├── specs/                # 仕様書・設計ドキュメント
│   └── 001-markdown-note-manager/
│       ├── spec.md       # 機能仕様書
│       ├── plan.md       # 実装計画書
│       ├── tasks.md      # タスクリスト
│       ├── quickstart.md # クイックスタートガイド
│       └── contracts/    # API 契約 (OpenAPI)
├── .github/              # GitHub Copilot 設定
│   ├── copilot-instructions.md
│   ├── instructions/
│   ├── prompts/
│   └── agents/
├── .specify/             # 開発プロセステンプレート
│   ├── memory/
│   │   └── constitution.md
│   └── templates/
└── docker-compose.yaml
```

---

## ディレクトリ構成

```text
your-repository/
│
├── .github/
│   ├── copilot-instructions.md            # リポジトリ全体のカスタム指示 (必須)
│   ├── instructions/                      # 固有のカスタム指示
│   │   └── *.instructions.md
│   ├── prompts/                           # 再利用可能プロンプト (VS Code)
│   │   └── *.prompt.md
│   ├── agents/                            # カスタムエージェント (VS Code)
│   │   └── *.agent.md
│   └── workflows/                         # GitHub Actions
│
├── .claude/
│   └── skills/                            # プロジェクトスキル (推奨)
│       └── <skill-name>/
│           └── SKILL.md
│
├── .specify/                              # 開発プロセステンプレート
│   ├── memory/
│   │   └── constitution.md                # プロジェクト憲章 (推奨)
│   └── templates/                         # 仕様書・計画書テンプレート
│       ├── constitution-template.md
│       ├── spec-template.md
│       ├── plan-template.md
│       └── tasks-template.md
│
├── .vscode/
│   ├── settings.json                      # VS Code / Copilot 設定
│   └── mcp.json                           # MCP サーバー設定
│
├── AGENTS.md                              # エージェント指示
├── CLAUDE.md                              # Claude 互換指示 (オプション)
└── GEMINI.md                              # Gemini 互換指示 (オプション)
```

## 各ファイルの説明

### GitHub.com / Coding Agent / CLI 共通

| ファイル                                 | 説明                                     | 対象                       |
| ---------------------------------------- | ---------------------------------------- | -------------------------- |
| `.github/copilot-instructions.md`        | リポジトリ全体に適用される基本指示       | 全 Copilot 機能            |
| `.github/instructions/*.instructions.md` | 特定モジュールや特定パスに適用される指示 | Coding Agent, Code Review  |
| `.claude/skills/*/SKILL.md`              | タスク固有のスキル定義                   | Coding agent, CLI, VS Code |
| `.specify/memory/constitution.md`        | プロジェクト憲章（開発原則・品質基準）   | 開発プロセス全体           |
| `AGENTS.md`                              | エージェント向け指示 (階層継承)          | AI エージェント全般        |

### 開発プロセステンプレート

| ファイル                                   | 説明                                   | 対象                  |
| ------------------------------------------ | -------------------------------------- | --------------------- |
| `.specify/memory/constitution.md`          | プロジェクト憲章（開発原則・品質基準） | 開発プロセス全体      |
| `.specify/templates/constitution-template.md` | プロジェクト憲章のテンプレート         | 新規プロジェクト作成時 |
| `.specify/templates/spec-template.md`      | 機能仕様書テンプレート                 | 機能設計時            |
| `.specify/templates/plan-template.md`      | 実装計画書テンプレート                 | 実装計画作成時        |
| `.specify/templates/tasks-template.md`     | タスクリストテンプレート               | タスク分解時          |

### VS Code 専用

| ファイル                      | 説明                               | 対象                 |
| ----------------------------- | ---------------------------------- | -------------------- |
| `.github/prompts/*.prompt.md` | 再利用可能なプロンプトテンプレート | VS Code Copilot Chat |
| `.github/agents/*.agent.md`   | カスタムエージェント定義           | VS Code Copilot Chat |
| `.vscode/mcp.json`            | MCP サーバー連携設定               | VS Code              |

## AGENTS.md と copilot-instructions.md の役割分担

### 各ファイルの役割

| ファイル                          | 対象                                          | 記述内容                        |
| --------------------------------- | --------------------------------------------- | ------------------------------- |
| `.github/copilot-instructions.md` | GitHub Copilot 全機能 (Chat, Coding Agent 等) | **包括的なルール** (正規ソース) |
| `AGENTS.md`                       | Copilot 以外のエージェント (Codex, Claude 等) | **最小限のルール** + 参照       |

### 設計原則

1. **copilot-instructions.md を Single Source of Truth とする**
   - GitHub が公式にサポートする設定ファイル
   - Copilot の全機能に自動適用される
   - 詳細なコーディング規約・作業プロセスはここに記述

2. **AGENTS.md は補完的な役割**
   - Copilot 以外のエージェント向け（OpenAI Codex、Claude Code など）
   - ディレクトリ階層で細かく制御可能（例：`/tests/AGENTS.md` でテスト用ルール）
   - 最小限の自己完結したルールを記述し、詳細は copilot-instructions.md を参照

### 各エージェントの読み込み動作

| エージェント                | copilot-instructions.md | AGENTS.md |
| --------------------------- | :---------------------: | :-------: |
| GitHub Copilot Coding Agent |            ✓            |     ✓     |
| GitHub Copilot Chat         |            ✓            |     -     |
| GitHub Copilot Completion   |            ✓            |     -     |
| OpenAI Codex (CLI)          |            ?            |     ✓     |
| Claude Code                 |            ?            |     ✓     |

**注意**: Copilot 以外のエージェントは copilot-instructions.md
を自動読み込みしない可能性があるため、 AGENTS.md
には最低限のルールを自己完結で記述し、詳細は参照として案内することを推奨します。

## スキル vs カスタム指示 の使い分け

| 種類             | 用途                         | ロードタイミング |
| ---------------- | ---------------------------- | ---------------- |
| **カスタム指示** | コーディング規約、基本ルール | 常に適用         |
| **スキル**       | 特定タスクの詳細手順         | 関連時のみ       |

**推奨**: スキルは `.claude/skills/` に統一することで、GitHub Copilot と Claude
Code の両方で利用可能

## プロジェクト憲章（Constitution）について

`.specify/memory/constitution.md` は、プロジェクト固有の開発原則、技術スタック要件、品質基準、
開発ワークフローを定義するプロジェクト憲章です。憲章はすべての開発プラクティスに優先し、
コードレビューやCI/CDでの検証基準となります。

### 憲章の主な内容

#### 基本原則

プロジェクトが遵守すべき交渉不可能なルールを定義します。例：
- 最新の安定バージョンの利用
- 型安全性の厳守（TypeScript strict mode、Python type hints）
- テスト駆動開発（TDD）の採用
- API ユニットテスト必須
- コミット前リンター実行
- シークレット管理の徹底

#### 技術スタック要件

使用する言語、フレームワーク、ツールを明示します。新規技術の導入は憲章の改訂を経て行います。

#### 品質基準

コードカバレッジ、静的解析、ドキュメント要件などの測定可能な品質目標を定義します。

#### 開発ワークフロー

ブランチ戦略、コードレビュープロセス、リリース手順などを規定します。

#### ガバナンス

憲章の修正手順、コンプライアンス検証方法、例外処理を明確化します。

### 憲章の活用方法

1. **新規プロジェクト作成時**: テンプレート（`.specify/templates/constitution-template.md`）から作成
2. **機能開発時**: 仕様書・計画書・タスクテンプレートが自動的に憲章を参照
3. **コードレビュー時**: レビュアーは憲章遵守を確認
4. **CI/CD**: 自動チェック可能な項目（リンター、型チェック、テストカバレッジ）を自動化

## Copilot Instructions について

このリポジトリの `.github/copilot-instructions.md` には、GitHub Copilot Coding Agent に対する包括的な指示が定義されています。

### 主な指示内容

#### 基本原則

- **言語設定**: すべての出力・応答は日本語で記述
- **例外**: コード内の識別子（変数名、関数名など）は英語を使用

#### Coding Agent 向け指示

- **Git コミットと PR**: 日本語でのコミットメッセージ、PR タイトル・説明文の記述規則
  - コミットメッセージ: `[Copilot]` プレフィックスを付与
  - PR タイトル: `[Copilot]` プレフィックスを付与、Draft PR の場合は `[WIP]` を維持
- **作業プロセス**: タスク理解、コードベース調査、計画共有、小単位の変更、動作確認、完了報告

#### コード生成向け指示

- **コメントとドキュメント**: 日本語でのコメント記述、コーディング規約の遵守
- **コード品質**: 可読性、エラーハンドリング、コーディングスタイルの統一
- **テスト**: テストカバレッジの確保、テスト品質の維持
- **セキュリティ**: 機密情報の保護、セキュアコーディング
- **パフォーマンス**: 効率的なコードの実装

#### Copilot Chat 向け指示

- **対話形式**: 日本語での対話、分かりやすい技術説明
- **情報提供**: 明確で簡潔な回答、具体例の提供、ベストプラクティスの推奨
- **コードレビュー**: 建設的なフィードバック、多角的なレビュー観点

#### 禁止事項

- 機密情報の漏洩
- 著作権侵害
- 悪意のあるコード生成
- 既存機能の不必要な破壊

#### ベストプラクティス

- 段階的な変更
- ドキュメント優先
- 継続的な改善
- 積極的なコミュニケーション

これらの指示により、Copilot は一貫性のある高品質なコード生成とレビューを実現します。

## ファイルフォーマット

### カスタム指示 (`.github/copilot-instructions.md`)

```markdown
# GitHub Copilot Instructions

## 言語設定

すべての応答は日本語で記述すること。

## コーディング規約

- 変数名・関数名は英語で記述
- コメントは日本語で記述

## ビルド・テスト

- ビルド: `npm run build`
- テスト: `npm test`
```

### パス固有指示 (`.github/instructions/*.instructions.md`)

```markdown
---
applyTo: "**/*.py"
---

# Python コーディング規約

- Type hints を必須とする
- docstring は Google スタイル
```

### スキル (`.claude/skills/*/SKILL.md`)

```markdown
---
name: github-actions-debugging
description: GitHub Actions のワークフロー失敗をデバッグする手順
---

# デバッグ手順

1. 失敗したワークフローを確認
2. エラーログを取得
3. 修正して再実行
```

### プロンプトファイル (`.github/prompts/*.prompt.md`) - VS Code

```markdown
---
description: コードレビューを実行
agent: agent
tools: ["search", "read_file"]
---

# コードレビュー

以下の観点でレビューしてください：

1. バグの可能性
2. セキュリティリスク
3. パフォーマンス

対象: ${selection}
```

### カスタムエージェント (`.github/agents/*.agent.md`) - VS Code

```markdown
---
name: planner
description: 実装計画を生成
tools:
    - search
    - fetch
    - githubRepo
model: Claude Sonnet 4
---

# Planning Agent

実装計画を生成します。コードの変更は行いません。
```

## 参考リンク

- [GitHub Docs: Adding repository custom instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)
- [GitHub Docs: About Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [VS Code: Customize chat to your workflow](https://code.visualstudio.com/docs/copilot/copilot-customization)
- [VS Code: Prompt files](https://code.visualstudio.com/docs/copilot/customization/prompt-files)
- [VS Code: Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
- [GitHub: awesome-copilot](https://github.com/github/awesome-copilot)

## ライセンス

Apache 2.0 License

See [LICENSE](LICENSE) for more information.
