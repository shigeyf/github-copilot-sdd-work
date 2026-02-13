"""ノートモデル定義

Pydantic モデルによるノートエンティティの型定義とバリデーション。
"""

import uuid
from datetime import UTC, datetime

from pydantic import BaseModel, Field, field_validator


class NoteBase(BaseModel):
    """ノートの基本スキーマ"""

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="ノートのタイトル",
        examples=["サンプルノート"],
    )
    content: str = Field(
        default="",
        max_length=50000,
        description="Markdown形式の本文",
        examples=["# 見出し\n\nこれはサンプルです。"],
    )

    @field_validator("title")
    @classmethod
    def validate_title_not_blank(cls, v: str) -> str:
        """タイトルが空白のみでないことを検証する"""
        if not v.strip():
            raise ValueError("タイトルは空白のみにできません")
        return v


class NoteCreate(NoteBase):
    """ノート作成リクエストスキーマ"""

    pass


class NoteUpdate(BaseModel):
    """ノート更新リクエストスキーマ"""

    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="ノートのタイトル（任意）",
    )
    content: str | None = Field(
        default=None,
        max_length=50000,
        description="Markdown形式の本文（任意）",
    )

    @field_validator("title")
    @classmethod
    def validate_title_not_blank(cls, v: str | None) -> str | None:
        """タイトルが空白のみでないことを検証する"""
        if v is not None and not v.strip():
            raise ValueError("タイトルは空白のみにできません")
        return v


class NoteResponse(NoteBase):
    """ノートレスポンススキーマ"""

    id: str = Field(
        ...,
        description="ノートの一意識別子 (UUID v4)",
        examples=["550e8400-e29b-41d4-a716-446655440000"],
    )
    created_at: datetime = Field(
        ...,
        description="作成日時 (ISO 8601形式)",
    )
    updated_at: datetime = Field(
        ...,
        description="最終更新日時 (ISO 8601形式)",
    )


class NoteListResponse(BaseModel):
    """ノート一覧レスポンススキーマ"""

    notes: list[NoteResponse] = Field(
        default_factory=list,
        description="ノートの配列",
    )
    total: int = Field(
        ...,
        description="全ノート数",
        examples=[42],
    )
    skip: int = Field(
        ...,
        description="スキップした件数",
        examples=[0],
    )
    limit: int = Field(
        ...,
        description="取得した件数",
        examples=[20],
    )


class NoteInDB(NoteBase):
    """MongoDB に保存されるノートのスキーマ"""

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="ノートの一意識別子 (UUID v4)",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="作成日時",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="最終更新日時",
    )

    def to_mongo_dict(self) -> dict[str, object]:
        """MongoDB ドキュメント形式に変換する"""
        return {
            "_id": self.id,
            "title": self.title,
            "content": self.content,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_mongo_dict(cls, doc: dict[str, object]) -> "NoteInDB":
        """MongoDB ドキュメントからインスタンスを作成する"""
        return cls(
            id=str(doc["_id"]),
            title=str(doc["title"]),
            content=str(doc.get("content", "")),
            created_at=doc["created_at"],  # type: ignore[arg-type]
            updated_at=doc["updated_at"],  # type: ignore[arg-type]
        )
