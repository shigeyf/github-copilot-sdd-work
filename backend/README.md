# Markdownノート管理アプリ - バックエンド

FastAPI を使用した Markdownノート管理アプリのバックエンド API です。

## 技術スタック

- **フレームワーク**: FastAPI
- **言語**: Python 3.11+
- **データベース**: MongoDB (motor ドライバー)
- **バリデーション**: Pydantic v2
- **ロギング**: structlog

## セットアップ

### 前提条件

- Python 3.11 以上
- MongoDB 7.x 以上

### インストール

```bash
# 仮想環境の作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係のインストール
pip install -e ".[dev]"

# 環境変数の設定
cp .env.example .env
```

### 開発サーバーの起動

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

API ドキュメント: `http://localhost:8000/docs`

## テスト

```bash
# すべてのテストを実行
pytest

# カバレッジレポート付き
pytest --cov=src --cov-report=html
```

## リンティング

```bash
# コードフォーマット
black src tests

# リンター
ruff check src tests

# 型チェック
mypy src
```

## プロジェクト構造

```text
backend/
├── src/
│   ├── main.py              # FastAPI エントリーポイント
│   ├── config.py            # 設定管理
│   ├── models/              # Pydantic モデル
│   ├── repositories/        # データアクセス層
│   ├── services/            # ビジネスロジック層
│   ├── api/                 # API エンドポイント
│   └── utils/               # ユーティリティ
├── tests/                   # テストファイル
├── pyproject.toml           # プロジェクト設定
└── .env.example             # 環境変数サンプル
```
