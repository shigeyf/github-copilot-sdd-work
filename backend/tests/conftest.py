"""pytest フィクスチャ

MongoDB テストクライアントと FastAPI テストクライアントを提供する。
"""

from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient


@pytest.fixture
def mock_database() -> MagicMock:
    """モック MongoDB データベースを提供する"""
    db = MagicMock()
    db.command = AsyncMock(return_value={"ok": 1})
    return db


@pytest.fixture
def mock_settings() -> MagicMock:
    """モック設定を提供する"""
    settings = MagicMock()
    settings.mongodb_url = "mongodb://localhost:27017/test_notes"
    settings.mongodb_database = "test_notes"
    settings.api_host = "0.0.0.0"
    settings.api_port = 8000
    settings.cors_origins = "http://localhost:5173"
    settings.cors_origins_list = ["http://localhost:5173"]
    settings.log_level = "DEBUG"
    return settings


@pytest.fixture
async def test_client(
    mock_database: MagicMock,
    mock_settings: MagicMock,
) -> AsyncGenerator[AsyncClient, None]:
    """FastAPI テストクライアントを提供する

    MongoDB 接続をモックして、実際のデータベースに依存しないテストを可能にする。
    """
    with (
        patch("src.main.get_settings", return_value=mock_settings),
        patch("src.main.connect_to_mongodb", new_callable=AsyncMock),
        patch("src.main.close_mongodb_connection", new_callable=AsyncMock),
        patch("src.main.get_database", return_value=mock_database),
    ):
        from src.main import create_app

        app = create_app()

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            yield client
