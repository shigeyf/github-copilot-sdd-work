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
        mock_collection.find.return_value.sort.return_value.skip.return_value.limit.assert_called_with(1)

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


class TestNoteRepositoryCreate:
    """NoteRepository.create() のテスト"""

    @pytest.mark.asyncio
    async def test_create_inserts_document(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
    ) -> None:
        """ノートが MongoDB に挿入されることを確認する"""
        mock_collection.insert_one = AsyncMock()

        note = await repository.create(title="新しいノート", content="# テスト")

        mock_collection.insert_one.assert_called_once()
        assert note.title == "新しいノート"
        assert note.content == "# テスト"

    @pytest.mark.asyncio
    async def test_create_generates_uuid_v4(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
    ) -> None:
        """UUID v4 が自動生成されることを確認する"""
        import uuid

        mock_collection.insert_one = AsyncMock()

        note = await repository.create(title="テスト", content="")

        # UUID v4 形式であることを検証
        parsed = uuid.UUID(note.id)
        assert parsed.version == 4

    @pytest.mark.asyncio
    async def test_create_sets_timestamps(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
    ) -> None:
        """created_at と updated_at が自動設定されることを確認する"""
        mock_collection.insert_one = AsyncMock()

        note = await repository.create(title="テスト", content="")

        assert note.created_at is not None
        assert note.updated_at is not None
        assert note.created_at == note.updated_at

    @pytest.mark.asyncio
    async def test_create_with_empty_content(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
    ) -> None:
        """本文が空でもノートを作成できることを確認する"""
        mock_collection.insert_one = AsyncMock()

        note = await repository.create(title="タイトルのみ")

        assert note.title == "タイトルのみ"
        assert note.content == ""

    @pytest.mark.asyncio
    async def test_create_find_by_title(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
    ) -> None:
        """タイトルで既存ノートを検索できることを確認する"""
        cursor = AsyncMock()
        cursor.to_list = AsyncMock(return_value=[])
        mock_collection.find.return_value = cursor

        result = await repository.find_by_title("テスト")

        assert result == []


class TestNoteRepositoryGetById:
    """NoteRepository.get_by_id() のテスト"""

    @pytest.mark.asyncio
    async def test_get_by_id_returns_note(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
        sample_notes: list[dict[str, object]],
    ) -> None:
        """指定した ID のノートを取得できることを確認する"""
        mock_collection.find_one = AsyncMock(return_value=sample_notes[0])

        note = await repository.get_by_id("550e8400-e29b-41d4-a716-446655440001")

        assert note is not None
        assert note.id == "550e8400-e29b-41d4-a716-446655440001"
        assert note.title == "テストノート1"
        mock_collection.find_one.assert_called_once_with({"_id": "550e8400-e29b-41d4-a716-446655440001"})

    @pytest.mark.asyncio
    async def test_get_by_id_returns_none_when_not_found(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
    ) -> None:
        """存在しない ID の場合 None を返すことを確認する"""
        mock_collection.find_one = AsyncMock(return_value=None)

        note = await repository.get_by_id("non-existent-id")

        assert note is None


class TestNoteRepositoryUpdate:
    """NoteRepository.update() のテスト"""

    @pytest.mark.asyncio
    async def test_update_modifies_document(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
        sample_notes: list[dict[str, object]],
    ) -> None:
        """ノートの更新が MongoDB に反映されることを確認する"""
        updated_doc = {**sample_notes[0], "title": "更新後タイトル"}
        mock_collection.find_one_and_update = AsyncMock(return_value=updated_doc)

        note = await repository.update(
            "550e8400-e29b-41d4-a716-446655440001",
            title="更新後タイトル",
        )

        assert note is not None
        assert note.title == "更新後タイトル"
        mock_collection.find_one_and_update.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_sets_updated_at(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
        sample_notes: list[dict[str, object]],
    ) -> None:
        """updated_at が自動更新されることを確認する"""
        updated_doc = {**sample_notes[0], "content": "更新後本文"}
        mock_collection.find_one_and_update = AsyncMock(return_value=updated_doc)

        note = await repository.update(
            "550e8400-e29b-41d4-a716-446655440001",
            content="更新後本文",
        )

        assert note is not None
        # find_one_and_update の呼び出し引数を検証
        call_args = mock_collection.find_one_and_update.call_args
        update_data = call_args[0][1]["$set"]
        assert "updated_at" in update_data

    @pytest.mark.asyncio
    async def test_update_returns_none_when_not_found(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
    ) -> None:
        """存在しない ID の場合 None を返すことを確認する"""
        mock_collection.find_one_and_update = AsyncMock(return_value=None)

        note = await repository.update("non-existent-id", title="更新")

        assert note is None

    @pytest.mark.asyncio
    async def test_update_partial_title_only(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
        sample_notes: list[dict[str, object]],
    ) -> None:
        """タイトルのみの部分更新ができることを確認する"""
        updated_doc = {**sample_notes[0], "title": "新タイトル"}
        mock_collection.find_one_and_update = AsyncMock(return_value=updated_doc)

        note = await repository.update(
            "550e8400-e29b-41d4-a716-446655440001",
            title="新タイトル",
        )

        assert note is not None
        assert note.title == "新タイトル"
        call_args = mock_collection.find_one_and_update.call_args
        update_data = call_args[0][1]["$set"]
        assert "title" in update_data
        assert "content" not in update_data

    @pytest.mark.asyncio
    async def test_update_partial_content_only(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
        sample_notes: list[dict[str, object]],
    ) -> None:
        """本文のみの部分更新ができることを確認する"""
        updated_doc = {**sample_notes[0], "content": "新しい本文"}
        mock_collection.find_one_and_update = AsyncMock(return_value=updated_doc)

        note = await repository.update(
            "550e8400-e29b-41d4-a716-446655440001",
            content="新しい本文",
        )

        assert note is not None
        call_args = mock_collection.find_one_and_update.call_args
        update_data = call_args[0][1]["$set"]
        assert "content" in update_data
        assert "title" not in update_data


class TestNoteRepositoryDelete:
    """NoteRepository.delete() のテスト"""

    @pytest.mark.asyncio
    async def test_delete_returns_true_when_found(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
    ) -> None:
        """存在するノートを削除した場合 True を返すことを確認する"""
        mock_collection.delete_one = AsyncMock(return_value=MagicMock(deleted_count=1))

        result = await repository.delete("550e8400-e29b-41d4-a716-446655440001")

        assert result is True
        mock_collection.delete_one.assert_called_once_with({"_id": "550e8400-e29b-41d4-a716-446655440001"})

    @pytest.mark.asyncio
    async def test_delete_returns_false_when_not_found(
        self,
        repository: NoteRepository,
        mock_collection: MagicMock,
    ) -> None:
        """存在しないノートを削除した場合 False を返すことを確認する"""
        mock_collection.delete_one = AsyncMock(return_value=MagicMock(deleted_count=0))

        result = await repository.delete("non-existent-id")

        assert result is False
