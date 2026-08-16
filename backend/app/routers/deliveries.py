import uuid
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.models import Delivery, GameEvent, Order, OrderStatus, Player, Rover, RoverStatus
from app.schemas.delivery import DeliveryCreate, DeliveryOut
from app.services.delivery import calc_success, can_deliver, delivery_time_seconds, required_battery

router = APIRouter(prefix="/deliveries", tags=["deliveries"])


@router.post("/", response_model=DeliveryOut, status_code=201)
async def start_delivery(data: DeliveryCreate, db: AsyncSession = Depends(get_db)) -> DeliveryOut:
    """Начинает доставку заказа выбранным ровером."""
    rover = await db.get(Rover, data.rover_id)
    order = await db.get(Order, data.order_id)

    if not rover or not order:
        raise HTTPException(404, "Rover or order not found")

    ok, reason = can_deliver(rover, order)
    if not ok:
        raise HTTPException(409, detail={"reason": reason})

    secs = delivery_time_seconds(rover, order)
    now = datetime.now(UTC)

    delivery = Delivery(
        rover_id=rover.id,
        order_id=order.id,
        started_at=now,
        eta=now + timedelta(seconds=secs),
    )
    db.add(delivery)

    rover.status = RoverStatus.DELIVERING
    rover.current_load += order.weight
    order.status = OrderStatus.IN_PROGRESS

    await db.commit()
    await db.refresh(delivery)

    return DeliveryOut(
        id=delivery.id,
        rover_id=rover.id,
        order_id=order.id,
        eta_seconds=secs,
        status="in_progress",
    )


@router.post("/{delivery_id}/resolve")
async def resolve_delivery(
    delivery_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> dict[str, object]:
    """Завершает доставку и обновляет состояние игрока, ровера и заказа."""
    delivery = await db.get(Delivery, delivery_id)
    if not delivery or delivery.success is not None:
        raise HTTPException(404, "Delivery not found or already resolved")

    rover = await db.get(Rover, delivery.rover_id)
    order = await db.get(Order, delivery.order_id)

    if not rover or not order:
        raise HTTPException(404, "Rover or order not found")

    player = await db.get(Player, rover.player_id)
    if not player:
        raise HTTPException(404, "Player not found")

    success = calc_success(order)
    battery_cost = required_battery(rover, order)
    now = datetime.now(UTC)

    if success:
        reward = order.reward * order.urgency
        player.money += reward
        order.status = OrderStatus.DELIVERED
        rover.battery = max(0.0, rover.battery - battery_cost)
        rover.status = RoverStatus.IDLE
        rover.current_load -= order.weight
        rover.pos_x = order.to_x
        rover.pos_y = order.to_y
        event = GameEvent(
            player_id=player.id,
            event_type="delivered",
            description=f"{rover.name} доставил заказ в зону {order.zone}",
            money_delta=reward,
            rating_delta=2.0,
            created_at=now,
        )
        player.rating = min(100.0, player.rating + 2.0)
    else:
        order.status = OrderStatus.FAILED
        rover.status = RoverStatus.STUCK
        rover.battery = max(0.0, rover.battery - battery_cost * 1.5)
        player.rating = max(0.0, player.rating - 10.0)
        event = GameEvent(
            player_id=player.id,
            event_type="failed",
            description=f"{rover.name} застрял в зоне {order.zone}!",
            money_delta=0,
            rating_delta=-10.0,
            created_at=now,
        )

    delivery.success = success
    db.add(event)
    await db.commit()

    return {
        "success": success,
        "money_delta": event.money_delta,
        "rating_delta": event.rating_delta,
    }
