from fastapi import APIRouter

from app.api.routes import conversations, health, knowledge_articles, tickets

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(tickets.router, tags=["tickets"])
api_router.include_router(conversations.router, tags=["conversations"])
api_router.include_router(knowledge_articles.router, tags=["knowledge articles"])
