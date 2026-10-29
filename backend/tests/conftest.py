import os
import sys
from pathlib import Path
import tempfile
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Set test environment database to a temporary location
test_db_dir = tempfile.mkdtemp()
test_db_path = os.path.join(test_db_dir, "test_ghosttrace.db")
os.environ["DB_PATH"] = test_db_path
os.environ["DEBUG"] = "true"

from app.core.config import settings
settings.DB_PATH = test_db_path


from app.main import app
from app.database.connection import init_db


@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    await init_db()
    yield
    # Cleanup DB between tests if needed


@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
