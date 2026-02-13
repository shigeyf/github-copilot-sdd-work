"""ノートサービス

ノート管理のビジネスロジック層。
"""

import structlog

from src.models.note import NoteListResponse, NoteResponse
from src.repositories.note_repository import NoteRepository

logger = structlog.get_logger(__name__)


class NoteService:
    """ノート管理のビジネスロジックを提供するサービス"""

    def __init__(self, repository: NoteRepository) -> None:
        """サービスを初期化する

        Args:
            repository: ノートリポジトリ
        """
        self._repository = repository

    async def list_notes(
        self,
        skip: int = 0,
        limit: int = 20,
        sort_by: str = "created_at",
        order: str = "desc",
    ) -> NoteListResponse:
        """ノート一覧を取得する

        Args:
            skip: スキップする件数
            limit: 取得する件数
            sort_by: ソート対象フィールド
            order: ソート順

        Returns:
            ノート一覧レスポンス
        """
        notes, total = await self._repository.list(
            skip=skip,
            limit=limit,
            sort_by=sort_by,
            order=order,
        )

        # NoteInDB を NoteResponse に変換
        note_responses = [
            NoteResponse(
                id=note.id,
                title=note.title,
                content=note.content,
                created_at=note.created_at,
                updated_at=note.updated_at,
            )
            for note in notes
        ]

        return NoteListResponse(
            notes=note_responses,
            total=total,
            skip=skip,
            limit=limit,
        )
