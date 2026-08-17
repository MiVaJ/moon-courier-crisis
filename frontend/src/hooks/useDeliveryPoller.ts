import { useEffect } from 'react'
import { getRovers, getOrders, getEvents, getPlayer } from '@/api/client'
import { useGameStore } from '@/store/gameStore'

export function useDeliveryPoller() {
  const { player, setRovers, setOrders, setEvents, setPlayer } = useGameStore()

  /** Периодически обновляет состояние игры с сервера. */
  useEffect(() => {
    if (!player) return

    const updateGame = async () => {
      const [rovers, orders, events, p] = await Promise.all([
        getRovers(player.id),
        getOrders(player.id),
        getEvents(player.id),
        getPlayer(player.id),
      ])

      setRovers(rovers)
      setOrders(orders)
      setEvents(events)
      setPlayer(p)
    }

    const id = setInterval(() => {
      void updateGame()
    }, 3000)

    return () => clearInterval(id)
  }, [player])
}
