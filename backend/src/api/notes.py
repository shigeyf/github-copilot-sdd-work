"""ノート API エンドポイント

ノート管理に関連する REST API エンドポイントを提供する。
"""

from typing import Annotated

import structlog
from fastapi import APIRouter, HTTPException, Query

from src.models.note import NoteListResponse
from src.repositories.note_repository import NoteRepository
from src.services.note_service import NoteService
from src.utils.db import get_database

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/notes", tags=["notes"])


def _get_note_service() -> NoteService:
    """NoteService インスタンスを取得する"""
    db = get_database()
    repository = NoteRepository(collection=db["notes"])
    return NoteService(repository=repository)


@router.get(
    "",
    response_model=NoteListResponse,
    summary="ノート一覧取得",
    description="すべてのノートを取得します。ページネーションとソートをサポートします。",
)
async def list_notes(
    sort_by: Annotated[
        str,
        Query(
            description="ソート対象フィールド",
            pattern="^(created_at|updated_at)$",
        ),
    ] = "created_at",
    order: Annotated[
        str,
        Query(
            description="ソート順",
            pattern="^(asc|desc)$",
        ),
    ] = "desc",
    skip: Annotated[
        int,
        Query(
            ge=0,
            description="スキップする件数",
        ),
    ] = 0,
    limit: Annotated[
        int,
        Query(
            ge=1,
            le=100,
            description="取得する件数",
        ),
    ] = 20,
) -> NoteListResponse:
    """ノート一覧を取得する"""
    try:
        service = _get_note_service()
        return await service.list_notes(
            skip=skip,
            limit=limit,
            sort_by=sort_by,
            order=order,
        )
    except RuntimeError as e:
        logger.error("データベース接続エラー", error=str(e))
        raise HTTPException(
            status_code=503,
            detail="データベースに接続できません",
        ) from e
    except Exception as e:
        logger.error("ノート一覧取得エラー", error=str(e))
        raise HTTPException(
            status_code=503,
            detail="サービスが利用できません",
        ) from e
