"""NoteRepository のユニットテスト

NoteRepository.list() のテストを記述（MongoDB クエリ、ページネーション）。
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from src.repositories.note_repository import NoteRepository


@pytest.fixture
def mock_collection() -> MagicMock:
    """モック MongoDB コレクションを提供する"""
    collection = MagicMock()
    return collection


@pytest.fixture
def repository(mock_collection: MagicMock) -> NoteRepository:
    """NoteRepository インスタンスを提供する"""
    return NoteRepository(collection=mock_collection)


@pytest.fixture
def sample_notes() -> list[dict[str, object]]:
    """サンプルノートドキュメントを提供する"""
    return [
        {
            "_id": "550e8400-e29b-41d4-a716-446655440001",
            "title": "テストノート1",
            "content": "# テスト\n\n本文1",
            "created_at": datetime(2026, 1, 1, 0, 0, 0, tzinfo=UTC),
            "updated_at": datetime(2026, 1, 1, 12, 0, 0, tzinfo=UTC),
        },
        {
            "_id": "550e8400-e29b-41d4-a716-446655440002",
            "title": "テストノート2",
            "content": "# テスト\n\n本文2",
            "created_at": datetime(2026, 1, 2, 0, 0, 0, tzinfo=UTC),
            "updated_at": datetime(2026, 1, 2, 12, 0, 0, tzinfo=UTC),
        },
        {
            "_id": "550e8400-e29b-41d4-a716-446655440003",
            "title": "テストノート3",
            "content": "# テスト\n\n本文3",
            "created_at": datetime(2026, 1, 3, 0, 0, 0, tzinfo=UTC),
            "updated_at": datetime(2026, 1, 3, 12, 0, 0, tzinfo=UTC),
        },
    ]


class TestNoteRepositoryList:
    """NoteRepository.list() のテスト"""

    @pytest.mark.asyncio
    async def test_list_returns_all_notes(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
        sample_notes: list[dict[str, object]],
    ) -> None:
        """ノート一覧を取得できることを確認する"""
        # MongoDB カーソルのモック
        cursor = AsyncMock()
        cursor.to_list = AsyncMock(return_value=sample_notes)
        chain = mock_collection.find.return_value.sort.return_value
        chain.skip.return_value.limit.return_value = cursor
        mock_collection.count_documents = AsyncMock(return_value=3)

        notes, total = await repository.list()

        assert total == 3
        assert len(notes) == 3
        assert notes[0].title == "テストノート1"
        assert notes[1].title == "テストノート2"
        assert notes[2].title == "テストノート3"

    @pytest.mark.asyncio
    async def test_list_returns_empty_list(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
    ) -> None:
        """ノートが0件の場合、空リストを返すことを確認する"""
        cursor = AsyncMock()
        cursor.to_list = AsyncMock(return_value=[])
        chain = mock_collection.find.return_value.sort.return_value
        chain.skip.return_value.limit.return_value = cursor
        mock_collection.count_documents = AsyncMock(return_value=0)

        notes, total = await repository.list()

        assert total == 0
        assert len(notes) == 0

    @pytest.mark.asyncio
    async def test_list_with_pagination(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
        sample_notes: list[dict[str, object]],
    ) -> None:
        """ページネーションが正しく動作することを確認する"""
        cursor = AsyncMock()
        cursor.to_list = AsyncMock(return_value=[sample_notes[1]])
        chain = mock_collection.find.return_value.sort.return_value
        chain.skip.return_value.limit.return_value = cursor
        mock_collection.count_documents = AsyncMock(return_value=3)

        notes, total = await repository.list(skip=1, limit=1)

        assert total == 3
        assert len(notes) == 1
        assert notes[0].title == "テストノート2"
        mock_collection.find.return_value.sort.return_value.skip.assert_called_with(1)
        mock_collection.find.return_value.sort.return_value.skip.return_value.limit.assert_called_with(
            1
        )

    @pytest.mark.asyncio
    async def test_list_with_sort_by_created_at_desc(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
        sample_notes: list[dict[str, object]],
    ) -> None:
        """作成日時の降順でソートされることを確認する"""
        cursor = AsyncMock()
        cursor.to_list = AsyncMock(return_value=list(reversed(sample_notes)))
        chain = mock_collection.find.return_value.sort.return_value
        chain.skip.return_value.limit.return_value = cursor
        mock_collection.count_documents = AsyncMock(return_value=3)

        notes, total = await repository.list(sort_by="created_at", order="desc")

        assert total == 3
        mock_collection.find.return_value.sort.assert_called_with("created_at", -1)

    @pytest.mark.asyncio
    async def test_list_with_sort_by_updated_at_asc(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
        sample_notes: list[dict[str, object]],
    ) -> None:
        """更新日時の昇順でソートされることを確認する"""
        cursor = AsyncMock()
        cursor.to_list = AsyncMock(return_value=sample_notes)
        chain = mock_collection.find.return_value.sort.return_value
        chain.skip.return_value.limit.return_value = cursor
        mock_collection.count_documents = AsyncMock(return_value=3)

        notes, total = await repository.list(sort_by="updated_at", order="asc")

        assert total == 3
        mock_collection.find.return_value.sort.assert_called_with("updated_at", 1)
