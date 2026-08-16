import uuid

from pydantic import BaseModel


class DeliveryCreate(BaseModel):
    """Схема данных для запуска доставки."""

    rover_id: uuid.UUID
    order_id: uuid.UUID


class DeliveryOut(BaseModel):
    """Схема ответа с информацией о запущенной доставке."""

    id: uuid.UUID
    rover_id: uuid.UUID
    order_id: uuid.UUID
    eta_seconds: int
    status: str

    model_config = {"from_attributes": True}
