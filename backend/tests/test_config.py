import pytest
from fastapi import HTTPException

from app.core.config import Settings
from app.db import session


def test_cors_origins_accept_json_string(monkeypatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", '["https://resolveai.example", "https://preview.example"]')

    settings = Settings()

    assert settings.cors_origins == ["https://resolveai.example", "https://preview.example"]


def test_cors_origins_accept_comma_separated_string(monkeypatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", "https://resolveai.example, https://preview.example")

    settings = Settings()

    assert settings.cors_origins == ["https://resolveai.example", "https://preview.example"]


def test_database_url_normalizes_postgres_provider_scheme(monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_URL", "postgres://user:password@example.com:5432/resolveai")

    settings = Settings()

    assert settings.database_url == "postgresql+psycopg://user:password@example.com:5432/resolveai"


def test_database_url_normalizes_default_postgresql_driver(monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:password@example.com:5432/resolveai")

    settings = Settings()

    assert settings.database_url == "postgresql+psycopg://user:password@example.com:5432/resolveai"


def test_database_config_error_does_not_crash_import(monkeypatch) -> None:
    monkeypatch.setattr(session.settings, "database_url", "not a database url")
    session.get_session_local.cache_clear()

    db = session.get_db()

    try:
        with pytest.raises(HTTPException) as exc_info:
            next(db)

        assert exc_info.value.status_code == 503
        assert exc_info.value.detail == "Database is not configured correctly."
    finally:
        session.get_session_local.cache_clear()
