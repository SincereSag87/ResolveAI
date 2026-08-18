from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.conversation import (
    ConversationCreate,
    ConversationRead,
    ConversationSummary,
    ConversationUpdate,
    MessageCreate,
)
from app.services import conversation_service

router = APIRouter(prefix="/conversations")


@router.get("", response_model=list[ConversationSummary])
def list_conversations(db: Session = Depends(get_db)) -> list[ConversationSummary]:
    conversations = conversation_service.list_conversations(db)
    return [
        ConversationSummary.model_validate(
            {
                **conversation.__dict__,
                "message_count": len(conversation.messages),
            }
        )
        for conversation in conversations
    ]


@router.post("", response_model=ConversationRead, status_code=status.HTTP_201_CREATED)
def create_conversation(
    conversation_data: ConversationCreate,
    db: Session = Depends(get_db),
) -> ConversationRead:
    return conversation_service.create_conversation(db, conversation_data)


@router.get("/{conversation_id}", response_model=ConversationRead)
def get_conversation(conversation_id: int, db: Session = Depends(get_db)) -> ConversationRead:
    conversation = conversation_service.get_conversation(db, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return conversation


@router.patch("/{conversation_id}", response_model=ConversationRead)
def update_conversation(
    conversation_id: int,
    conversation_data: ConversationUpdate,
    db: Session = Depends(get_db),
) -> ConversationRead:
    conversation = conversation_service.get_conversation(db, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return conversation_service.update_conversation(db, conversation, conversation_data)


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(conversation_id: int, db: Session = Depends(get_db)) -> None:
    conversation = conversation_service.get_conversation(db, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    conversation_service.delete_conversation(db, conversation)


@router.post("/{conversation_id}/messages", response_model=ConversationRead, status_code=status.HTTP_201_CREATED)
def add_message(
    conversation_id: int,
    message_data: MessageCreate,
    db: Session = Depends(get_db),
) -> ConversationRead:
    conversation = conversation_service.get_conversation(db, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return conversation_service.add_message(db, conversation, message_data)
