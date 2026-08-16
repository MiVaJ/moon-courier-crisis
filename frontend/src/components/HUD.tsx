import { getOrders, getRovers, generateOrders, nextDay } from '@/api/client'
import { useGameStore } from '@/store/gameStore'

/** Отображает информацию об игроке и управление игровым днём. */
export function HUD() {
  const { player, setPlayer, setRovers, setOrders } = useGameStore()

  if (!player) return null

  const currentPlayer = player

  /** Завершает текущий день и обновляет состояние игры. */
  async function handleNextDay() {
    const updated = await nextDay(currentPlayer.id)
    setPlayer({ ...currentPlayer, ...updated })

    // Обновляем состояние роверов после перехода на новый день.
    const rovers = await getRovers(currentPlayer.id)
    setRovers(rovers)

    // Генерируем и загружаем новые заказы.
    await generateOrders(currentPlayer.id)
    const orders = await getOrders(currentPlayer.id)
    setOrders(orders)
  }

  return (
    <div className="hud">
      <span className="hud-nick">👤 {currentPlayer.nickname}</span>
      <span className="hud-money">💰 {currentPlayer.money}¢</span>
      <span
        className="hud-rating"
        style={{ color: currentPlayer.rating > 50 ? '#44ff88' : '#ff4444' }}
      >
        ⭐ {currentPlayer.rating.toFixed(0)}%
      </span>
      <span className="hud-day">📅 Day {currentPlayer.day}</span>
      <button className="btn-day" onClick={() => void handleNextDay()}>
        Next Day →
      </button>
    </div>
  )
}
