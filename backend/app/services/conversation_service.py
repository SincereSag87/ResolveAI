from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from app.models.conversation import Conversation, Message
from app.schemas.conversation import ConversationCreate, ConversationUpdate, MessageCreate


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
                content=create_mock_agent_response(conversation_data.initial_message),
                source_type="mock",
                source_id="resolveai-placeholder",
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
        db.add(
            Message(
                conversation_id=conversation.id,
                role="agent",
                content=create_mock_agent_response(message_data.content),
                source_type="mock",
                source_id="resolveai-placeholder",
            )
        )

    conversation.updated_at = func.now()
    db.add(conversation)
    db.commit()
    return get_conversation(db, conversation.id) or conversation


def create_mock_agent_response(employee_message: str) -> str:
    preview = employee_message.strip()
    if len(preview) > 120:
        preview = f"{preview[:117]}..."

    return (
        "I captured the issue and would next search the internal knowledge base for matching runbooks. "
        f'For now, this placeholder response is tracking: "{preview}"'
    )
