---

description: "Markdownノート管理アプリのクイックスタートガイド"

---

# クイックスタートガイド: Markdownノート管理アプリ

**日付**: 2026-02-12 | **計画書**: [plan.md](./plan.md)

このガイドでは、Markdownノート管理アプリをローカル環境で起動し、開発を開始するための手順を説明します。

## 前提条件

以下のツールがインストールされていることを確認してください：

- **Node.js**: 18.x 以上 (推奨: 20.x LTS)
- **Python**: 3.11 以上
- **MongoDB**: 7.x 以上
- **Git**: 最新版
- **Docker & Docker Compose** (オプション: 簡単なセットアップ用)

### インストール確認

```bash
node --version    # v20.x.x
python --version  # Python 3.11.x
mongo --version   # MongoDB shell version v7.x.x
git --version     # git version 2.x.x
```

## セットアップ方法

### オプション 1: Docker Compose を使用 (推奨)

最も簡単な方法は Docker Compose を使用することです。

#### 1. リポジトリのクローン

```bash
git clone https://github.com/your-org/markdown-note-manager.git
cd markdown-note-manager
```

#### 2. 環境変数の設定

```bash
# バックエンドの環境変数をコピー
cp backend/.env.example backend/.env

# フロントエンドの環境変数をコピー
cp frontend/.env.example frontend/.env
```

#### 3. Docker Compose でサービスを起動

```bash
docker-compose up -d
```

これにより、以下のサービスが起動します：
- **MongoDB**: `localhost:27017`
- **バックエンド API**: `http://localhost:8000`
- **フロントエンド**: `http://localhost:5173`

#### 4. アプリケーションにアクセス

ブラウザで `http://localhost:5173` を開いてアプリケーションを使用できます。

#### 5. 停止とクリーンアップ

```bash
# サービスを停止
docker-compose down

# データベースを含めてクリーンアップ
docker-compose down -v
```

---

### オプション 2: ローカル環境で個別にセットアップ

Docker を使用しない場合は、各サービスを個別にセットアップします。

#### 1. MongoDB の起動

MongoDB をローカルで起動します：

```bash
# macOS (Homebrew)
brew services start mongodb-community@7.0

# Linux (systemd)
sudo systemctl start mongod

# Windows
# MongoDB を Windows サービスとして起動
```

MongoDB が起動していることを確認：

```bash
mongosh
# MongoDB に接続できれば OK
```

#### 2. バックエンドのセットアップ

```bash
cd backend

# 仮想環境の作成 (オプション)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# 環境変数の設定
cp .env.example .env
# .env ファイルを編集し、MongoDB 接続文字列を設定

# 開発サーバーの起動
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

バックエンド API は `http://localhost:8000` で起動します。

#### 3. フロントエンドのセットアップ

新しいターミナルウィンドウを開いて：

```bash
cd frontend

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env ファイルを編集し、バックエンド API の URL を設定

# 開発サーバーの起動
npm run dev
```

フロントエンドは `http://localhost:5173` で起動します。

#### 4. アプリケーションにアクセス

ブラウザで `http://localhost:5173` を開いてアプリケーションを使用できます。

---

## 環境変数の設定

### バックエンド (`backend/.env`)

```env
# MongoDB 接続設定
MONGODB_URL=mongodb://localhost:27017/notes
MONGODB_DATABASE=notes

# API 設定
API_HOST=0.0.0.0
API_PORT=8000

# CORS 設定
CORS_ORIGINS=http://localhost:5173

# ログレベル
LOG_LEVEL=INFO
```

### フロントエンド (`frontend/.env`)

```env
# バックエンド API の URL
VITE_API_BASE_URL=http://localhost:8000

# アプリケーション設定
VITE_APP_TITLE=Markdownノート管理
```

---

## 基本的な使い方

### 1. ノートの作成

1. アプリケーションを開く (`http://localhost:5173`)
2. 「新規作成」ボタンをクリック
3. タイトルを入力 (必須)
4. 本文を Markdown 形式で入力 (任意)
5. 「保存」ボタンをクリック

### 2. ノートの一覧表示

- トップページに既存のすべてのノートが表示されます
- 各ノートには、タイトル、作成日時、最終更新日時が表示されます

### 3. ノートの編集

1. 一覧からノートをクリック
2. タイトルまたは本文を編集
3. 「保存」ボタンをクリック

### 4. ノートの削除

1. ノートの詳細画面または一覧画面で「削除」ボタンをクリック
2. 確認ダイアログで「削除」を選択

### 5. WYSIWYG エディタの使用

1. ノート編集画面で「WYSIWYG モード」に切り替え
2. ツールバーのボタンを使用してテキストをフォーマット
3. 「Markdown モード」に戻すと、正しい Markdown 記法で表示される

### 6. リアルタイムプレビュー

- Markdown モードでノートを編集中、右側パネルにリアルタイムでプレビューが表示されます
- プレビューパネルは表示/非表示を切り替え可能

---

## 開発ワークフロー

### バックエンド開発

#### テストの実行

```bash
cd backend

# すべてのテストを実行
pytest

# カバレッジレポート付き
pytest --cov=src --cov-report=html

# 特定のテストファイルのみ実行
pytest tests/unit/test_note_service.py
```

#### リンターとフォーマッターの実行

```bash
# コードフォーマット (Black)
black src tests

# リンター (Ruff)
ruff check src tests

# 型チェック (mypy)
mypy src
```

#### API ドキュメントの確認

バックエンドが起動している状態で、以下の URL にアクセス：
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### フロントエンド開発

#### テストの実行

```bash
cd frontend

# ユニットテストを実行
npm run test

# E2E テストを実行
npm run test:e2e

# カバレッジレポート付き
npm run test:coverage
```

#### リンターとフォーマッターの実行

```bash
# リンター (ESLint)
npm run lint

# コードフォーマット (Prettier)
npm run format

# 型チェック (TypeScript)
npm run type-check
```

#### ビルドの実行

```bash
# 本番用ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

---

## トラブルシューティング

### MongoDB に接続できない

**エラー**: `MongoServerError: connect ECONNREFUSED`

**解決策**:
1. MongoDB が起動しているか確認: `mongosh`
2. `.env` ファイルの `MONGODB_URL` が正しいか確認
3. MongoDB のポート (デフォルト: 27017) がファイアウォールでブロックされていないか確認

### バックエンド API にアクセスできない

**エラー**: `Network Error` または `CORS error`

**解決策**:
1. バックエンドが起動しているか確認: `http://localhost:8000/health`
2. フロントエンドの `.env` ファイルで `VITE_API_BASE_URL` が正しいか確認
3. バックエンドの `.env` ファイルで `CORS_ORIGINS` にフロントエンドの URL が含まれているか確認

### フロントエンドが起動しない

**エラー**: `Cannot find module` または `ENOENT`

**解決策**:
1. 依存関係を再インストール: `rm -rf node_modules package-lock.json && npm install`
2. Node.js のバージョンが 18.x 以上であることを確認
3. キャッシュをクリア: `npm cache clean --force`

### ノートが保存されない

**原因**:
- タイトルが空白のみ
- 本文が 50,000 文字を超えている
- MongoDB への書き込み権限がない

**解決策**:
1. ブラウザの開発者ツールでネットワークタブを確認し、エラーレスポンスを確認
2. バックエンドのログを確認: `docker-compose logs backend` または `uvicorn` のコンソール出力

---

## 次のステップ

- [機能仕様書 (spec.md)](./spec.md) を読んで、詳細な要件を理解する
- [データモデル (data-model.md)](./data-model.md) を参照して、データ構造を理解する
- [API 契約 (contracts/openapi.yaml)](./contracts/openapi.yaml) を確認して、API 仕様を理解する
- [実装計画 (plan.md)](./plan.md) を参照して、アーキテクチャを理解する

---

## サポート

問題が発生した場合は、以下のリソースを参照してください：

- **GitHub Issues**: [https://github.com/your-org/markdown-note-manager/issues](https://github.com/your-org/markdown-note-manager/issues)
- **ドキュメント**: `specs/001-markdown-note-manager/` ディレクトリ内のすべてのドキュメント
- **チームに相談**: 開発チームに直接相談してください
