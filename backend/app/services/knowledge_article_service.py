from sqlalchemy.orm import Session

from app.models.knowledge_article import KnowledgeArticle
from app.schemas.knowledge_article import KnowledgeArticleCreate, KnowledgeArticleUpdate


def list_articles(db: Session) -> list[KnowledgeArticle]:
    return db.query(KnowledgeArticle).order_by(KnowledgeArticle.updated_at.desc(), KnowledgeArticle.id.desc()).all()


def get_article(db: Session, article_id: int) -> KnowledgeArticle | None:
    return db.get(KnowledgeArticle, article_id)


def create_article(db: Session, article_data: KnowledgeArticleCreate) -> KnowledgeArticle:
    article = KnowledgeArticle(**article_data.model_dump())
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


def update_article(
    db: Session,
    article: KnowledgeArticle,
    article_data: KnowledgeArticleUpdate,
) -> KnowledgeArticle:
    updates = article_data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(article, field, value)

    db.add(article)
    db.commit()
    db.refresh(article)
    return article


def delete_article(db: Session, article: KnowledgeArticle) -> None:
    db.delete(article)
    db.commit()
