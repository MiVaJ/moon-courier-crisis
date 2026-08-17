import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.models import Delivery, GameEvent, Order, OrderStatus, Player, Rover, RoverStatus
from app.schemas.game import GameEventOut, OrderOut, RoverOut
from app.services.delivery import calc_success, required_battery
from app.services.order_generator import generate_orders

router = APIRouter(prefix="/game", tags=["game"])


@router.get("/{player_id}/rovers", response_model=list[RoverOut])
async def get_rovers(
    player_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[RoverOut]:
    """Возвращает список роверов, принадлежащих игроку."""
    result = await db.execute(select(Rover).where(Rover.player_id == player_id))
    return [RoverOut.model_validate(rover) for rover in result.scalars().all()]


@router.get("/{player_id}/orders", response_model=list[OrderOut])
async def get_orders(
    player_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[OrderOut]:
    """Возвращает активные заказы игрока, ожидающие выполнения."""
    result = await db.execute(
        select(Order).where(
            Order.player_id == player_id,
            Order.status == OrderStatus.PENDING,
        )
    )
    return [OrderOut.model_validate(order) for order in result.scalars().all()]


@router.post("/{player_id}/orders/generate")
async def gen_orders(
    player_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> dict[str, int]:
    """Генерирует новые заказы для игрока и сохраняет их в базе данных."""
    player = await db.get(Player, player_id)
    if not player:
        raise HTTPException(404, "Player not found")
    orders = generate_orders(player_id, count=4 + player.day)
    for o in orders:
        db.add(o)
    await db.commit()
    return {"generated": len(orders)}


@router.post("/{player_id}/next-day")
async def next_day(
    player_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> dict[str, int]:
    """Переводит игрока на следующий игровой день и восстанавливает роверы."""
    player = await db.get(Player, player_id)
    if not player:
        raise HTTPException(404)

    player.day += 1

    # восстанавливаем батарею свободных роверов на 30%.
    result = await db.execute(
        select(Rover).where(
            Rover.player_id == player_id,
            Rover.status == RoverStatus.IDLE,
        )
    )
    for rover in result.scalars():
        rover.battery = min(100.0, rover.battery + 30.0)

    # разблокировать STUCK (застрявших) роверов (за штраф)
    result2 = await db.execute(
        select(Rover).where(
            Rover.player_id == player_id,
            Rover.status == RoverStatus.STUCK,
        )
    )
    for rover in result2.scalars():
        rover.status = RoverStatus.IDLE
        rover.battery = 20.0
        rover.current_load = 0.0
        player.money -= 100  # стоимость спасательной операции

    await db.commit()
    return {"day": player.day, "money": player.money}


@router.get("/{player_id}/events", response_model=list[GameEventOut])
async def get_events(
    player_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[GameEventOut]:
    """Возвращает последние 10 игровых событий игрока."""
    result = await db.execute(
        select(GameEvent)
        .where(GameEvent.player_id == player_id)
        .order_by(GameEvent.created_at.desc())
        .limit(10)
    )
    return [GameEventOut.model_validate(event) for event in result.scalars().all()]


@router.post("/{player_id}/resolve-pending")
async def resolve_pending(
    player_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> dict[str, int]:
    """Резолвит все просроченные доставки игрока после перезагрузки."""
    result = await db.execute(
        select(Delivery)
        .join(Rover, Delivery.rover_id == Rover.id)
        .where(
            Rover.player_id == player_id,
            Delivery.success.is_(None),
            Delivery.eta <= datetime.now(UTC),
        )
    )
    deliveries = result.scalars().all()

    player = await db.get(Player, player_id)
    if not player:
        raise HTTPException(404)

    for delivery in deliveries:
        rover = await db.get(Rover, delivery.rover_id)
        order = await db.get(Order, delivery.order_id)
        if not rover or not order:
            continue

        success = calc_success(order)
        battery_cost = required_battery(rover, order)

        if success:
            player.money += order.reward * order.urgency
            order.status = OrderStatus.DELIVERED
            rover.battery = max(0.0, rover.battery - battery_cost)
            rover.status = RoverStatus.IDLE
            rover.current_load -= order.weight
            rover.pos_x = order.to_x
            rover.pos_y = order.to_y
            player.rating = min(100.0, player.rating + 2.0)
        else:
            order.status = OrderStatus.FAILED
            rover.status = RoverStatus.STUCK
            rover.battery = max(0.0, rover.battery - battery_cost * 1.5)
            player.rating = max(0.0, player.rating - 10.0)

        delivery.success = success

    await db.commit()
    return {"resolved": len(deliveries)}
