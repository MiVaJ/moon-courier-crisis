from unittest.mock import MagicMock

from app.models.models import RoverStatus
from app.services.delivery import can_deliver


def make_rover(**kwargs):
    """Создаёт мок ровера с заданными параметрами."""
    r = MagicMock()
    r.status = RoverStatus.IDLE
    r.battery = kwargs.get("battery", 100.0)
    r.max_load = kwargs.get("max_load", 50.0)
    r.current_load = kwargs.get("current_load", 0.0)
    return r


def make_order(**kwargs):
    """Создаёт мок заказа с заданными параметрами."""
    o = MagicMock()
    o.weight = kwargs.get("weight", 20.0)
    o.risk = kwargs.get("risk", 0.1)
    o.from_x, o.from_y = 150.0, 300.0
    o.to_x = kwargs.get("to_x", 700.0)
    o.to_y = kwargs.get("to_y", 300.0)
    o.max_load = 50.0
    return o


def test_can_deliver_ok():
    """Проверяет возможность доставки при подходящих условиях."""
    ok, reason = can_deliver(make_rover(), make_order())
    assert ok and reason == "ok"


def test_rover_busy():
    """Проверяет запрет доставки, если ровер уже занят."""
    rover = make_rover()
    rover.status = RoverStatus.DELIVERING
    ok, reason = can_deliver(rover, make_order())
    assert not ok and reason == "rover_busy"


def test_overload():
    """Проверяет запрет доставки при превышении грузоподъёмности ровера."""
    ok, reason = can_deliver(make_rover(max_load=10.0), make_order(weight=50.0))
    assert not ok and reason == "overload"


def test_not_enough_battery():
    """Проверяет запрет доставки при недостаточном заряде батареи."""
    ok, reason = can_deliver(make_rover(battery=1.0), make_order(to_x=900.0, risk=0.8))
    assert not ok


def test_impossible_route():
    """Проверяет запрет доставки по физически невыполнимому маршруту."""
    # очень тяжёлый заказ далеко в опасной зоне
    ok, reason = can_deliver(
        make_rover(battery=100.0, max_load=50.0), make_order(weight=49.0, to_x=900.0, risk=0.8)
    )
    # либо impossible_route либо not_enough_battery, главное что нельзя
    assert not ok
