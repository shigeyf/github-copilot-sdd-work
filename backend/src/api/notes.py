"""ノート API エンドポイント

ノート管理に関連する REST API エンドポイントを提供する。
"""

from typing import Annotated

import structlog
from fastapi import APIRouter, HTTPException, Query
from starlette.status import HTTP_201_CREATED, HTTP_204_NO_CONTENT, HTTP_404_NOT_FOUND

from src.models.note import NoteCreate, NoteListResponse, NoteResponse, NoteUpdate
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


@router.post(
    "",
    response_model=NoteResponse,
    status_code=HTTP_201_CREATED,
    summary="新規ノート作成",
    description="新しいノートを作成します。タイトルは必須で、本文は任意です。",
)
async def create_note(
    note_data: NoteCreate,
) -> NoteResponse:
    """新しいノートを作成する"""
    try:
        service = _get_note_service()
        return await service.create_note(note_data)
    except RuntimeError as e:
        logger.error("データベース接続エラー", error=str(e))
        raise HTTPException(
            status_code=503,
            detail="データベースに接続できません",
        ) from e
    except Exception as e:
        logger.error("ノート作成エラー", error=str(e))
        raise HTTPException(
            status_code=503,
            detail="サービスが利用できません",
        ) from e


@router.get(
    "/{note_id}",
    response_model=NoteResponse,
    summary="ノート取得",
    description="指定されたIDのノートを取得します。",
)
async def get_note(
    note_id: str,
) -> NoteResponse:
    """指定された ID のノートを取得する"""
    try:
        service = _get_note_service()
        return await service.get_note(note_id)
    except ValueError:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail="ノートが見つかりません",
        ) from None
    except RuntimeError as e:
        logger.error("データベース接続エラー", error=str(e))
        raise HTTPException(
            status_code=503,
            detail="データベースに接続できません",
        ) from e
    except Exception as e:
        logger.error("ノート取得エラー", error=str(e))
        raise HTTPException(
            status_code=503,
            detail="サービスが利用できません",
        ) from e


@router.put(
    "/{note_id}",
    response_model=NoteResponse,
    summary="ノート更新",
    description="指定されたIDのノートを更新します。タイトルと本文の両方またはいずれかを更新できます。",
)
async def update_note(
    note_id: str,
    note_data: NoteUpdate,
) -> NoteResponse:
    """指定された ID のノートを更新する"""
    try:
        service = _get_note_service()
        return await service.update_note(note_id, note_data)
    except ValueError:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail="ノートが見つかりません",
        ) from None
    except RuntimeError as e:
        logger.error("データベース接続エラー", error=str(e))
        raise HTTPException(
            status_code=503,
            detail="データベースに接続できません",
        ) from e
    except Exception as e:
        logger.error("ノート更新エラー", error=str(e))
        raise HTTPException(
            status_code=503,
            detail="サービスが利用できません",
        ) from e


@router.delete(
    "/{note_id}",
    status_code=HTTP_204_NO_CONTENT,
    summary="ノート削除",
    description="指定されたIDのノートを削除します。",
)
async def delete_note(
    note_id: str,
) -> None:
    """指定された ID のノートを削除する"""
    try:
        service = _get_note_service()
        await service.delete_note(note_id)
    except ValueError:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail="ノートが見つかりません",
        ) from None
    except RuntimeError as e:
        logger.error("データベース接続エラー", error=str(e))
        raise HTTPException(
            status_code=503,
            detail="データベースに接続できません",
        ) from e
    except Exception as e:
        logger.error("ノート削除エラー", error=str(e))
        raise HTTPException(
            status_code=503,
            detail="サービスが利用できません",
        ) from e
