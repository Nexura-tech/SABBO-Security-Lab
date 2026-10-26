
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_analyze_endpoint_reports_all_headers_missing():
    response = client.post(
        "/api/security-headers/analyze",
        json={"headers": {}},
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total_headers"] == 6
    assert data["present_headers"] == 0
    assert data["missing_headers"] == 6
    assert len(data["findings"]) == 6


def test_analyze_endpoint_counts_present_headers():
    response = client.post(
        "/api/security-headers/analyze",
        json={
            "headers": {
                "Content-Security-Policy": "default-src 'self'",
                "X-Content-Type-Options": "nosniff",
            }
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total_headers"] == 6
    assert data["present_headers"] == 2
    assert data["missing_headers"] == 4

    findings = {
        item["header"]: item
        for item in data["findings"]
    }

    assert (
        findings["Content-Security-Policy"]["status"]
        == "present"
    )
    assert (
        findings["X-Content-Type-Options"]["status"]
        == "present"
    )


def test_analyze_endpoint_rejects_invalid_request():
    response = client.post(
        "/api/security-headers/analyze",
        json={},
    )

    assert response.status_code == 422


def test_analyze_endpoint_rejects_extra_request_fields():
    response = client.post(
        "/api/security-headers/analyze",
        json={"headers": {}, "unexpected": True},
    )

    assert response.status_code == 422


def test_analyze_endpoint_rejects_empty_header_name():
    response = client.post(
        "/api/security-headers/analyze",
        json={"headers": {"": "example"}},
    )

    assert response.status_code == 422


def test_analyze_endpoint_rejects_invalid_header_name():
    response = client.post(
        "/api/security-headers/analyze",
        json={"headers": {"Bad Header Name": "example"}},
    )

    assert response.status_code == 422


def test_analyze_endpoint_rejects_newlines_in_header_value():
    response = client.post(
        "/api/security-headers/analyze",
        json={"headers": {"X-Test": "safe\nInjected: value"}},
    )

    assert response.status_code == 422

def test_analyze_endpoint_rejects_more_than_100_headers():
    headers = {
        f"X-Custom-{index}": "value"
        for index in range(101)
    }

    response = client.post(
        "/api/security-headers/analyze",
        json={"headers": headers},
    )

    assert response.status_code == 422
