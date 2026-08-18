from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from app.models.conversation import Conversation, Message
from app.models.knowledge_article import KnowledgeArticle
from app.schemas.conversation import ConversationCreate, ConversationUpdate, MessageCreate
from app.services.knowledge_article_service import search_articles


def list_conversations(db: Session) -> list[Conversation]:
    return (
        db.query(Conversation)
        .options(selectinload(Conversation.messages))
        .order_by(Conversation.updated_at.desc(), Conversation.id.desc())
        .all()
    )


def get_conversation(db: Session, conversation_id: int) -> Conversation | None:
    return (
        db.query(Conversation)
        .options(selectinload(Conversation.messages))
        .filter(Conversation.id == conversation_id)
        .first()
    )


def create_conversation(db: Session, conversation_data: ConversationCreate) -> Conversation:
    conversation = Conversation(
        title=conversation_data.title,
        employee_email=conversation_data.employee_email,
    )
    db.add(conversation)
    db.flush()

    if conversation_data.initial_message:
        matching_articles = search_articles(db, conversation_data.initial_message, limit=3)
        db.add(
            Message(
                conversation_id=conversation.id,
                role="employee",
                content=conversation_data.initial_message,
            )
        )
        db.add(
            Message(
                conversation_id=conversation.id,
                role="agent",
                content=create_mock_agent_response(conversation_data.initial_message, matching_articles),
                source_type="knowledge_article" if matching_articles else "mock",
                source_id=create_source_id(matching_articles) if matching_articles else "resolveai-placeholder",
            )
        )

    db.commit()
    return get_conversation(db, conversation.id) or conversation


def update_conversation(
    db: Session,
    conversation: Conversation,
    conversation_data: ConversationUpdate,
) -> Conversation:
    updates = conversation_data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(conversation, field, value)

    db.add(conversation)
    db.commit()
    return get_conversation(db, conversation.id) or conversation


def delete_conversation(db: Session, conversation: Conversation) -> None:
    db.delete(conversation)
    db.commit()


def add_message(db: Session, conversation: Conversation, message_data: MessageCreate) -> Conversation:
    db.add(
        Message(
            conversation_id=conversation.id,
            **message_data.model_dump(),
        )
    )

    if message_data.role == "employee":
        db.flush()
        matching_articles = search_articles(db, message_data.content, limit=3)
        db.add(
            Message(
                conversation_id=conversation.id,
                role="agent",
                content=create_mock_agent_response(message_data.content, matching_articles),
                source_type="knowledge_article" if matching_articles else "mock",
                source_id=create_source_id(matching_articles) if matching_articles else "resolveai-placeholder",
            )
        )

    conversation.updated_at = func.now()
    db.add(conversation)
    db.commit()
    return get_conversation(db, conversation.id) or conversation


def create_source_id(articles: list[KnowledgeArticle]) -> str:
    return ",".join(str(article.id) for article in articles)


def create_mock_agent_response(employee_message: str, articles: list[KnowledgeArticle] | None = None) -> str:
    preview = employee_message.strip()
    if len(preview) > 120:
        preview = f"{preview[:117]}..."

    if articles:
        article_titles = ", ".join(article.title for article in articles)
        return (
            "I found potentially relevant knowledge base articles using deterministic keyword search: "
            f"{article_titles}. "
            f'For now, this placeholder response is tracking: "{preview}"'
        )

    return (
        "I did not find a matching knowledge base article with deterministic keyword search. "
        f'For now, this placeholder response is tracking: "{preview}"'
    )
