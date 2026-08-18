from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

ArticleStatus = Literal["draft", "published", "archived"]


class KnowledgeArticleBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    category: str = Field(min_length=2, max_length=80)
    summary: str = Field(min_length=5, max_length=500)
    body: str = Field(min_length=10)
    source_url: str | None = Field(default=None, max_length=500)
    status: ArticleStatus = "draft"


class KnowledgeArticleCreate(KnowledgeArticleBase):
    pass


class KnowledgeArticleUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    category: str | None = Field(default=None, min_length=2, max_length=80)
    summary: str | None = Field(default=None, min_length=5, max_length=500)
    body: str | None = Field(default=None, min_length=10)
    source_url: str | None = Field(default=None, max_length=500)
    status: ArticleStatus | None = None


class KnowledgeArticleRead(KnowledgeArticleBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
