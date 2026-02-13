"""API ルーター集約モジュール

すべての API ルーターをまとめて管理する。
"""

from fastapi import APIRouter

router = APIRouter()

# 将来的にノート関連のルーターをここにインクルードする
# from src.api.notes import router as notes_router
# router.include_router(notes_router, prefix="/notes", tags=["notes"])
