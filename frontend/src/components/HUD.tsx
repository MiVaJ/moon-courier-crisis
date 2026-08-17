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

    // Генерируем и загружаем новые заказы только если их мало.
    const orders = await getOrders(currentPlayer.id)
    if (orders.filter((o) => o.status === 'pending').length < 5) {
      await generateOrders(currentPlayer.id)
    }
    setOrders(await getOrders(currentPlayer.id))
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

export function GameOver({ onRestart }: { onRestart: () => void }) {
  const player = useGameStore((s) => s.player)

  /** Сбрасывает текущую миссию и запускает новую игру. */
  function handleRestart() {
    localStorage.removeItem('player_id')
    onRestart()
  }

  return (
    <div className="modal-overlay">
      <div className="modal game-over">
        <h2>💀 Mission Failed</h2>
        <p>Base rating dropped to zero. The lunar colony is lost.</p>
        {player && (
          <p>
            Day survived: <b>{player.day}</b> · Credits earned: <b>{player.money}¢</b>
          </p>
        )}
        <button onClick={handleRestart}>New Mission</button>
      </div>
    </div>
  )
}
