"""API ルーター集約モジュール

すべての API ルーターをまとめて管理する。
"""

from fastapi import APIRouter

from src.api.notes import router as notes_router

router = APIRouter()

# ノート関連のルーターを登録
router.include_router(notes_router)
