# PR タイトル修正が必要です

## 問題

PR #10 のタイトルが `.github/copilot-instructions.md` のルールに準拠していません。

### 現在のPRタイトル

```
プロジェクト実装タスクリスト（tasks.md）を生成
```

### 期待されるPRタイトル

```
[Copilot] プロジェクト実装タスクリスト（tasks.md）を生成
```

## ルール引用

`.github/copilot-instructions.md` の 51-52 行目より:

> - **PR タイトル**: 必ず日本語で記述し、先頭に `[Copilot]` を付けること
>   - 例: `[Copilot] 機能Aの実装`

## 修正方法

GitHub UI で以下の手順でPRタイトルを修正してください：

1. PR #10 を開く: https://github.com/shigeyf/github-copilot-sdd-work/pull/10
2. タイトル部分をクリックして編集モードにする
3. タイトルの先頭に `[Copilot] ` を追加する
4. 変更を保存する

### 修正後のタイトル

```
[Copilot] プロジェクト実装タスクリスト（tasks.md）を生成
```

## その他の確認項目

以下は問題ありません ✅:

- **コミットメッセージ**: `[Copilot]` プレフィックスが正しく付いている
- **PR説明文**: 日本語で記述され、変更内容が明確に説明されている
- **ブランチ名**: `copilot/create-project-implementation-tasks` の形式で適切

## 備考

GitHub Copilot Coding Agent には PR タイトルを直接更新する権限がないため、手動での修正が必要です。
このファイルは修正完了後に削除してください。
