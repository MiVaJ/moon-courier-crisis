import { getPlayer, getRovers, getOrders, generateOrders } from '@/api/client'
import { useGameStore } from '@/store/gameStore'

/** Восстанавливает игровую сессию из сохранённого идентификатора игрока. */
export async function initSession() {
  const store = useGameStore.getState()
  const savedId = localStorage.getItem('player_id')

  if (savedId) {
    try {
      const player = await getPlayer(savedId)
      store.setPlayer(player)

      const [rovers, orders] = await Promise.all([getRovers(savedId), getOrders(savedId)])

      store.setRovers(rovers)

      if (orders.length === 0) {
        await generateOrders(savedId)
        store.setOrders(await getOrders(savedId))
      } else {
        store.setOrders(orders)
      }

      return true // Сессия успешно восстановлена.
    } catch {
      localStorage.removeItem('player_id')
    }
  }

  return false // Сохранённой сессии нет.
}
