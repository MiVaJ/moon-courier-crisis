import math

from app.models.models import Order, Rover, RoverStatus

PIXEL_TO_KM = 0.1
MAX_BATTERY_DISTANCE = 80.0  # км на полном заряде без груза


def distance_km(rover: Rover, order: Order) -> float:
    """Рассчитывает расстояние от точки отправления до точки доставки в километрах."""
    px = math.sqrt((order.to_x - order.from_x) ** 2 + (order.to_y - order.from_y) ** 2)
    return px * PIXEL_TO_KM


def required_battery(rover: Rover, order: Order) -> float:
    """Рассчитывает процент заряда, необходимый роверу для выполнения заказа."""
    dist = distance_km(rover, order)
    weight_ratio = order.weight / rover.max_load  # 0–1+
    risk_mult = 1 + order.risk  # 1.1–1.8
    load_mult = 1 + weight_ratio * 0.5  # тяжёлый заказ жрёт батарею
    return (dist / MAX_BATTERY_DISTANCE) * 100 * risk_mult * load_mult


def delivery_time_seconds(rover: Rover, order: Order) -> int:
    """Рассчитывает время доставки заказа в секундах с учётом веса груза."""
    dist = distance_km(rover, order)
    weight_ratio = order.weight / rover.max_load
    base_speed = 30.0  # км/ч
    actual_speed = base_speed / (1 + weight_ratio * 0.4)
    hours = dist / actual_speed
    return max(5, int(hours * 3600))  # минимум 5 секунд для UX


def can_deliver(rover: Rover, order: Order) -> tuple[bool, str]:
    """Проверяет, может ли ровер выполнить заказ, и возвращает причину отказа."""
    if rover.status != RoverStatus.IDLE:
        return False, "rover_busy"
    if rover.current_load + order.weight > rover.max_load:
        return False, "overload"
    needed = required_battery(rover, order)
    if rover.battery < needed:
        return False, "not_enough_battery"
    if needed > 100:
        return False, "impossible_route"  # маршрут физически невозможен
    return True, "ok"


def calc_success(order: Order) -> bool:
    """Определяет успешность доставки с учётом риска зоны."""
    import random

    # риск зоны = шанс провала
    return random.random() > order.risk * 0.4  # noqa: S311
