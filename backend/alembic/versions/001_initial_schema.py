"""initial schema

Revision ID: 001_initial
Revises:
Create Date: 2026-02-18
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=True),
        sa.Column("provider", sa.String(50), nullable=True),
        sa.Column("provider_account_id", sa.String(255), nullable=True),
        sa.Column("preferred_llm", sa.String(20), nullable=False, server_default="openai"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # JD Sets table
    op.create_table(
        "jd_sets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("name", sa.String(255), nullable=False, server_default="Untitled Workspace"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # JD Items table
    op.create_table(
        "jd_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "jd_set_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("jd_sets.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("raw_text", sa.Text, nullable=False),
        sa.Column("label_title", sa.String(255), nullable=True),
        sa.Column("label_company", sa.String(255), nullable=True),
        sa.Column("is_muted", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Chat Sessions table
    op.create_table(
        "chat_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "jd_set_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("jd_sets.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Chat Messages table
    op.create_table(
        "chat_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "session_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("chat_sessions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("token_count", sa.Integer, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Indexes
    op.create_index("ix_jd_items_jd_set_id", "jd_items", ["jd_set_id"])
    op.create_index("ix_chat_sessions_jd_set_id", "chat_sessions", ["jd_set_id"])
    op.create_index("ix_chat_messages_session_id", "chat_messages", ["session_id"])


def downgrade() -> None:
    op.drop_index("ix_chat_messages_session_id")
    op.drop_index("ix_chat_sessions_jd_set_id")
    op.drop_index("ix_jd_items_jd_set_id")
    op.drop_table("chat_messages")
    op.drop_table("chat_sessions")
    op.drop_table("jd_items")
    op.drop_table("jd_sets")
    op.drop_table("users")
