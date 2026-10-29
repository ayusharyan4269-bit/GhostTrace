import aiosqlite
import os
from pathlib import Path
from app.core.config import settings
from app.core.logging_config import logger

CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS saved_sessions (
    session_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    mode TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    summary_json TEXT NOT NULL,
    narrative_json TEXT NOT NULL,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON saved_sessions (created_at DESC);
"""


async def get_db_connection() -> aiosqlite.Connection:
    db_path = settings.DB_PATH
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = await aiosqlite.connect(db_path)
    conn.row_factory = aiosqlite.Row
    return conn


async def init_db():
    conn = await get_db_connection()
    try:
        await conn.executescript(CREATE_TABLES_SQL)
        await conn.commit()
        logger.info(f"Initialized SQLite database at {settings.DB_PATH}")
    finally:
        await conn.close()
