import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.models import Order, OrderStatus, Player, Rover
from app.services.order_generator import generate_orders

router = APIRouter(prefix="/game", tags=["game"])


@router.get("/{player_id}/rovers")
async def get_rovers(player_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> list[Rover]:
    """Возвращает список роверов, принадлежащих игроку."""
    result = await db.execute(select(Rover).where(Rover.player_id == player_id))
    return list(result.scalars().all())


@router.get("/{player_id}/orders")
async def get_orders(player_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> list[Order]:
    """Возвращает активные заказы игрока, ожидающие выполнения."""
    result = await db.execute(
        select(Order).where(Order.player_id == player_id, Order.status == OrderStatus.PENDING)
    )
    return list(result.scalars().all())


@router.post("/{player_id}/orders/generate")
async def gen_orders(player_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> dict[str, int]:
    """Генерирует новые заказы для игрока и сохраняет их в базе данных."""
    player = await db.get(Player, player_id)
    if not player:
        raise HTTPException(404, "Player not found")
    orders = generate_orders(player_id, count=4 + player.day)
    for o in orders:
        db.add(o)
    await db.commit()
    return {"generated": len(orders)}
