from fastapi.testclient import TestClient


def test_knowledge_article_crud_and_search(client: TestClient) -> None:
    create_response = client.post(
        "/api/knowledge-articles",
        json={
            "title": "VPN credential reset guide",
            "category": "networking",
            "summary": "Fix VPN login after password reset.",
            "body": "Clear stale VPN credentials from credential manager before retrying.",
            "source_url": "https://intranet.example/vpn",
            "status": "published",
        },
    )

    assert create_response.status_code == 201
    article = create_response.json()
    assert article["status"] == "published"

    search_response = client.get("/api/knowledge-articles/search", params={"q": "VPN password reset"})
    assert search_response.status_code == 200
    assert [match["id"] for match in search_response.json()] == [article["id"]]

    patch_response = client.patch(f"/api/knowledge-articles/{article['id']}", json={"status": "archived"})
    assert patch_response.status_code == 200
    assert patch_response.json()["status"] == "archived"

    delete_response = client.delete(f"/api/knowledge-articles/{article['id']}")
    assert delete_response.status_code == 204
