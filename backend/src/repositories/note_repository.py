"""ノートリポジトリ

MongoDB のノートコレクションに対するデータアクセス層。
"""

from __future__ import annotations

import re
import uuid
from datetime import UTC, datetime

import structlog
from motor.motor_asyncio import AsyncIOMotorCollection

from src.models.note import NoteInDB

logger = structlog.get_logger(__name__)


class NoteRepository:
    """ノートのデータアクセスを管理するリポジトリ"""

    def __init__(self, collection: AsyncIOMotorCollection) -> None:  # type: ignore[type-arg]
        """リポジトリを初期化する

        Args:
            collection: MongoDB ノートコレクション
        """
        self._collection = collection

    async def list(
        self,
        skip: int = 0,
        limit: int = 20,
        sort_by: str = "created_at",
        order: str = "desc",
    ) -> tuple[list[NoteInDB], int]:
        """ノート一覧を取得する

        Args:
            skip: スキップする件数
            limit: 取得する件数
            sort_by: ソート対象フィールド（created_at または updated_at）
            order: ソート順（asc または desc）

        Returns:
            ノートのリストと全件数のタプル
        """
        # ソート方向の変換
        sort_direction = -1 if order == "desc" else 1

        # 全件数を取得
        total = await self._collection.count_documents({})

        # ノート一覧を取得
        cursor = (
            self._collection.find()
            .sort(sort_by, sort_direction)
            .skip(skip)
            .limit(limit)
        )
        docs = await cursor.to_list(length=limit)

        # MongoDB ドキュメントを NoteInDB モデルに変換
        notes = [NoteInDB.from_mongo_dict(doc) for doc in docs]

        logger.info(
            "ノート一覧を取得しました",
            total=total,
            returned=len(notes),
            skip=skip,
            limit=limit,
        )

        return notes, total

    async def create(
        self,
        title: str,
        content: str = "",
    ) -> NoteInDB:
        """新しいノートを作成する

        Args:
            title: ノートのタイトル
            content: Markdown形式の本文

        Returns:
            作成されたノート
        """
        now = datetime.now(UTC)
        note = NoteInDB(
            id=str(uuid.uuid4()),
            title=title,
            content=content,
            created_at=now,
            updated_at=now,
        )

        await self._collection.insert_one(note.to_mongo_dict())

        logger.info("ノートを作成しました", note_id=note.id, title=title)

        return note

    async def find_by_title(self, title: str) -> list[NoteInDB]:
        """タイトルに一致するノートを検索する

        同名タイトルの重複チェックに使用する。
        タイトルの完全一致と番号付きバリエーション（例: "タイトル (2)"）を検索する。

        Args:
            title: 検索するタイトル

        Returns:
            一致するノートのリスト
        """
        escaped_title = re.escape(title)
        pattern = f"^{escaped_title}( \\(\\d+\\))?$"
        cursor = self._collection.find({"title": {"$regex": pattern}})
        docs = await cursor.to_list(length=None)

        return [NoteInDB.from_mongo_dict(doc) for doc in docs]
