"""create knowledge articles

Revision ID: 202608180003
Revises: 202608180002
Create Date: 2026-08-18 00:03:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "202608180003"
down_revision: str | None = "202608180002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "knowledge_articles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=False),
        sa.Column("summary", sa.String(length=500), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_knowledge_articles_category"), "knowledge_articles", ["category"], unique=False)
    op.create_index(op.f("ix_knowledge_articles_id"), "knowledge_articles", ["id"], unique=False)
    op.create_index(op.f("ix_knowledge_articles_status"), "knowledge_articles", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_knowledge_articles_status"), table_name="knowledge_articles")
    op.drop_index(op.f("ix_knowledge_articles_id"), table_name="knowledge_articles")
    op.drop_index(op.f("ix_knowledge_articles_category"), table_name="knowledge_articles")
    op.drop_table("knowledge_articles")
