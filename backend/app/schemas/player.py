import uuid

from pydantic import BaseModel, Field


class PlayerCreate(BaseModel):
    """Схема данных для создания нового игрока."""

    nickname: str = Field(min_length=2, max_length=32)


class PlayerOut(BaseModel):
    """Схема ответа с информацией об игроке."""

    id: uuid.UUID
    nickname: str
    money: int
    rating: float
    tutorial_done: bool
    day: int

    model_config = {"from_attributes": True}
