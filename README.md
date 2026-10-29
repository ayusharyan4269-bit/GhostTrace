# GhostTrace 👻

> **"Every command leaves a trace. Some traces tell stories."**

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026%20Week%204-ff7a00?style=for-the-badge&logo=hacktoberfest)](https://hacktoberfest.com/)
[![Local AI](https://img.shields.io/badge/Local%20AI-Ollama%20%E2%80%A2%20qwen2.5%3A3b-10b981?style=for-the-badge)](https://ollama.com/)
[![Privacy](https://img.shields.io/badge/Privacy-Local--First-blue?style=for-the-badge)](#privacy--security-guarantees)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

GhostTrace is an eerie, interactive, and privacy-preserving developer tool that transforms terminal histories, application logs, and system crash sequences into haunting, evidence-grounded narratives.

GitHub Actions runs the backend test suite, frontend tests, and production build for pushes and pull requests.

Built for the **Hacktoberfest 2026 Open-Source AI Challenge Week 4: Ghost in the Machine**, GhostTrace uses an open-weight language model (`qwen2.5:3b` by default via **Ollama**) paired with a deterministic log parser to turn terminal traces into rich stories. Ollama defaults to this machine; changing its endpoint sends logs to the configured server.

---

## 🌟 Key Features

- **🛡️ Local-First & Private:** Inference uses Ollama, configured to run on your machine by default. No hosted AI provider or telemetry is configured by GhostTrace; changing the Ollama endpoint sends logs to that server.
- **🔬 Deterministic Evidence Grounding:** Regex and structured format parsers extract timestamps, commands, errors, warnings, and signals *before* the AI is invoked, preventing hallucinations.
- **🎭 4 Distinct Narrative Modes:**
  1. **Haunted Chronicle:** Gothic horror narrative where daemon processes become restless spirits and failed operations echo like omens.
  2. **Digital Séance:** The abandoned mainframe speaks in the first-person, recounting its memory registers and departed operators.
  3. **Forensic Detective:** Technical noir incident report testing hypotheses, failure chronologies, and root causes without supernatural elements.
  4. **Lost Memory:** Poetic tribute celebrating Día de los Muertos, honoring developer labor, abandoned commits, and memory preservation.
- **📍 Interactive Evidence Inspector:** Click any narrative event to inspect the verbatim source log line, line number, and deterministic signals.
- **📂 3 Flexible Input Methods:**
  - **Paste Terminal Output:** Live character counter with 150k character guardrail.
  - **File Upload:** Safely parses `.txt`, `.log`, `.json`, and `.csv` files up to 2MB.
  - **Built-in Scenarios:** 1-click loading for *The Midnight Process*, *The Forgotten Server*, and *The Last Commit*.
- **💾 Local SQLite Session Storage:** Explicit user saves only. Raw logs are never persisted to disk by default.
- **📜 Markdown Export:** One-click download of the complete narrative, timeline metrics, and evidence tables.
- **🖥️ Retro CRT Terminal Aesthetics:** Monospace typography, subtle scanline overlay toggle, and reduced-motion accessibility.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       GHOSTTRACE UI                         │
│     (React 18 + TypeScript + Vite + Tailwind CSS)           │
└──────────────┬───────────────────────────────▲──────────────┘
               │ HTTP POST /api/analyze        │ Structured JSON
               ▼                               │ Narrative
┌──────────────────────────────────────────────┴──────────────┐
│                    FASTAPI BACKEND                          │
│                                                             │
│  1. LogParser        --> Plain Text / NDJSON / CSV Extractor│
│  2. EventAnalyzer    --> Anomaly & Repetition Detection     │
│  3. GhostEngine      --> Prompt Guardrails & JSON Schema    │
│  4. SessionService   --> Async SQLite Session Storage       │
└──────────────┬──────────────────────────────────────────────┘
               │ Local HTTP (:11434)
               ▼
┌─────────────────────────────────────────────────────────────┐
│                    OLLAMA LOCAL RUNTIME                     │
│  Model: qwen2.5:3b (Open-Weight Model, Apache 2.0)          │
│  Local inference by default • No hosted AI fallback         │
└─────────────────────────────────────────────────────────────┘
```

For detailed component designs and data flows, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 🚀 Quickstart Guide

### Prerequisites
1. **Python 3.11+** installed.
2. **Node.js 18+** & npm installed.
3. **Ollama** installed on your machine ([Download Ollama](https://ollama.com/download)).

---

### Step 1: Start Ollama & Pull the Model

Open a terminal and start the Ollama service:

```bash
# Pull the default 3B open-weight model (~1.9 GB download)
ollama pull qwen2.5:3b

# Ensure Ollama is serving locally (by default on port 11434)
ollama serve
```

To try Google's Gemma 3 4B instead, install it with `ollama pull gemma3:4b` (about 3.4 GB; Ollama 0.6 or later), set `OLLAMA_MODEL=gemma3:4b` in the project-root or `backend/.env`, and restart the backend. GhostTrace uses the configured Ollama model; Qwen remains the default. See the [Gemma 3 Ollama model page](https://ollama.com/library/gemma3) for other sizes.

---

### Step 2: Set Up & Run the Backend

#### Windows (PowerShell)
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt

# Start backend server
$env:PYTHONPATH='.'; uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### macOS / Linux
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Start backend server
PYTHONPATH=. uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend API will be available at `http://127.0.0.1:8000`. You can inspect the OpenAPI documentation at `http://127.0.0.1:8000/docs`.

---

### Step 3: Set Up & Run the Frontend

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

Open your browser to **`http://localhost:5173`** to enter the GhostTrace terminal.

---

## ⚙️ Configuration & Environment Variables

Copy `.env.example` to `.env` in the project root or backend folder to customize settings:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Base URL of local Ollama daemon |
| `OLLAMA_MODEL` | `qwen2.5:3b` | Configured Ollama model tag (e.g. `gemma3:4b`) |
| `OLLAMA_TIMEOUT_SECONDS` | `75.0` | Maximum time allowed for local CPU/GPU inference |
| `MAX_INPUT_CHAR_LIMIT` | `150000` | Input character limit for terminal pastes |
| `DB_PATH` | `backend/ghosttrace.db` | Local SQLite database file location |

---

## 🧪 Running Automated Tests

Testing is mandatory and automated for both backend and frontend suites.

### Backend Tests (Pytest)
```powershell
# From project root:
backend\.venv\Scripts\pytest backend\tests -v
```
*(Runs 24 tests validating health endpoints, log parsing across formats, Ollama mocking, prompt injection resistance, and session CRUD).*

### Frontend Tests (Vitest)
```powershell
# From frontend directory:
cd frontend
npm test
```
*(Runs 7 tests verifying component rendering, input validation, scenario loading, and markdown export).*

### Frontend Typechecking & Production Build
```powershell
cd frontend
npm run lint    # runs tsc --noEmit
npm run build   # builds production bundle in dist/
```

---

## 🛡️ Privacy & Security Guarantees

1. **Passive Text Analysis:** GhostTrace treats logs as passive text. It never executes commands or monitors your shell.
2. **Untrusted Data Sanitization:** All user inputs are sanitized against prompt injection attempts (e.g., embedded instructions inside log lines are treated as untrusted historical text).
3. **No Automatic Persistence:** Uploaded and pasted logs are processed in volatile RAM. Only saved sessions are written to the local SQLite database.
4. **Offline Capability:** With Ollama configured to a local endpoint, GhostTrace can operate offline after the dependencies and model weights are installed. If you configure a remote Ollama endpoint, logs are sent to that server for inference.

---

## 📜 Open-Source & Model Licensing

- **GhostTrace Application:** Licensed under the [MIT License](LICENSE).
- **Default Model (`qwen2.5:3b`):** Developed by the Qwen Team, licensed under the permissive **Apache 2.0 License**.

---

## 🎃 Hacktoberfest 2026 Submission

- Read the complete hackathon writeup in [docs/HACKTOBERFEST_WEEK4_SUBMISSION.md](docs/HACKTOBERFEST_WEEK4_SUBMISSION.md).
# Quick start on Windows

After installing the backend and frontend dependencies described below, run `.\dev.ps1` from the project root. It opens API and Vite terminals and launches `http://localhost:5173`. Browser verification steps are in [docs/SMOKE_TEST.md](docs/SMOKE_TEST.md).

