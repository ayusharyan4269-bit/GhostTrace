# GhostTrace browser smoke test

Start both services from the project root with `.\dev.ps1`, then open `http://localhost:5173`.

1. Confirm the page renders, including when Windows **Settings → Accessibility → Visual effects → Animation effects** is turned off. Scanlines may disappear; the app must remain visible.
2. Click Paste, Upload, and Built-in Scenarios. Select a scenario and confirm its log appears in the editor.
3. Click each narrative mode, change story length and tone, then run **Analyze & Summon Story** with Ollama available.
4. Open a narrative anchor and an inline `[evt_001]` citation. Confirm both show the source line and evidence. Save a session, reopen it, and confirm its anchor evidence still opens.
5. Try a synthetic log containing `api_key=demo-secret-value`. Confirm a redaction preview appears and only the redacted text is analyzed. Never use a real credential for this check.
6. Export Markdown, then verify the downloaded file contains the narrative and evidence references.
7. Toggle scanlines, refresh backend health, open Privacy, and open Session History. Confirm each control responds.
8. Stop Ollama and analyze again. Parsing/timeline should remain available and the UI should explain that narrative generation is unavailable.

Redaction is best-effort pattern matching. Review the preview and avoid pasting real secrets; custom formats may not be detected.
