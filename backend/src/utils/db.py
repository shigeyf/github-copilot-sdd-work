"""MongoDB 接続管理モジュール

motor を使用した非同期 MongoDB 接続の管理を提供する。
"""

import structlog
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from src.config import Settings, get_settings

logger = structlog.get_logger(__name__)

# グローバルな MongoDB クライアントとデータベース参照
_client: AsyncIOMotorClient | None = None  # type: ignore[type-arg]
_database: AsyncIOMotorDatabase | None = None  # type: ignore[type-arg]


async def connect_to_mongodb(settings: Settings | None = None) -> None:
    """MongoDB に接続する

    Args:
        settings: アプリケーション設定。None の場合はデフォルト設定を使用。
    """
    global _client, _database

    if settings is None:
        settings = get_settings()

    logger.info("MongoDB に接続中...", url=settings.mongodb_url)

    _client = AsyncIOMotorClient(settings.mongodb_url)
    _database = _client[settings.mongodb_database]

    # 接続テスト
    await _client.admin.command("ping")
    logger.info("MongoDB に接続しました", database=settings.mongodb_database)


async def close_mongodb_connection() -> None:
    """MongoDB 接続を閉じる"""
    global _client, _database

    if _client is not None:
        _client.close()
        _client = None
        _database = None
        logger.info("MongoDB 接続を閉じました")


def get_database() -> AsyncIOMotorDatabase:  # type: ignore[type-arg]
    """MongoDB データベースインスタンスを取得する

    Returns:
        MongoDB データベースインスタンス

    Raises:
        RuntimeError: データベースが初期化されていない場合
    """
    if _database is None:
        msg = "データベースが初期化されていません。"
        msg += "先に connect_to_mongodb() を呼び出してください。"
        raise RuntimeError(msg)
    return _database
