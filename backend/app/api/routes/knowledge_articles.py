from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.knowledge_article import (
    KnowledgeArticleCreate,
    KnowledgeArticleRead,
    KnowledgeArticleUpdate,
)
from app.services import knowledge_article_service

router = APIRouter(prefix="/knowledge-articles")


@router.get("", response_model=list[KnowledgeArticleRead])
def list_articles(db: Session = Depends(get_db)) -> list[KnowledgeArticleRead]:
    return knowledge_article_service.list_articles(db)


@router.get("/search", response_model=list[KnowledgeArticleRead])
def search_articles(q: str, db: Session = Depends(get_db)) -> list[KnowledgeArticleRead]:
    return knowledge_article_service.search_articles(db, q)


@router.post("", response_model=KnowledgeArticleRead, status_code=status.HTTP_201_CREATED)
def create_article(
    article_data: KnowledgeArticleCreate,
    db: Session = Depends(get_db),
) -> KnowledgeArticleRead:
    return knowledge_article_service.create_article(db, article_data)


@router.get("/{article_id}", response_model=KnowledgeArticleRead)
def get_article(article_id: int, db: Session = Depends(get_db)) -> KnowledgeArticleRead:
    article = knowledge_article_service.get_article(db, article_id)
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge article not found")
    return article


@router.patch("/{article_id}", response_model=KnowledgeArticleRead)
def update_article(
    article_id: int,
    article_data: KnowledgeArticleUpdate,
    db: Session = Depends(get_db),
) -> KnowledgeArticleRead:
    article = knowledge_article_service.get_article(db, article_id)
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge article not found")
    return knowledge_article_service.update_article(db, article, article_data)


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(article_id: int, db: Session = Depends(get_db)) -> None:
    article = knowledge_article_service.get_article(db, article_id)
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge article not found")
    knowledge_article_service.delete_article(db, article)
