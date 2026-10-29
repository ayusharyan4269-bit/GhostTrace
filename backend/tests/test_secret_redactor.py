from app.services.secret_redactor import redact_secrets


def test_redacts_common_credentials_and_is_idempotent():
    redacted, count = redact_secrets("api_key=demo-secret\nAuthorization: Bearer abc123")
    assert count == 2
    assert "demo-secret" not in redacted
    assert "abc123" not in redacted
    assert redact_secrets(redacted) == (redacted, 0)


def test_keeps_ordinary_log_text_unchanged():
    text = "INFO server started successfully"
    assert redact_secrets(text) == (text, 0)


def test_redacts_environment_variable_names_and_database_url_credentials():
    source = "GITHUB_TOKEN=demo-token\nAWS_SECRET_ACCESS_KEY=demo-aws-secret\nDATABASE_URL=postgres://alice:demo-password@db.example/app"
    redacted, count = redact_secrets(source)
    assert count == 3
    assert "demo-token" not in redacted
    assert "demo-aws-secret" not in redacted
    assert "alice:demo-password" not in redacted
