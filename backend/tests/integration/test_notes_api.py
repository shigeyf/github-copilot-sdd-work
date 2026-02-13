"""ノート API エンドポイントの統合テスト

GET /notes と POST /notes エンドポイントのテスト。
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


def _create_mock_collection_for_create(
    existing_docs: list[dict[str, object]] | None = None,
) -> MagicMock:
    """POST /notes テスト用のモック MongoDB コレクションを作成する"""
    collection = MagicMock()
    collection.insert_one = AsyncMock()

    # find_by_title 用のモック（重複チェック）
    cursor = AsyncMock()
    cursor.to_list = AsyncMock(return_value=existing_docs or [])
    collection.find.return_value = cursor

    # list 用のモック（GET /notes で使われる場合）
    list_cursor = AsyncMock()
    list_cursor.to_list = AsyncMock(return_value=[])
    list_chain = collection.find.return_value.sort.return_value
    list_chain.skip.return_value.limit.return_value = list_cursor
    collection.count_documents = AsyncMock(return_value=0)

    return collection


class TestPostNotes:
    """POST /notes エンドポイントのテスト"""

    @pytest.mark.asyncio
    async def test_post_notes_returns_201(
        self,
        mock_database: MagicMock,
        mock_settings: MagicMock,
    ) -> None:
        """POST /notes が 201 を返すことを確認する"""
        mock_collection = _create_mock_collection_for_create()
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
                response = await client.post(
                    "/notes",
                    json={"title": "新しいノート", "content": "# テスト"},
                )

            assert response.status_code == 201

    @pytest.mark.asyncio
    async def test_post_notes_returns_note_with_uuid(
        self,
        mock_database: MagicMock,
        mock_settings: MagicMock,
    ) -> None:
        """POST /notes が UUID v4 を含むノートを返すことを確認する"""
        import uuid

        mock_collection = _create_mock_collection_for_create()
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
                response = await client.post(
                    "/notes",
                    json={"title": "テスト", "content": ""},
                )

            data = response.json()
            assert "id" in data
            # UUID v4 形式であることを検証
            parsed = uuid.UUID(data["id"])
            assert parsed.version == 4

    @pytest.mark.asyncio
    async def test_post_notes_returns_note_fields(
        self,
        mock_database: MagicMock,
        mock_settings: MagicMock,
    ) -> None:
        """POST /notes が全フィールドを含むノートを返すことを確認する"""
        mock_collection = _create_mock_collection_for_create()
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
                response = await client.post(
                    "/notes",
                    json={"title": "テスト", "content": "# 本文"},
                )

            data = response.json()
            assert data["title"] == "テスト"
            assert data["content"] == "# 本文"
            assert "created_at" in data
            assert "updated_at" in data

    @pytest.mark.asyncio
    async def test_post_notes_validation_error_empty_title(
        self,
        mock_database: MagicMock,
        mock_settings: MagicMock,
    ) -> None:
        """タイトルが空の場合、422 を返すことを確認する"""
        mock_collection = _create_mock_collection_for_create()
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
                response = await client.post(
                    "/notes",
                    json={"title": "", "content": ""},
                )

            assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_post_notes_validation_error_blank_title(
        self,
        mock_database: MagicMock,
        mock_settings: MagicMock,
    ) -> None:
        """タイトルが空白のみの場合、422 を返すことを確認する"""
        mock_collection = _create_mock_collection_for_create()
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
                response = await client.post(
                    "/notes",
                    json={"title": "   ", "content": ""},
                )

            assert response.status_code == 422


class TestPostNotesDuplicateTitle:
    """POST /notes 重複タイトル処理のテスト (FR-019)"""

    @pytest.mark.asyncio
    async def test_post_notes_duplicate_title_appends_number(
        self,
        mock_database: MagicMock,
        mock_settings: MagicMock,
    ) -> None:
        """同名タイトルが存在する場合、番号が付加されることを確認する"""
        existing_docs = [
            {
                "_id": "existing-1",
                "title": "テスト",
                "content": "",
                "created_at": datetime(2026, 1, 1, 0, 0, 0, tzinfo=UTC),
                "updated_at": datetime(2026, 1, 1, 0, 0, 0, tzinfo=UTC),
            }
        ]
        mock_collection = _create_mock_collection_for_create(existing_docs)
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
                response = await client.post(
                    "/notes",
                    json={"title": "テスト", "content": ""},
                )

            data = response.json()
            assert response.status_code == 201
            assert data["title"] == "テスト (2)"


def _create_mock_collection_for_get(
    doc: dict[str, object] | None = None,
) -> MagicMock:
    """GET /notes/{note_id} テスト用のモック MongoDB コレクションを作成する"""
    collection = MagicMock()
    collection.find_one = AsyncMock(return_value=doc)
    return collection


def _create_mock_collection_for_update(
    result_doc: dict[str, object] | None = None,
) -> MagicMock:
    """PUT /notes/{note_id} テスト用のモック MongoDB コレクションを作成する"""
    collection = MagicMock()
    collection.find_one_and_update = AsyncMock(return_value=result_doc)
    return collection


class TestGetNote:
    """GET /notes/{note_id} エンドポイントのテスト"""

    @pytest.mark.asyncio
    async def test_get_note_returns_200(
        self,
        mock_database: MagicMock,
        mock_settings: MagicMock,
        sample_notes_docs: list[dict[str, object]],
    ) -> None:
        """GET /notes/{note_id} が 200 を返すことを確認する"""
        mock_collection = _create_mock_collection_for_get(sample_notes_docs[0])
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
                response = await client.get(
                    "/notes/550e8400-e29b-41d4-a716-446655440001"
                )

            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_get_note_returns_note_fields(
        self,
        mock_database: MagicMock,
        mock_settings: MagicMock,
        sample_notes_docs: list[dict[str, object]],
    ) -> None:
        """GET /notes/{note_id} が全フィールドを返すことを確認する"""
        mock_collection = _create_mock_collection_for_get(sample_notes_docs[0])
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
                response = await client.get(
                    "/notes/550e8400-e29b-41d4-a716-446655440001"
                )

            data = response.json()
            assert data["id"] == "550e8400-e29b-41d4-a716-446655440001"
            assert data["title"] == "テストノート1"
            assert "content" in data
            assert "created_at" in data
            assert "updated_at" in data

    @pytest.mark.asyncio
    async def test_get_note_returns_404_when_not_found(
        self,
        mock_database: MagicMock,
        mock_settings: MagicMock,
    ) -> None:
        """存在しないノートの場合 404 を返すことを確認する"""
        mock_collection = _create_mock_collection_for_get(None)
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
                response = await client.get("/notes/non-existent-id")

            assert response.status_code == 404


class TestPutNote:
    """PUT /notes/{note_id} エンドポイントのテスト"""

    @pytest.mark.asyncio
    async def test_put_note_returns_200(
        self,
        mock_database: MagicMock,
        mock_settings: MagicMock,
        sample_notes_docs: list[dict[str, object]],
    ) -> None:
        """PUT /notes/{note_id} が 200 を返すことを確認する"""
        updated_doc = {**sample_notes_docs[0], "title": "更新後タイトル"}
        mock_collection = _create_mock_collection_for_update(updated_doc)
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
                response = await client.put(
                    "/notes/550e8400-e29b-41d4-a716-446655440001",
                    json={"title": "更新後タイトル"},
                )

            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_put_note_returns_updated_fields(
        self,
        mock_database: MagicMock,
        mock_settings: MagicMock,
        sample_notes_docs: list[dict[str, object]],
    ) -> None:
        """PUT /notes/{note_id} が更新後のフィールドを返すことを確認する"""
        updated_doc = {
            **sample_notes_docs[0],
            "title": "更新後タイトル",
            "content": "更新後本文",
        }
        mock_collection = _create_mock_collection_for_update(updated_doc)
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
                response = await client.put(
                    "/notes/550e8400-e29b-41d4-a716-446655440001",
                    json={"title": "更新後タイトル", "content": "更新後本文"},
                )

            data = response.json()
            assert data["title"] == "更新後タイトル"
            assert data["content"] == "更新後本文"

    @pytest.mark.asyncio
    async def test_put_note_returns_404_when_not_found(
        self,
        mock_database: MagicMock,
        mock_settings: MagicMock,
    ) -> None:
        """存在しないノートの場合 404 を返すことを確認する"""
        mock_collection = _create_mock_collection_for_update(None)
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
                response = await client.put(
                    "/notes/non-existent-id",
                    json={"title": "更新"},
                )

            assert response.status_code == 404


def _create_mock_collection_for_delete(
    deleted_count: int = 1,
) -> MagicMock:
    """DELETE /notes/{note_id} テスト用のモック MongoDB コレクションを作成する"""
    collection = MagicMock()
    collection.delete_one = AsyncMock(
        return_value=MagicMock(deleted_count=deleted_count)
    )
    return collection


class TestDeleteNote:
    """DELETE /notes/{note_id} エンドポイントのテスト"""

    @pytest.mark.asyncio
    async def test_delete_note_returns_204(
        self,
        mock_database: MagicMock,
        mock_settings: MagicMock,
    ) -> None:
        """DELETE /notes/{note_id} が 204 を返すことを確認する"""
        mock_collection = _create_mock_collection_for_delete(deleted_count=1)
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
                response = await client.delete(
                    "/notes/550e8400-e29b-41d4-a716-446655440001"
                )

            assert response.status_code == 204

    @pytest.mark.asyncio
    async def test_delete_note_returns_404_when_not_found(
        self,
        mock_database: MagicMock,
        mock_settings: MagicMock,
    ) -> None:
        """存在しないノートの場合 404 を返すことを確認する"""
        mock_collection = _create_mock_collection_for_delete(deleted_count=0)
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
                response = await client.delete("/notes/non-existent-id")

            assert response.status_code == 404
