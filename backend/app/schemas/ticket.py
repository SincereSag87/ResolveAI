from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

TicketStatus = Literal["open", "in_review", "resolved", "closed"]
TicketPriority = Literal["low", "medium", "high", "critical"]


class TicketBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5)
    priority: TicketPriority = "medium"
    category: str = Field(default="general", min_length=2, max_length=80)
    assignee: str | None = Field(default=None, max_length=120)


class TicketCreate(TicketBase):
    pass


class TicketUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = Field(default=None, min_length=5)
    status: TicketStatus | None = None
    priority: TicketPriority | None = None
    category: str | None = Field(default=None, min_length=2, max_length=80)
    assignee: str | None = Field(default=None, max_length=120)


class TicketRead(TicketBase):
    id: int
    status: TicketStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
