from fastapi.testclient import TestClient


def test_ticket_crud(client: TestClient) -> None:
    create_response = client.post(
        "/api/tickets",
        json={
            "title": "VPN access failing",
            "description": "Employee cannot connect after password reset.",
            "priority": "high",
            "category": "networking",
            "assignee": "Service Desk",
        },
    )

    assert create_response.status_code == 201
    ticket = create_response.json()
    assert ticket["status"] == "open"
    assert ticket["priority"] == "high"

    list_response = client.get("/api/tickets")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    patch_response = client.patch(f"/api/tickets/{ticket['id']}", json={"status": "in_review"})
    assert patch_response.status_code == 200
    assert patch_response.json()["status"] == "in_review"

    delete_response = client.delete(f"/api/tickets/{ticket['id']}")
    assert delete_response.status_code == 204

    missing_response = client.get(f"/api/tickets/{ticket['id']}")
    assert missing_response.status_code == 404
