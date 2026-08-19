from collections.abc import Generator
from functools import lru_cache

from fastapi import HTTPException, status
from sqlalchemy import create_engine
from sqlalchemy.exc import ArgumentError
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    pass


@lru_cache
def get_session_local() -> sessionmaker[Session]:
    engine = create_engine(settings.database_url, pool_pre_ping=True)
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    try:
        session_local = get_session_local()
    except ArgumentError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not configured correctly.",
        ) from exc

    db = session_local()
    try:
        yield db
    finally:
        db.close()
