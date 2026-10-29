import pytest


@pytest.mark.asyncio
async def test_session_lifecycle(async_client):
    # 1. Create a session explicitly
    payload = {
        "title": "Midnight Daemon Incident",
        "mode": "haunted_chronicle",
        "summary": {
            "total_lines": 12,
            "extracted_events_count": 10,
            "errors_count": 3,
            "warnings_count": 1,
            "commands_count": 2,
            "detected_patterns": ["Process restart loop"]
        },
        "narrative": {
            "title": "The Ghost in the Daemon",
            "selected_mode": "haunted_chronicle",
            "opening": "It began at midnight...",
            "narrative": "A long narrative of events...",
            "key_events": [],
            "creative_interpretations": [],
            "uncertainties": [],
            "closing_line": "All went dark."
        },
        "notes": "Investigation notes for demo"
    }

    create_res = await async_client.post("/api/sessions", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    session_id = created_data["session_id"]
    assert session_id.startswith("gt_")
    assert created_data["title"] == "Midnight Daemon Incident"

    # 2. List sessions
    list_res = await async_client.get("/api/sessions")
    assert list_res.status_code == 200
    sessions = list_res.json()
    assert len(sessions) >= 1
    found = next((s for s in sessions if s["session_id"] == session_id), None)
    assert found is not None
    assert found["errors_count"] == 3
    # Check that raw logs are NOT in list response
    assert "log_content" not in found
    assert "raw_text" not in found

    # 3. Retrieve session details
    get_res = await async_client.get(f"/api/sessions/{session_id}")
    assert get_res.status_code == 200
    detail = get_res.json()
    assert detail["title"] == "Midnight Daemon Incident"
    assert detail["narrative"]["closing_line"] == "All went dark."

    # 4. Rename / update session
    patch_res = await async_client.patch(
        f"/api/sessions/{session_id}",
        json={"title": "Renamed Daemon Incident", "notes": "Updated note"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["title"] == "Renamed Daemon Incident"
    assert patch_res.json()["notes"] == "Updated note"

    # 5. Delete specific session
    del_res = await async_client.delete(f"/api/sessions/{session_id}")
    assert del_res.status_code == 200

    # 6. Verify 404 after deletion
    get_again = await async_client.get(f"/api/sessions/{session_id}")
    assert get_again.status_code == 404

    # 7. Clear all sessions
    clear_res = await async_client.delete("/api/sessions")
    assert clear_res.status_code == 200
    assert "cleared_count" in clear_res.json()
