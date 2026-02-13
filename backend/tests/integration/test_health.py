"""ヘルスチェックエンドポイントの統合テスト"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check_success(test_client: AsyncClient) -> None:
    """ヘルスチェックが正常に動作することを確認する"""
    response = await test_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"
