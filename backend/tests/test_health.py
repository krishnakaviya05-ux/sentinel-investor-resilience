"""Tests for GET /api/v1/health."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_returns_200():
    assert client.get("/api/v1/health").status_code == 200


def test_health_body():
    data = client.get("/api/v1/health").json()
    assert data["status"] == "healthy"
    assert data["service"] == "sentinel-backend"
    assert "version" in data


def test_health_content_type():
    r = client.get("/api/v1/health")
    assert "application/json" in r.headers["content-type"]
