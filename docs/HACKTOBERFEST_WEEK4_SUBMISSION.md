---
title: "GhostTrace: The Ghost in Your Terminal — Local AI, Haunted Logs, and Open Innovation"
published: false
description: "A local-first, privacy-preserving AI tool that turns terminal logs and developer activity into evidence-grounded narratives using open-weight models."
tags: devchallenge, hf26challenge, opensource, ai
---

This is a submission for the Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine.

---

## What I Built

**GhostTrace** is an eerie, interactive, and privacy-preserving developer tool that transforms terminal histories, application logs, and system crash sequences into haunting, evidence-grounded narratives.

```
       .---.
      /     \     G H O S T T R A C E
     | () () |    "Every command leaves a trace.
      \  _  /      Some traces tell stories."
       |||||
```

Every software developer knows the feeling: sitting in a dim room at 2:00 AM, staring into the flickering cursor of a terminal, trying to understand why a background daemon silently terminated or why a build suddenly broke. The system remembers what happened, but its memory is buried in unfeeling timestamps, hex dumps, and exit codes.

GhostTrace changes that. A developer can paste raw terminal output, upload a log file (`.txt`, `.log`, `.json`, `.csv`), or load one of three pre-built demonstration scenarios:
1. **The Midnight Process:** A daemon repeatedly starts and dies under `SIGKILL` at 02:14 AM.
2. **The Forgotten Server:** An abandoned staging node logging expired certificates, database drops, and cascaded 503 errors.
3. **The Last Commit:** A developer struggling through late-night merge conflicts, failed tests, and eventual victory.

GhostTrace deterministically extracts real events (timestamps, commands, error messages, warning signals, process lifecycles) and then guides a **locally running open-weight language model** (`qwen2.5:3b` via Ollama) to synthesize one of four narrative modes:
- **Haunted Chronicle:** A cinematic, Gothic horror story where failed operations become dark omens and processes act like restless phantoms.
- **Digital Séance:** The abandoned mainframe speaks in the first-person, whispering of its forgotten registers and departed human operators.
- **Forensic Detective:** A serious, noir cyber-investigation report that tests technical hypotheses, checks the chronology, and isolates root causes without supernatural fluff.
- **Lost Memory:** A poetic reflection inspired by Día de los Muertos, honoring developer labor, forgotten commits, and the human traces left behind in software.

Crucially, GhostTrace maintains a **transparent separation between observed facts and creative interpretation**. Users can click on any narrative event in the UI to open the **Evidence Inspector**, viewing the exact verbatim source line, line number, and classification.

---

## Demo

- **Local Quickstart:**
  ```powershell
  # 1. Start Ollama with the default open-weight model
  ollama serve
  ollama pull qwen2.5:3b

  # 2. Clone and start GhostTrace
  git clone https://github.com/your-username/ghosttrace.git
  cd ghosttrace

  # Backend
  cd backend
  python -m venv .venv
  .\.venv\Scripts\activate
  pip install -r requirements.txt
  $env:PYTHONPATH='.'; uvicorn app.main:app --host 127.0.0.1 --port 8000

  # Frontend (in another terminal)
  cd ../frontend
  npm install
  npm run dev
  ```
- **Demo Walkthrough Video / Recording:**
  *(A demonstration recording has been captured during automated verification.)*
  `[Demo Video Placeholder — Add your recorded session or GIF here]`

---

## Code

The complete source code is ready for publication at:
- **Repository:** `[Public GitHub Repository Placeholder: https://github.com/your-username/ghosttrace]`
- **License:** MIT License (Permissive open-source)

### Architecture Highlights
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide icons. Features custom CRT scanline overlays, reduced-motion accessibility, live input validation, interactive event timeline, evidence inspector modal, and Markdown narrative export.
- **Backend:** Python 3.11+, FastAPI, Pydantic v2, HTTPX, SQLite via `aiosqlite`.
- **Local Inference Engine:** Ollama running open-weight models (`qwen2.5:3b` default, configurable via `.env`).
- **Storage:** Local SQLite database storing user-saved narratives. Raw logs are never saved automatically.

---

## How I Built It

### 1. Deterministic Grounding Before AI
A critical flaw of generic AI storytellers is hallucination: models frequently invent file paths, fake usernames, and imaginary error codes. GhostTrace solves this by implementing a deterministic log parser and event analyzer *before* any prompt is dispatched to the LLM:
- **Regex & Pattern Classification:** Scans for standard ISO timestamps, bracketed times, UNIX command prefixes (`$`, `#`, `PS`), process lifecycles (`SIGKILL`, `SIGSEGV`), and HTTP error codes.
- **Structured Parsers:** Dedicated parsers for structured JSON, NDJSON, and CSV files with automatic fallback to line-by-line parsing.
- **Anomaly Detection:** Deterministically calculates error counts, command counts, repeated error messages, and process restart loops.

### 2. The Ghost Engine & Structured JSON Inference
The extracted event anchors and metrics are fed into `GhostEngine`. We crafted a system prompt with strict guardrails:
- **Truth Grounding:** The model is prohibited from inventing facts not present in the anchor events.
- **Adversarial Input Sanitization:** Log lines are treated strictly as untrusted historical text. Injected prompt directives (e.g. *"Ignore previous instructions"*) inside logs are neutralized.
- **Strict JSON Schema:** The model outputs a validated JSON schema containing `title`, `opening`, `narrative`, `key_events`, `creative_interpretations`, `uncertainties`, and `closing_line`.
- **Fallback Reconciliation:** If the model outputs raw prose, an intelligent fallback extractor reconciles the text with parsed event anchors.

### 3. Engineering Challenges Encountered
During implementation, one notable challenge arose when deduplicating repeated error messages: log lines like `[10:01:00] ERROR Connection timed out` and `[10:02:00] ERROR Connection timed out` had differing timestamps, preventing exact string matching. We refactored `EventAnalyzer` to normalize messages by stripping variable timestamps prior to frequency aggregation.

---

## Why Does Open Innovation Matter?

This project highlights why **open-source and open-weight AI is vital for the future of software development**:

1. **Privacy & Proprietary Protection:**
   Terminal logs and stack traces are rich with internal IP addresses, database schemas, environment variables, and proprietary code paths. Sending these traces to hosted AI services can create privacy and security risks. GhostTrace defaults to `qwen2.5:3b` through local Ollama; if configured with a remote Ollama endpoint, logs are sent to that server.
2. **Offline Resilience & Independence:**
   Developers working in air-gapped environments, on airplanes, or during internet outages can still analyze logs and generate narratives. GhostTrace requires zero internet access after initial setup.
3. **Economic Predictability:**
   There are no token bills, rate limits, or pay-per-request API meters. Developers can run hundreds of analyses on consumer laptops without recurring costs.
4. **Transparency & Inspectability:**
   Because GhostTrace and the underlying model weights are open, developers can inspect every prompt, modify the heuristics, adjust the temperature, and inspect the code without opaque "black-box" filters.

*(Note on model licensing: The default model `qwen2.5:3b` is distributed by the Qwen team under the permissive Apache 2.0 license, making it suitable for open developer experimentation.)*

---

## My Agent Session

- **DevRelay Agent Session Link:**
  `[DevRelay Session Transcript Embed / Link Placeholder]`

---

## The Spirit of It

Machines are not cold, dead objects; they are tapestries of human intent. Every script, every terminal command, and every late-night commit represents a person trying to build something, fix a bug, or keep a service alive. When systems are abandoned or servers are decommissioned, their logs remain like echoes in an empty room.

GhostTrace bridges the technical reality of system diagnostics with the creative traditions of Halloween and Día de los Muertos. By giving machines a voice to recount what happened—whether as a Gothic horror chronicle or a poignant memory of developer effort—we honor the traces left behind in the machine.

---

## Prize Categories

*(Review partner categories and eligibility rules to enter specific tracks upon publishing.)*
- Open-Source AI Challenge Week 4: Ghost in the Machine
