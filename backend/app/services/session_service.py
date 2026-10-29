import uuid
import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from app.database.connection import get_db_connection
from app.models.responses import SessionItem, SessionDetailResponse


class SessionService:

    @staticmethod
    def _now_iso() -> str:
        return datetime.now(timezone.utc).isoformat()

    @classmethod
    async def create_session(
        cls,
        title: str,
        mode: str,
        summary: Dict[str, Any],
        narrative: Dict[str, Any],
        notes: Optional[str] = None
    ) -> SessionDetailResponse:
        session_id = f"gt_{uuid.uuid4().hex[:12]}"
        now = cls._now_iso()

        conn = await get_db_connection()
        try:
            await conn.execute(
                """
                INSERT INTO saved_sessions (
                    session_id, title, mode, created_at, updated_at,
                    summary_json, narrative_json, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    session_id,
                    title,
                    mode,
                    now,
                    now,
                    json.dumps(summary),
                    json.dumps(narrative),
                    notes
                )
            )
            await conn.commit()

            return SessionDetailResponse(
                session_id=session_id,
                title=title,
                mode=mode,
                created_at=now,
                updated_at=now,
                summary=summary,
                narrative=narrative,
                notes=notes
            )
        finally:
            await conn.close()

    @classmethod
    async def list_sessions(cls) -> List[SessionItem]:
        conn = await get_db_connection()
        try:
            cursor = await conn.execute(
                "SELECT session_id, title, mode, created_at, updated_at, summary_json, notes FROM saved_sessions ORDER BY created_at DESC"
            )
            rows = await cursor.fetchall()
            items: List[SessionItem] = []
            for row in rows:
                try:
                    s_data = json.loads(row["summary_json"])
                    events_count = s_data.get("extracted_events_count", 0)
                    errors_count = s_data.get("errors_count", 0)
                except Exception:
                    events_count = 0
                    errors_count = 0

                items.append(
                    SessionItem(
                        session_id=row["session_id"],
                        title=row["title"],
                        mode=row["mode"],
                        created_at=row["created_at"],
                        updated_at=row["updated_at"],
                        events_count=events_count,
                        errors_count=errors_count,
                        notes=row["notes"]
                    )
                )
            return items
        finally:
            await conn.close()

    @classmethod
    async def get_session(cls, session_id: str) -> Optional[SessionDetailResponse]:
        conn = await get_db_connection()
        try:
            cursor = await conn.execute(
                "SELECT session_id, title, mode, created_at, updated_at, summary_json, narrative_json, notes FROM saved_sessions WHERE session_id = ?",
                (session_id,)
            )
            row = await cursor.fetchone()
            if not row:
                return None

            return SessionDetailResponse(
                session_id=row["session_id"],
                title=row["title"],
                mode=row["mode"],
                created_at=row["created_at"],
                updated_at=row["updated_at"],
                summary=json.loads(row["summary_json"]),
                narrative=json.loads(row["narrative_json"]),
                notes=row["notes"]
            )
        finally:
            await conn.close()

    @classmethod
    async def update_session(
        cls,
        session_id: str,
        title: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Optional[SessionDetailResponse]:
        conn = await get_db_connection()
        try:
            now = cls._now_iso()
            updates = []
            params = []

            if title is not None:
                updates.append("title = ?")
                params.append(title)
            if notes is not None:
                updates.append("notes = ?")
                params.append(notes)

            if not updates:
                return await cls.get_session(session_id)

            updates.append("updated_at = ?")
            params.append(now)
            params.append(session_id)

            sql = f"UPDATE saved_sessions SET {', '.join(updates)} WHERE session_id = ?"
            cursor = await conn.execute(sql, tuple(params))
            await conn.commit()

            if cursor.rowcount == 0:
                return None

            return await cls.get_session(session_id)
        finally:
            await conn.close()

    @classmethod
    async def delete_session(cls, session_id: str) -> bool:
        conn = await get_db_connection()
        try:
            cursor = await conn.execute(
                "DELETE FROM saved_sessions WHERE session_id = ?",
                (session_id,)
            )
            await conn.commit()
            return cursor.rowcount > 0
        finally:
            await conn.close()

    @classmethod
    async def clear_all_sessions(cls) -> int:
        conn = await get_db_connection()
        try:
            cursor = await conn.execute("DELETE FROM saved_sessions")
            await conn.commit()
            return cursor.rowcount
        finally:
            await conn.close()
