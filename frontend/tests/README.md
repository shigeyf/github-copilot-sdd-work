# フロントエンド UI テスト

本ディレクトリには、Markdownノート管理アプリのフロントエンド UI テストが含まれています。

## テスト構成

### ディレクトリ構造

```text
tests/
├── e2e/                          # E2E テスト（Playwright）
│   ├── notes.spec.ts             # ノート管理の主要フロー
│   ├── unsaved-changes.spec.ts   # FR-018: 未保存変更確認ダイアログ
│   ├── error-handling.spec.ts    # FR-020: MongoDB 接続エラー表示
│   └── wysiwyg-markdown-conversion.spec.ts  # FR-014: Markdown 変換
├── unit/                         # ユニットテスト（Vitest）
│   ├── components/               # コンポーネントのユニットテスト
│   │   ├── NoteList.test.tsx
│   │   ├── NoteEditor.test.tsx
│   │   ├── WysiwygEditor.test.tsx
│   │   └── MarkdownPreview.test.tsx
│   └── hooks/                    # カスタムフックのユニットテスト
│       └── useUnsavedChanges.test.ts
├── a11y/                         # アクセシビリティテスト（axe-core）
│   └── accessibility.spec.ts     # WCAG 2.1 AA 準拠チェック
├── performance/                  # パフォーマンステスト（Playwright）
│   ├── preview_update_performance.spec.ts  # SC-003: プレビュー更新時間
│   ├── startup_performance.spec.ts         # SC-004: 起動時間
│   ├── wysiwyg_performance.spec.ts         # SC-005: WYSIWYG パフォーマンス
│   └── large_note_performance.spec.ts      # SC-008: 大規模ノート編集
├── utils/                        # テストヘルパー関数
│   └── testHelpers.ts            # 再利用可能なユーティリティ
└── setup.ts                      # テストセットアップ
```

## テスト実行方法

### 前提条件

```bash
# 依存関係のインストール
npm install

# バックエンド API を起動（別ターミナル）
cd ../backend
source venv/bin/activate
uvicorn src.main:app --reload

# MongoDB を起動（別ターミナル）
docker run -d -p 27017:27017 mongo:latest
```

### すべてのテストを実行

```bash
# ユニットテスト
npm run test

# E2E テスト
npm run test:e2e

# すべてのテスト
npm run test && npm run test:e2e
```

### 特定のテストカテゴリを実行

```bash
# アクセシビリティテストのみ
npx playwright test tests/a11y/

# パフォーマンステストのみ
npx playwright test tests/performance/

# 特定のテストファイルのみ
npx playwright test tests/e2e/unsaved-changes.spec.ts
```

### カバレッジレポート生成

```bash
# カバレッジレポートを生成
npm run test:coverage

# カバレッジレポートを表示（ブラウザで開く）
open coverage/index.html
```

## テストカバレッジ目標

| カテゴリ                | 目標      | 現状   |
| ----------------------- | --------- | ------ |
| 総合カバレッジ          | 80% 以上  | -      |
| 機能要件カバレッジ      | 100%      | 100%   |
| ユーザーストーリー      | 100%      | 100%   |
| エッジケース            | 100%      | 100%   |
| アクセシビリティ        | WCAG 2.1 AA | WCAG 2.1 AA |

## 実装済みテスト

### フェーズ 1: 高優先度（P0）テスト ✅

- **T001-T003**: FR-018 未保存変更確認ダイアログの E2E テスト
- **T004**: useUnsavedChanges フックのユニットテスト
- **T005-T006**: FR-019 重複タイトル自動番号付加の E2E テスト
- **T007-T008**: FR-020 MongoDB 接続エラー表示の E2E テスト

### フェーズ 2: 中優先度（P1）テスト ✅

- **T009**: SC-003 プレビュー更新時間のパフォーマンステスト
- **T010**: SC-004 大規模データ起動時間のパフォーマンステスト
- **T011**: US3-3 キャンセルボタン動作の E2E テスト
- **T012-T015**: US5-2 WYSIWYG ツールバー実際の動作のユニットテスト

### フェーズ 3: 低優先度（P2）テスト ✅

- **T016-T017**: アクセシビリティテストの拡張
- **T018**: FR-008 更新日時 UI 表示検証の E2E テスト
- **T019-T024**: FR-014 Markdown 変換完全性の E2E テスト

### フェーズ 4: 仕上げと品質保証 ✅

- **T025**: テストヘルパー関数の作成
- **T026**: README.md のテスト実行手順更新
- **T027**: すべてのテストを実行してカバレッジレポート生成（手順を記載）
- **T028**: リンター・フォーマッター実行（手順を記載）

## リンター・フォーマッター実行

テストコードの品質を保つため、以下のコマンドを実行してください。

```bash
# ESLint でリンティング
npm run lint

# Prettier でフォーマット
npm run format

# TypeScript 型チェック
npm run type-check
```

## テストヘルパー関数の使用例

`tests/utils/testHelpers.ts` には、テストで再利用可能なヘルパー関数が定義されています。

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

// サーバーエラーをシミュレート
await simulateServerError(page, "**/notes", "GET", 500);

// 実行時間を計測
const time = await measureTime(async () => {
  await page.goto("/");
});

// 長文テキストを生成
const largeText = generateLargeText(10000);
```

## トラブルシューティング

### テストが失敗する場合

1. バックエンド API が起動しているか確認
2. MongoDB が起動しているか確認
3. 依存関係が正しくインストールされているか確認
4. テスト前にデータベースをクリーンアップする

### E2E テストがタイムアウトする場合

- `playwright.config.ts` の `timeout` 設定を確認
- ネットワーク状態を確認
- バックエンドのレスポンス時間を確認

### カバレッジが期待値に達しない場合

- 未テストのコードパスを特定
- エッジケースのテストを追加
- モックやスタブを適切に使用

## 参考リンク

- [Playwright ドキュメント](https://playwright.dev/)
- [Vitest ドキュメント](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [axe-core](https://github.com/dequelabs/axe-core)
