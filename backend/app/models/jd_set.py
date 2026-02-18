import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class JDSet(Base, TimestampMixin):
    __tablename__ = "jd_sets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), default="Untitled Comparison")

    user = relationship("User", back_populates="jd_sets")
    items = relationship("JDItem", back_populates="jd_set", cascade="all, delete-orphan")
    chat_sessions = relationship(
        "ChatSession", back_populates="jd_set", cascade="all, delete-orphan"
    )
