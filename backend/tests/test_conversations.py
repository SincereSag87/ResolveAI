from fastapi.testclient import TestClient


def test_chat_mock_response_cites_matching_knowledge_article(client: TestClient) -> None:
    article_response = client.post(
        "/api/knowledge-articles",
        json={
            "title": "Laptop encryption recovery",
            "category": "endpoint",
            "summary": "Recover devices blocked by encryption prompts.",
            "body": "Use the endpoint recovery key workflow for BitLocker encryption prompts.",
            "status": "published",
        },
    )
    article_id = article_response.json()["id"]

    conversation_response = client.post(
        "/api/conversations",
        json={
            "title": "Encryption prompt",
            "initial_message": "My laptop has a BitLocker encryption prompt.",
        },
    )

    assert conversation_response.status_code == 201
    conversation = conversation_response.json()
    agent_message = conversation["messages"][-1]

    assert agent_message["role"] == "agent"
    assert agent_message["source_type"] == "knowledge_article"
    assert agent_message["source_id"] == str(article_id)

    followup_response = client.post(
        f"/api/conversations/{conversation['id']}/messages",
        json={"role": "employee", "content": "The encryption recovery key did not work."},
    )

    assert followup_response.status_code == 201
    assert followup_response.json()["messages"][-1]["source_type"] == "knowledge_article"
