"""ノート API エンドポイントの統合テスト

GET /notes エンドポイントのテスト
（200 レスポンス、空リスト、ページネーション、ソート）。
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient


@pytest.fixture
def sample_notes_docs() -> list[dict[str, object]]:
    """サンプルノート MongoDB ドキュメントを提供する"""
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


def _create_mock_collection(docs: list[dict[str, object]], total: int) -> MagicMock:
    """モック MongoDB コレクションを作成する"""
    collection = MagicMock()
    cursor = AsyncMock()
    cursor.to_list = AsyncMock(return_value=docs)
    chain = collection.find.return_value.sort.return_value
    chain.skip.return_value.limit.return_value = cursor
    collection.count_documents = AsyncMock(return_value=total)
    return collection


@pytest.fixture
async def notes_test_client(
    mock_database: MagicMock,
    mock_settings: MagicMock,
    sample_notes_docs: list[dict[str, object]],
) -> AsyncClient:
    """ノート API テスト用の FastAPI テストクライアントを提供する"""
    mock_collection = _create_mock_collection(sample_notes_docs, 3)
    mock_database.__getitem__ = MagicMock(return_value=mock_collection)

    with (
        patch("src.main.get_settings", return_value=mock_settings),
        patch("src.main.connect_to_mongodb", new_callable=AsyncMock),
        patch("src.main.close_mongodb_connection", new_callable=AsyncMock),
        patch("src.main.get_database", return_value=mock_database),
        patch("src.api.notes.get_database", return_value=mock_database),
    ):
        from src.main import create_app

        app = create_app()
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            yield client


class TestGetNotes:
    """GET /notes エンドポイントのテスト"""

    @pytest.mark.asyncio
    async def test_get_notes_returns_200(
        self,
        notes_test_client: AsyncClient,
    ) -> None:
        """GET /notes が 200 を返すことを確認する"""
        response = await notes_test_client.get("/notes")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_get_notes_returns_note_list(
        self,
        notes_test_client: AsyncClient,
    ) -> None:
        """GET /notes がノートの一覧を返すことを確認する"""
        response = await notes_test_client.get("/notes")
        data = response.json()

        assert "notes" in data
        assert "total" in data
        assert "skip" in data
        assert "limit" in data
        assert data["total"] == 3
        assert len(data["notes"]) == 3

    @pytest.mark.asyncio
    async def test_get_notes_returns_note_fields(
        self,
        notes_test_client: AsyncClient,
    ) -> None:
        """GET /notes が各ノートのフィールドを正しく返すことを確認する"""
        response = await notes_test_client.get("/notes")
        data = response.json()

        note = data["notes"][0]
        assert "id" in note
        assert "title" in note
        assert "content" in note
        assert "created_at" in note
        assert "updated_at" in note


class TestGetNotesEmpty:
    """GET /notes 空リストのテスト"""

    @pytest.mark.asyncio
    async def test_get_notes_returns_empty_list(
        self,
        mock_database: MagicMock,
        mock_settings: MagicMock,
    ) -> None:
        """ノートが0件の場合、空リストを返すことを確認する"""
        mock_collection = _create_mock_collection([], 0)
        mock_database.__getitem__ = MagicMock(return_value=mock_collection)

        with (
            patch("src.main.get_settings", return_value=mock_settings),
            patch("src.main.connect_to_mongodb", new_callable=AsyncMock),
            patch("src.main.close_mongodb_connection", new_callable=AsyncMock),
            patch("src.main.get_database", return_value=mock_database),
            patch("src.api.notes.get_database", return_value=mock_database),
        ):
            from src.main import create_app

            app = create_app()
            transport = ASGITransport(app=app)
            async with AsyncClient(
                transport=transport, base_url="http://test"
            ) as client:
                response = await client.get("/notes")

            data = response.json()
            assert response.status_code == 200
            assert data["total"] == 0
            assert data["notes"] == []


class TestGetNotesPagination:
    """GET /notes ページネーションのテスト"""

    @pytest.mark.asyncio
    async def test_get_notes_with_skip_and_limit(
        self,
        notes_test_client: AsyncClient,
    ) -> None:
        """skip と limit パラメータが受け付けられることを確認する"""
        response = await notes_test_client.get("/notes?skip=1&limit=2")
        assert response.status_code == 200


class TestGetNotesSort:
    """GET /notes ソートのテスト"""

    @pytest.mark.asyncio
    async def test_get_notes_with_sort_params(
        self,
        notes_test_client: AsyncClient,
    ) -> None:
        """sort_by と order パラメータが受け付けられることを確認する"""
        response = await notes_test_client.get("/notes?sort_by=updated_at&order=asc")
        assert response.status_code == 200
