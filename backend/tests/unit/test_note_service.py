"""NoteService のユニットテスト

NoteService.list_notes() のテストを記述（ビジネスロジック）。
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from src.models.note import NoteInDB, NoteListResponse
from src.services.note_service import NoteService


@pytest.fixture
def mock_repository() -> MagicMock:
    """モック NoteRepository を提供する"""
    return MagicMock()


@pytest.fixture
def service(mock_repository: MagicMock) -> NoteService:
    """NoteService インスタンスを提供する"""
    return NoteService(repository=mock_repository)


@pytest.fixture
def sample_notes_in_db() -> list[NoteInDB]:
    """サンプルの NoteInDB インスタンスを提供する"""
    return [
        NoteInDB(
            id="550e8400-e29b-41d4-a716-446655440001",
            title="テストノート1",
            content="# テスト\n\n本文1",
            created_at=datetime(2026, 1, 1, 0, 0, 0, tzinfo=UTC),
            updated_at=datetime(2026, 1, 1, 12, 0, 0, tzinfo=UTC),
        ),
        NoteInDB(
            id="550e8400-e29b-41d4-a716-446655440002",
            title="テストノート2",
            content="# テスト\n\n本文2",
            created_at=datetime(2026, 1, 2, 0, 0, 0, tzinfo=UTC),
            updated_at=datetime(2026, 1, 2, 12, 0, 0, tzinfo=UTC),
        ),
    ]


class TestNoteServiceListNotes:
    """NoteService.list_notes() のテスト"""

    @pytest.mark.asyncio
    async def test_list_notes_returns_response(
        self,
        service: NoteService,
        mock_repository: MagicMock,
        sample_notes_in_db: list[NoteInDB],
    ) -> None:
        """ノート一覧を返すことを確認する"""
        mock_repository.list = AsyncMock(return_value=(sample_notes_in_db, 2))

        result = await service.list_notes()

        assert isinstance(result, NoteListResponse)
        assert result.total == 2
        assert len(result.notes) == 2
        assert result.notes[0].title == "テストノート1"
        assert result.notes[1].title == "テストノート2"

    @pytest.mark.asyncio
    async def test_list_notes_returns_empty_response(
        self,
        service: NoteService,
        mock_repository: MagicMock,
    ) -> None:
        """ノートが0件の場合、空レスポンスを返すことを確認する"""
        mock_repository.list = AsyncMock(return_value=([], 0))

        result = await service.list_notes()

        assert isinstance(result, NoteListResponse)
        assert result.total == 0
        assert len(result.notes) == 0

    @pytest.mark.asyncio
    async def test_list_notes_passes_pagination_params(
        self,
        service: NoteService,
        mock_repository: MagicMock,
        sample_notes_in_db: list[NoteInDB],
    ) -> None:
        """ページネーションパラメータがリポジトリに渡されることを確認する"""
        mock_repository.list = AsyncMock(return_value=(sample_notes_in_db[:1], 2))

        result = await service.list_notes(skip=1, limit=1)

        mock_repository.list.assert_called_once_with(
            skip=1,
            limit=1,
            sort_by="created_at",
            order="desc",
        )
        assert result.skip == 1
        assert result.limit == 1

    @pytest.mark.asyncio
    async def test_list_notes_passes_sort_params(
        self,
        service: NoteService,
        mock_repository: MagicMock,
        sample_notes_in_db: list[NoteInDB],
    ) -> None:
        """ソートパラメータがリポジトリに渡されることを確認する"""
        mock_repository.list = AsyncMock(return_value=(sample_notes_in_db, 2))

        await service.list_notes(sort_by="updated_at", order="asc")

        mock_repository.list.assert_called_once_with(
            skip=0,
            limit=20,
            sort_by="updated_at",
            order="asc",
        )

    @pytest.mark.asyncio
    async def test_list_notes_default_params(
        self,
        service: NoteService,
        mock_repository: MagicMock,
        sample_notes_in_db: list[NoteInDB],
    ) -> None:
        """デフォルトのパラメータでリポジトリが呼び出されることを確認する"""
        mock_repository.list = AsyncMock(return_value=(sample_notes_in_db, 2))

        result = await service.list_notes()

        mock_repository.list.assert_called_once_with(
            skip=0,
            limit=20,
            sort_by="created_at",
            order="desc",
        )
        assert result.skip == 0
        assert result.limit == 20
