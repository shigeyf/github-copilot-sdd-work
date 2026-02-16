"""起動時間パフォーマンステスト

SC-004 検証: 100件のノートがある状態での
アプリケーション起動が3秒以内であることを確認する。
"""

import time
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from src.main import create_app


def _create_mock_notes(count: int) -> list[dict]:
    """テスト用のモックノートデータを生成する

    Args:
        count: 生成するノートの件数

    Returns:
        モックノートのリスト
    """
    from datetime import UTC, datetime

    notes = []
    for i in range(count):
        notes.append(
            {
                "_id": f"note-{i:04d}",
                "title": f"テストノート {i}",
                "content": f"# ノート {i}\n\nこれはテストノートです。" * 10,
                "created_at": datetime.now(UTC),
                "updated_at": datetime.now(UTC),
            }
        )
    return notes


@pytest.mark.asyncio
async def test_startup_performance_with_100_notes() -> None:
    """100件のノートがある状態でアプリケーションの起動とレスポンスが3秒以内であることを確認する

    SC-004: アプリケーションは100件のノートがある状態で3秒以内に起動すること
    """
    mock_notes = _create_mock_notes(100)

    # MongoDB クライアントのモック
    mock_db = MagicMock()
    mock_collection = MagicMock()

    # ping コマンドのモック
    mock_db.command = AsyncMock(return_value={"ok": 1})
    mock_db.__getitem__ = MagicMock(return_value=mock_collection)

    # count_documents のモック
    mock_collection.count_documents = AsyncMock(return_value=len(mock_notes))

    # find のモック（カーソルを返す）
    mock_cursor = MagicMock()
    mock_cursor.sort = MagicMock(return_value=mock_cursor)
    mock_cursor.skip = MagicMock(return_value=mock_cursor)
    mock_cursor.limit = MagicMock(return_value=mock_cursor)
    mock_cursor.to_list = AsyncMock(return_value=mock_notes[:20])
    mock_collection.find = MagicMock(return_value=mock_cursor)

    with (
        patch("src.utils.db.AsyncIOMotorClient") as mock_client_class,
        patch("src.utils.db._database", mock_db),
        patch("src.utils.db._client", MagicMock()),
    ):
        mock_client_instance = MagicMock()
        mock_client_instance.admin.command = AsyncMock(return_value={"ok": 1})
        mock_client_instance.__getitem__ = MagicMock(return_value=mock_db)
        mock_client_class.return_value = mock_client_instance

        # アプリケーション作成の時間を計測
        start_time = time.perf_counter()

        app = create_app()

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # ヘルスチェックエンドポイントへのリクエスト
            response = await client.get("/health")
            assert response.status_code == 200

            # ノート一覧エンドポイントへのリクエスト
            response = await client.get("/notes")
            assert response.status_code == 200

        elapsed_time = time.perf_counter() - start_time

        # 3秒以内であることを検証
        assert elapsed_time < 3.0, f"起動とレスポンスに {elapsed_time:.2f} 秒かかりました（目標: 3秒以内）"
