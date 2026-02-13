"""ノートサービス

ノート管理のビジネスロジック層。
"""

import re

import structlog

from src.models.note import NoteCreate, NoteListResponse, NoteResponse, NoteUpdate
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

    async def create_note(self, note_data: NoteCreate) -> NoteResponse:
        """新しいノートを作成する

        同名タイトルが存在する場合、自動的に番号を付加する（FR-019）。

        Args:
            note_data: ノート作成リクエストデータ

        Returns:
            作成されたノートのレスポンス
        """
        # 同名タイトルの重複チェック
        unique_title = await self._generate_unique_title(note_data.title)

        # リポジトリを呼び出してノートを作成
        note = await self._repository.create(
            title=unique_title,
            content=note_data.content,
        )

        logger.info("ノートを作成しました", note_id=note.id, title=unique_title)

        return NoteResponse(
            id=note.id,
            title=note.title,
            content=note.content,
            created_at=note.created_at,
            updated_at=note.updated_at,
        )

    async def _generate_unique_title(self, title: str) -> str:
        """同じタイトルが存在する場合、番号を付加してユニークなタイトルを生成する

        Args:
            title: 元のタイトル

        Returns:
            ユニークなタイトル
        """
        existing_notes = await self._repository.find_by_title(title)

        if not existing_notes:
            return title

        # 既存ノートから最大の番号を取得
        max_number = 1  # 元のタイトルが存在する場合、最低1
        for note in existing_notes:
            match = re.match(r"^.+ \((\d+)\)$", note.title)
            if match:
                max_number = max(max_number, int(match.group(1)))

        return f"{title} ({max_number + 1})"

    async def get_note(self, note_id: str) -> NoteResponse:
        """指定した ID のノートを取得する

        Args:
            note_id: ノートの一意識別子

        Returns:
            ノートのレスポンス

        Raises:
            ValueError: ノートが見つからない場合
        """
        note = await self._repository.get_by_id(note_id)

        if note is None:
            raise ValueError("ノートが見つかりません")

        logger.info("ノートを取得しました", note_id=note_id)

        return NoteResponse(
            id=note.id,
            title=note.title,
            content=note.content,
            created_at=note.created_at,
            updated_at=note.updated_at,
        )

    async def update_note(self, note_id: str, note_data: NoteUpdate) -> NoteResponse:
        """既存のノートを更新する

        部分更新に対応し、指定されたフィールドのみを更新する。

        Args:
            note_id: ノートの一意識別子
            note_data: ノート更新リクエストデータ

        Returns:
            更新されたノートのレスポンス

        Raises:
            ValueError: ノートが見つからない場合
        """
        note = await self._repository.update(
            note_id,
            title=note_data.title,
            content=note_data.content,
        )

        if note is None:
            raise ValueError("ノートが見つかりません")

        logger.info("ノートを更新しました", note_id=note_id)

        return NoteResponse(
            id=note.id,
            title=note.title,
            content=note.content,
            created_at=note.created_at,
            updated_at=note.updated_at,
        )
