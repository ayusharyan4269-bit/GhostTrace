import pytest
from unittest.mock import AsyncMock, patch


@pytest.mark.asyncio
async def test_health_endpoint_healthy(async_client):
    with patch("app.services.ollama_client.OllamaClient.check_health", new_callable=AsyncMock) as mock_check:
        mock_check.return_value = (True, ["qwen2.5:3b", "llama3.2:3b"])
        response = await async_client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["ollama_connected"] is True
        assert data["model_available"] is True
        assert "qwen2.5:3b" in data["available_models"]


@pytest.mark.asyncio
async def test_health_endpoint_ollama_disconnected(async_client):
    with patch("app.services.ollama_client.OllamaClient.check_health", new_callable=AsyncMock) as mock_check:
        mock_check.return_value = (False, [])
        response = await async_client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["ollama_connected"] is False
        assert data["model_available"] is False


@pytest.mark.asyncio
async def test_root_endpoint(async_client):
    response = await async_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "GhostTrace"
    assert "tagline" in data


@pytest.mark.asyncio
async def test_models_endpoint(async_client):
    with patch("app.services.ollama_client.OllamaClient.check_health", new_callable=AsyncMock) as mock_check, \
         patch("app.services.ollama_client.OllamaClient.list_models", new_callable=AsyncMock) as mock_list:
        mock_check.return_value = (True, ["qwen2.5:3b"])
        from app.models.responses import ModelInfo
        mock_list.return_value = [ModelInfo(name="qwen2.5:3b", size=1900000000, parameter_size="3.1B")]

        response = await async_client.get("/api/models")
        assert response.status_code == 200
        data = response.json()
        assert data["configured_model"] == "qwen2.5:3b"
        assert len(data["models"]) == 1
        assert data["models"][0]["name"] == "qwen2.5:3b"


@pytest.mark.asyncio
async def test_scenarios_endpoint(async_client):
    response = await async_client.get("/api/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) >= 3
    ids = [s["id"] for s in scenarios]
    assert "midnight_process" in ids
    assert "forgotten_server" in ids
    assert "last_commit" in ids
