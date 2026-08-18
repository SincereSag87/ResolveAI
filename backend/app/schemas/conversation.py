from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

ConversationStatus = Literal["active", "resolved", "escalated", "closed"]
MessageRole = Literal["employee", "agent", "system"]


class MessageBase(BaseModel):
    role: MessageRole = "employee"
    content: str = Field(min_length=1)
    source_type: str | None = Field(default=None, max_length=80)
    source_id: str | None = Field(default=None, max_length=120)


class MessageCreate(MessageBase):
    pass


class MessageRead(MessageBase):
    id: int
    conversation_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    employee_email: str | None = Field(default=None, max_length=255)


class ConversationCreate(ConversationBase):
    initial_message: str | None = Field(default=None, min_length=1)


class ConversationUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    status: ConversationStatus | None = None
    employee_email: str | None = Field(default=None, max_length=255)


class ConversationRead(ConversationBase):
    id: int
    status: ConversationStatus
    created_at: datetime
    updated_at: datetime
    messages: list[MessageRead] = []

    model_config = ConfigDict(from_attributes=True)


class ConversationSummary(ConversationBase):
    id: int
    status: ConversationStatus
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    model_config = ConfigDict(from_attributes=True)
