import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.models import Player, Rover
from app.schemas.player import PlayerCreate, PlayerOut

router = APIRouter(prefix="/players", tags=["players"])

STARTER_ROVERS = [
    {"name": "Lunokhod-1", "max_load": 50.0, "pos_x": 150, "pos_y": 300},
    {"name": "Lunokhod-2", "max_load": 30.0, "pos_x": 150, "pos_y": 320},
]


@router.post("/", response_model=PlayerOut, status_code=201)
async def create_player(data: PlayerCreate, db: AsyncSession = Depends(get_db)) -> PlayerOut:
    """Создаёт нового игрока и добавляет ему два стартовых ровера."""
    existing = await db.scalar(select(Player).where(Player.nickname == data.nickname))
    if existing:
        raise HTTPException(409, "Nickname already taken")

    player = Player(nickname=data.nickname)
    db.add(player)
    await db.flush()

    for r in STARTER_ROVERS:
        db.add(Rover(player_id=player.id, **r))

    await db.commit()
    await db.refresh(player)
    return PlayerOut.model_validate(player)


@router.get("/{player_id}", response_model=PlayerOut)
async def get_player(player_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> PlayerOut:
    """Возвращает игрока по его уникальному идентификатору."""
    player = await db.get(Player, player_id)
    if not player:
        raise HTTPException(404, "Player not found")
    return PlayerOut.model_validate(player)


@router.patch("/{player_id}/tutorial", response_model=PlayerOut)
async def complete_tutorial(player_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> PlayerOut:
    """Отмечает обучение игрока как завершённое."""
    player = await db.get(Player, player_id)
    if not player:
        raise HTTPException(404, "Player not found")
    player.tutorial_done = True
    await db.commit()
    await db.refresh(player)
    return PlayerOut.model_validate(player)
