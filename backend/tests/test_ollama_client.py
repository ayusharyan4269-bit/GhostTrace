import pytest
from unittest.mock import AsyncMock, patch
import httpx
from app.services.ollama_client import (
    OllamaClient,
    OllamaConnectionError,
    OllamaTimeoutError,
    OllamaModelNotFoundError
)


@pytest.mark.asyncio
async def test_ollama_generate_success():
    client = OllamaClient()
    mock_response = {
        "response": '{"title": "Test Title", "narrative": "Story text", "opening": "Pro", "closing_line": "End"}',
        "total_duration": 1200000000,
        "eval_count": 150,
        "eval_duration": 1100000000
    }

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = httpx.Response(200, json=mock_response)
        text, meta = await client.generate("test prompt")
        assert "Test Title" in text
        assert meta["eval_count"] == 150
        assert meta["model"] == "qwen2.5:3b"


@pytest.mark.asyncio
async def test_ollama_generate_connection_error():
    client = OllamaClient()
    with patch("httpx.AsyncClient.post", side_effect=httpx.ConnectError("Connection refused")):
        with pytest.raises(OllamaConnectionError) as exc_info:
            await client.generate("test prompt")
        assert "Cannot connect to Ollama" in str(exc_info.value)


@pytest.mark.asyncio
async def test_ollama_generate_timeout():
    client = OllamaClient(timeout_seconds=0.1)
    with patch("httpx.AsyncClient.post", side_effect=httpx.TimeoutException("Read timed out")):
        with pytest.raises(OllamaTimeoutError) as exc_info:
            await client.generate("test prompt")
        assert "timed out" in str(exc_info.value)


@pytest.mark.asyncio
async def test_ollama_generate_model_not_found():
    client = OllamaClient()
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = httpx.Response(404, text="model not found")
        with pytest.raises(OllamaModelNotFoundError) as exc_info:
            await client.generate("test prompt")
        assert "not found in local Ollama" in str(exc_info.value)
