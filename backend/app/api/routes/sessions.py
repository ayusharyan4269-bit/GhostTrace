from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status
from app.models.requests import CreateSessionRequest, UpdateSessionRequest
from app.models.responses import SessionItem, SessionDetailResponse
from app.services.session_service import SessionService

router = APIRouter(tags=["Saved Sessions"])


@router.get("/sessions", response_model=List[SessionItem])
async def list_sessions():
    return await SessionService.list_sessions()


@router.post("/sessions", response_model=SessionDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_session(req: CreateSessionRequest):
    return await SessionService.create_session(
        title=req.title,
        mode=req.mode,
        summary=req.summary,
        narrative=req.narrative,
        notes=req.notes
    )


@router.get("/sessions/{session_id}", response_model=SessionDetailResponse)
async def get_session(session_id: str):
    sess = await SessionService.get_session(session_id)
    if not sess:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )
    return sess


@router.patch("/sessions/{session_id}", response_model=SessionDetailResponse)
async def update_session(session_id: str, req: UpdateSessionRequest):
    updated = await SessionService.update_session(
        session_id=session_id,
        title=req.title,
        notes=req.notes
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )
    return updated


@router.delete("/sessions/{session_id}", status_code=status.HTTP_200_OK)
async def delete_session(session_id: str):
    deleted = await SessionService.delete_session(session_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )
    return {"success": True, "message": f"Session '{session_id}' deleted."}


@router.delete("/sessions", status_code=status.HTTP_200_OK)
async def clear_all_sessions():
    count = await SessionService.clear_all_sessions()
    return {"success": True, "cleared_count": count, "message": f"Cleared {count} saved sessions."}
