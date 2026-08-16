import random
import uuid
from typing import TypedDict

from app.models.models import Order


class Zone(TypedDict):
    """Описывает игровую зону с уровнем риска и доступными точками."""

    name: str
    risk: float
    points: list[tuple[int, int]]


ZONES: list[Zone] = [
    {"name": "safe", "risk": 0.1, "points": [(200, 150), (250, 400), (180, 480)]},
    {"name": "medium", "risk": 0.4, "points": [(450, 200), (500, 350), (420, 500)]},
    {"name": "danger", "risk": 0.8, "points": [(700, 100), (750, 300), (680, 500)]},
]


def generate_orders(player_id: uuid.UUID, count: int = 5) -> list[Order]:
    """Генерирует указанное количество случайных заказов для игрока."""
    orders = []

    for _ in range(count):
        zone = random.choice(ZONES)  # noqa: S311
        to_point = random.choice(zone["points"])  # noqa: S311
        weight = round(random.uniform(5, 60), 1)  # noqa: S311
        urgency = random.randint(1, 3)  # noqa: S311
        reward = int(weight * urgency * (1 + zone["risk"]) * 10)

        orders.append(
            Order(
                player_id=player_id,
                weight=weight,
                reward=reward,
                urgency=urgency,
                risk=zone["risk"],
                from_x=150.0,
                from_y=300.0,  # база
                to_x=float(to_point[0]),
                to_y=float(to_point[1]),
                zone=zone["name"],
            )
        )
    return orders
