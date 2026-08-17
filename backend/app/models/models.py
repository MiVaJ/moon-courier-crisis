import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Базовый класс для моделей приложения."""


class RoverStatus(enum.StrEnum):
    """Возможные состояния ровера."""

    IDLE = "idle"
    DELIVERING = "delivering"
    STUCK = "stuck"
    CHARGING = "charging"


class OrderStatus(enum.StrEnum):
    """Возможные состояния заказа."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    DELIVERED = "delivered"
    FAILED = "failed"


class Player(Base):
    """Профиль игрока и его текущее игровое состояние."""

    __tablename__ = "players"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    nickname: Mapped[str] = mapped_column(
        String(32),
        unique=True,
        nullable=False,
    )
    money: Mapped[int] = mapped_column(
        Integer,
        default=500,
        nullable=False,
    )
    rating: Mapped[float] = mapped_column(
        Float,
        default=100.0,
        nullable=False,
    )
    tutorial_done: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    day: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    rovers: Mapped[list["Rover"]] = relationship(
        back_populates="player",
    )
    orders: Mapped[list["Order"]] = relationship(
        back_populates="player",
    )
    events: Mapped[list["GameEvent"]] = relationship(
        back_populates="player",
    )


class Rover(Base):
    """Ровер игрока, используемый для выполнения доставок."""

    __tablename__ = "rovers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    player_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("players.id"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
    )
    battery: Mapped[float] = mapped_column(
        Float,
        default=100.0,
        nullable=False,
    )  # 0–100%
    max_load: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )  # кг
    current_load: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )  # кг
    status: Mapped[RoverStatus] = mapped_column(
        SAEnum(RoverStatus),
        default=RoverStatus.IDLE,
        nullable=False,
    )
    pos_x: Mapped[float] = mapped_column(
        Float,
        default=150.0,
    )
    pos_y: Mapped[float] = mapped_column(
        Float,
        default=300.0,
    )

    player: Mapped["Player"] = relationship(
        back_populates="rovers",
    )
    deliveries: Mapped[list["Delivery"]] = relationship(
        back_populates="rover",
    )


class Order(Base):
    """Заказ на доставку, доступный игроку."""

    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    player_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("players.id"),
        nullable=False,
    )
    weight: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )  # кг
    reward: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    urgency: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )  # 1–3
    risk: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )  # 0.0–1.0
    from_x: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    from_y: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    to_x: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    to_y: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    zone: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
    )  # safe/medium/danger
    status: Mapped[OrderStatus] = mapped_column(
        SAEnum(OrderStatus),
        default=OrderStatus.PENDING,
        nullable=False,
    )
    player: Mapped["Player"] = relationship(
        back_populates="orders",
    )
    delivery: Mapped["Delivery | None"] = relationship(
        back_populates="order",
        uselist=False,
    )


class Delivery(Base):
    """Попытка выполнения заказа с привязкой ровера к заказу."""

    __tablename__ = "deliveries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    rover_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("rovers.id"),
        nullable=False,
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("orders.id"),
        nullable=False,
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    eta: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    success: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
    )  # None = доставка выполняется
    rover: Mapped["Rover"] = relationship(
        back_populates="deliveries",
    )
    order: Mapped["Order"] = relationship(
        back_populates="delivery",
    )


class GameEvent(Base):
    """Игровое событие, изменяющее или фиксирующее состояние игрока."""

    __tablename__ = "game_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    player_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("players.id"),
        nullable=False,
    )
    event_type: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
    )  # delivered/failed/stuck
    description: Mapped[str] = mapped_column(
        String(256),
        nullable=False,
    )
    money_delta: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    rating_delta: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    player: Mapped["Player"] = relationship(
        back_populates="events",
    )
