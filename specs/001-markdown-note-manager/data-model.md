---

description: "Markdownノート管理アプリのデータモデル定義"

---

# データモデル: Markdownノート管理アプリ

**日付**: 2026-02-12 | **計画書**: [plan.md](./plan.md) | **仕様書**: [spec.md](./spec.md)

このドキュメントは、アプリケーションで使用するデータモデル、エンティティ、関係性、バリデーションルールを定義します。

## エンティティ概要

このアプリケーションで管理する主要なエンティティは **Note (ノート)** のみです。ノート間に直接的な関係性はなく、シンプルなフラット構造を採用しています。

## エンティティ定義

### Note (ノート)

Markdown 形式のノートを表現するエンティティ。

#### フィールド定義

| フィールド名 | 型          | 必須 | 説明                                      | バリデーション                           |
| ------------ | ----------- | ---- | ----------------------------------------- | ---------------------------------------- |
| `id`         | `string`    | ✅   | ノートの一意識別子 (UUID v4)              | UUID v4 形式、自動生成                   |
| `title`      | `string`    | ✅   | ノートのタイトル                          | 1〜200文字、空白のみは不可               |
| `content`    | `string`    | ❌   | Markdown 形式の本文                       | 0〜50,000文字、空文字列許可              |
| `created_at` | `datetime`  | ✅   | ノートの作成日時 (ISO 8601 形式)          | 自動生成 (サーバー側で設定)              |
| `updated_at` | `datetime`  | ✅   | ノートの最終更新日時 (ISO 8601 形式)      | 自動更新 (保存時にサーバー側で更新)      |

#### バリデーションルール

1. **ID の一意性**:
   - 各ノートの `id` は UUID v4 形式で一意である必要がある
   - 作成時にサーバー側で自動生成
   - クライアントからの ID 指定は受け付けない

2. **タイトルの必須性と長さ**:
   - タイトルは必須フィールド
   - 1文字以上、200文字以下
   - 空白文字のみのタイトルは許可しない (trim 後に空文字列になる場合はエラー)

3. **本文の長さ制限**:
   - 本文は任意フィールド (空文字列を許可)
   - 最大 50,000 文字まで
   - 制限を超える場合はエラーを返す

4. **日時の自動管理**:
   - `created_at`: ノート作成時にサーバー側で自動設定 (UTC)
   - `updated_at`: ノート作成時に `created_at` と同じ値を設定、編集時に自動更新 (UTC)
   - クライアントからの日時指定は受け付けない

5. **同名タイトルの処理**:
   - 同じタイトルのノートが既に存在する場合、自動的に番号を付加 (例: `ノート (2)`)
   - 番号は既存のノート数に基づいて増加

#### エンティティの状態遷移

ノートは以下の状態を持ちます：

```text
[新規作成] → [保存済み] → [編集中] → [保存済み]
                  ↓
              [削除済み]
```

1. **新規作成**: ユーザーが「新規作成」ボタンをクリックした時点で、フロントエンド上に一時的な空ノートが作成される
2. **保存済み**: ユーザーが「保存」ボタンをクリックし、MongoDB に永続化された状態
3. **編集中**: ユーザーが既存のノートを編集している状態 (フロントエンド上でのみ管理)
4. **削除済み**: ユーザーが削除を確認し、MongoDB から完全に削除された状態 (エンティティとしては存在しない)

## データベーススキーマ (MongoDB)

### コレクション: `notes`

MongoDB ドキュメントとして保存される Note エンティティのスキーマ。

```json
{
  "_id": "string (UUID v4)",
  "title": "string",
  "content": "string",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

#### インデックス

1. **プライマリキー**: `_id` (UUID v4 形式の文字列)
   - MongoDB のデフォルトインデックス
   - ユニークインデックスとして自動的に管理される

2. **作成日時インデックス**: `created_at` (降順)
   - ノート一覧を作成日時でソートする際のパフォーマンス向上
   - クエリ: `db.notes.find().sort({ created_at: -1 })`

3. **更新日時インデックス**: `updated_at` (降順)
   - ノート一覧を更新日時でソートする際のパフォーマンス向上
   - クエリ: `db.notes.find().sort({ updated_at: -1 })`

4. **タイトル検索インデックス** (将来的な実装):
   - 全文検索機能を実装する場合に追加
   - MongoDB のテキストインデックスを使用

#### MongoDB スキーマ検証 (オプション)

MongoDB 側でスキーマ検証を有効化する場合の設定:

```javascript
db.createCollection("notes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "title", "created_at", "updated_at"],
      properties: {
        _id: {
          bsonType: "string",
          pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
          description: "UUID v4 形式の文字列"
        },
        title: {
          bsonType: "string",
          minLength: 1,
          maxLength: 200,
          description: "ノートのタイトル (1〜200文字)"
        },
        content: {
          bsonType: "string",
          maxLength: 50000,
          description: "Markdown 形式の本文 (0〜50,000文字)"
        },
        created_at: {
          bsonType: "date",
          description: "作成日時 (ISO 8601 形式)"
        },
        updated_at: {
          bsonType: "date",
          description: "最終更新日時 (ISO 8601 形式)"
        }
      }
    }
  }
})
```

## TypeScript 型定義 (フロントエンド)

```typescript
/**
 * Note エンティティの型定義
 */
export interface Note {
  /** ノートの一意識別子 (UUID v4) */
  id: string;

  /** ノートのタイトル */
  title: string;

  /** Markdown 形式の本文 */
  content: string;

  /** 作成日時 (ISO 8601 文字列) */
  created_at: string;

  /** 最終更新日時 (ISO 8601 文字列) */
  updated_at: string;
}

/**
 * ノート作成時のリクエスト型
 */
export interface CreateNoteRequest {
  /** ノートのタイトル */
  title: string;

  /** Markdown 形式の本文 (任意) */
  content?: string;
}

/**
 * ノート更新時のリクエスト型
 */
export interface UpdateNoteRequest {
  /** ノートのタイトル (任意) */
  title?: string;

  /** Markdown 形式の本文 (任意) */
  content?: string;
}

/**
 * ノート一覧取得時のクエリパラメータ型
 */
export interface ListNotesParams {
  /** ソート順 (created_at または updated_at) */
  sort_by?: 'created_at' | 'updated_at';

  /** ソート方向 (asc または desc) */
  order?: 'asc' | 'desc';

  /** ページネーション: スキップする件数 */
  skip?: number;

  /** ページネーション: 取得する件数 */
  limit?: number;
}
```

## Pydantic モデル (バックエンド)

```python
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
import uuid

class NoteBase(BaseModel):
    """ノートの基本スキーマ"""
    title: str = Field(..., min_length=1, max_length=200, description="ノートのタイトル")
    content: str = Field(default="", max_length=50000, description="Markdown 形式の本文")

    @field_validator("title")
    @classmethod
    def validate_title_not_empty(cls, v: str) -> str:
        """タイトルが空白のみでないことを検証"""
        if not v.strip():
            raise ValueError("タイトルは空白のみにできません")
        return v.strip()

class NoteCreate(NoteBase):
    """ノート作成時のリクエストスキーマ"""
    pass

class NoteUpdate(BaseModel):
    """ノート更新時のリクエストスキーマ"""
    title: str | None = Field(None, min_length=1, max_length=200, description="ノートのタイトル")
    content: str | None = Field(None, max_length=50000, description="Markdown 形式の本文")

    @field_validator("title")
    @classmethod
    def validate_title_not_empty(cls, v: str | None) -> str | None:
        """タイトルが指定されている場合、空白のみでないことを検証"""
        if v is not None and not v.strip():
            raise ValueError("タイトルは空白のみにできません")
        return v.strip() if v is not None else None

class Note(NoteBase):
    """ノートのレスポンススキーマ"""
    id: str = Field(..., description="ノートの UUID v4")
    created_at: datetime = Field(..., description="作成日時")
    updated_at: datetime = Field(..., description="最終更新日時")

    class Config:
        from_attributes = True  # Pydantic v2
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "サンプルノート",
                "content": "# 見出し\n\nこれはサンプルのMarkdownノートです。",
                "created_at": "2026-02-12T10:00:00Z",
                "updated_at": "2026-02-12T10:30:00Z"
            }
        }
```

## エッジケースとエラーハンドリング

### 1. 空のタイトルでの保存試行

**シナリオ**: ユーザーがタイトルを空白のみ、または空文字列で保存しようとした場合

**処理**:

- バックエンドの Pydantic バリデーションで検出
- HTTP 422 (Unprocessable Entity) を返す
- エラーメッセージ: `{"detail": [{"loc": ["body", "title"], "msg": "タイトルは空白のみにできません", "type": "value_error"}]}`

**フロントエンド対応**:

- 保存ボタンをクリック前にクライアント側でもバリデーション
- エラーメッセージをユーザーに表示

### 2. 本文が 50,000 文字を超える場合

**シナリオ**: ユーザーが非常に長いノートを作成しようとした場合

**処理**:

- バックエンドの Pydantic バリデーションで検出
- HTTP 422 (Unprocessable Entity) を返す
- エラーメッセージ: `{"detail": [{"loc": ["body", "content"], "msg": "本文は50,000文字以内にしてください", "type": "value_error"}]}`

**フロントエンド対応**:

- 編集中に文字数カウンターを表示
- 50,000 文字に達したら警告を表示

### 3. 同じタイトルのノートが既に存在する場合

**シナリオ**: ユーザーが既存のノートと同じタイトルで新規ノートを作成しようとした場合

**処理**:

- バックエンドで既存のタイトルをチェック
- 自動的に番号を付加 (例: `ノート` → `ノート (2)`)
- 番号は既存の最大番号 + 1

**実装例**:

```python
async def generate_unique_title(title: str, db) -> str:
    """同じタイトルが存在する場合、番号を付加"""
    existing_notes = await db.notes.find({"title": {"$regex": f"^{title}( \\(\\d+\\))?$"}}).to_list(None)
    if not existing_notes:
        return title

    max_number = 0
    for note in existing_notes:
        if match := re.match(r"^.+ \((\d+)\)$", note["title"]):
            max_number = max(max_number, int(match.group(1)))

    return f"{title} ({max_number + 1})"
```

### 4. 存在しない ID でノートを取得/更新/削除しようとした場合

**シナリオ**: ユーザーが既に削除されたノート、または無効な ID を指定した場合

**処理**:

- バックエンドで MongoDB に該当ノートが存在するかチェック
- 存在しない場合、HTTP 404 (Not Found) を返す
- エラーメッセージ: `{"detail": "ノートが見つかりません"}`

### 5. MongoDB 接続エラー

**シナリオ**: MongoDB が起動していない、またはネットワークエラーが発生した場合

**処理**:

- バックエンドの起動時に MongoDB への接続を確認
- 接続できない場合、アプリケーションを起動しない (またはヘルスチェックで異常を報告)
- リクエスト中に接続エラーが発生した場合、HTTP 503 (Service Unavailable) を返す

## 将来的な拡張

以下の機能は現時点ではスコープ外ですが、将来的に検討する可能性があります：

1. **タグ機能**: ノートにタグを付けて分類
   - `tags: string[]` フィールドを追加
   - タグによるフィルタリング機能

2. **カテゴリ/フォルダ機能**: ノートを階層的に整理
   - `category_id: string` フィールドを追加
   - Category エンティティの追加

3. **全文検索機能**: ノートのタイトルと本文を検索
   - MongoDB のテキストインデックスを使用
   - 検索 API エンドポイントの追加

4. **バージョン履歴**: ノートの編集履歴を保存
   - NoteVersion エンティティの追加
   - タイムマシン機能

5. **共有機能**: ノートを他のユーザーと共有
   - User エンティティの追加
   - 認証・認可機能の実装

---

**次のステップ**: API 契約を定義する `contracts/openapi.yaml` を作成します。
