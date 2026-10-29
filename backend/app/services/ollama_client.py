import httpx
import time
from typing import List, Tuple, Dict, Any, Optional
from app.core.config import settings
from app.core.logging_config import logger
from app.models.responses import ModelInfo


class OllamaError(Exception):
    """Base exception for Ollama client errors."""
    pass


class OllamaConnectionError(OllamaError):
    """Raised when Ollama server cannot be reached."""
    pass


class OllamaTimeoutError(OllamaError):
    """Raised when Ollama request times out."""
    pass


class OllamaModelNotFoundError(OllamaError):
    """Raised when the specified model is not available locally."""
    pass


class OllamaClient:
    """
    Client for interacting with the configured Ollama endpoint.
    The default endpoint is local; deployments may configure a remote endpoint.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: Optional[float] = None
    ):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.OLLAMA_MODEL
        self.timeout = timeout_seconds or settings.OLLAMA_TIMEOUT_SECONDS

    async def check_health(self) -> Tuple[bool, List[str]]:
        """
        Pings Ollama /api/tags to check connection and list available models.
        """
        url = f"{self.base_url}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name", "") for m in data.get("models", []) if m.get("name")]
                    return True, models
                return False, []
        except Exception as e:
            logger.debug(f"Ollama health check failed: {e}")
            return False, []

    async def list_models(self) -> List[ModelInfo]:
        """
        Lists detailed model information from local Ollama.
        """
        url = f"{self.base_url}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    result: List[ModelInfo] = []
                    for m in data.get("models", []):
                        details = m.get("details", {})
                        param_size = details.get("parameter_size")
                        result.append(
                            ModelInfo(
                                name=m.get("name", ""),
                                size=m.get("size"),
                                modified_at=m.get("modified_at"),
                                parameter_size=param_size
                            )
                        )
                    return result
                return []
        except Exception as e:
            logger.warning(f"Failed to list Ollama models: {e}")
            return []

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        json_format: bool = True,
        override_model: Optional[str] = None,
        temperature: float = 0.7
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Calls Ollama /api/generate for local inference.
        Returns (raw_response_text, generation_metadata).
        """
        target_model = override_model or self.model
        url = f"{self.base_url}/api/generate"

        payload: Dict[str, Any] = {
            "model": target_model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "top_p": 0.9,
            }
        }
        if system_prompt:
            payload["system"] = system_prompt
        if json_format:
            payload["format"] = "json"

        start_time = time.perf_counter()
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(url, json=payload)
                elapsed = round(time.perf_counter() - start_time, 2)

                if res.status_code == 404:
                    raise OllamaModelNotFoundError(
                        f"Model '{target_model}' not found in local Ollama. Run 'ollama pull {target_model}' to install."
                    )
                if res.status_code != 200:
                    raise OllamaError(f"Ollama returned HTTP {res.status_code}: {res.text}")

                data = res.json()
                raw_text = data.get("response", "")
                metadata = {
                    "model": target_model,
                    "inference_duration_sec": elapsed,
                    "total_duration_ns": data.get("total_duration"),
                    "eval_count": data.get("eval_count"),
                    "eval_duration_ns": data.get("eval_duration"),
                }
                return raw_text, metadata

        except httpx.ConnectError as e:
            raise OllamaConnectionError(
                f"Cannot connect to Ollama at '{self.base_url}'. Ensure the Ollama desktop app or service is running locally."
            ) from e
        except httpx.TimeoutException as e:
            raise OllamaTimeoutError(
                f"Local Ollama inference timed out after {self.timeout}s on model '{target_model}'. The model may still be loading into RAM/VRAM."
            ) from e
        except OllamaError:
            raise
        except Exception as e:
            raise OllamaError(f"Unexpected error communicating with Ollama: {str(e)}") from e
