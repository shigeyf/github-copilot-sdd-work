"""FastAPI アプリケーションエントリーポイント

Markdownノート管理アプリのバックエンド API サーバー。
"""

import sys
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import router as api_router
from src.config import get_settings
from src.utils.db import close_mongodb_connection, connect_to_mongodb, get_database

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """アプリケーションライフサイクル管理

    起動時に MongoDB に接続し、シャットダウン時に接続を閉じる。
    """
    settings = get_settings()

    # 起動時: MongoDB に接続
    try:
        await connect_to_mongodb(settings)
        logger.info("アプリケーションを起動しました")
    except Exception as e:
        # FR-020: 接続失敗時にエラーメッセージを標準エラー出力とログに表示し、起動を中断
        error_message = f"MongoDB に接続できません: {e}"
        logger.error(error_message)
        print(error_message, file=sys.stderr)
        sys.exit(1)

    yield

    # シャットダウン時: MongoDB 接続を閉じる
    await close_mongodb_connection()
    logger.info("アプリケーションをシャットダウンしました")


def create_app() -> FastAPI:
    """FastAPI アプリケーションを作成する"""
    settings = get_settings()

    app = FastAPI(
        title="Markdownノート管理API",
        description="Markdownノート管理アプリケーションのREST API",
        version="1.0.0",
        lifespan=lifespan,
    )

    # CORS ミドルウェアの設定
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
    )

    # API ルーターを登録
    app.include_router(api_router)

    # ヘルスチェックエンドポイント
    @app.get("/health", tags=["health"], summary="ヘルスチェック")
    async def health_check() -> dict[str, str]:
        """APIサーバーの健全性を確認する

        MongoDB への接続状態も含めて報告する。
        """
        try:
            db = get_database()
            await db.command("ping")
            return {"status": "ok", "database": "connected"}
        except Exception:
            return {"status": "error", "database": "disconnected"}

    return app


app = create_app()
