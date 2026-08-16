import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.models import OrderStatus, RoverStatus


class RoverOut(BaseModel):
    """Данные ровера для передачи клиенту."""

    id: uuid.UUID
    name: str
    battery: float
    max_load: float
    current_load: float
    status: RoverStatus
    pos_x: float
    pos_y: float

    model_config = ConfigDict(from_attributes=True)


class OrderOut(BaseModel):
    """Данные заказа для передачи клиенту."""

    id: uuid.UUID
    weight: float
    reward: int
    urgency: int
    risk: float
    from_x: float
    from_y: float
    to_x: float
    to_y: float
    zone: str
    status: OrderStatus

    model_config = ConfigDict(from_attributes=True)


class GameEventOut(BaseModel):
    """Игровое событие для отображения клиенту."""

    id: uuid.UUID
    event_type: str
    description: str
    money_delta: int
    rating_delta: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
