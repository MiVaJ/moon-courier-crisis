import { useGameStore } from '@/store/gameStore'
import { startDelivery, resolveDelivery } from '@/api/client'

export function OrderPanel() {
  const { orders, selectedOrder, selectedRover, selectOrder, player } = useGameStore()

  const canSend = selectedOrder && selectedRover && selectedRover.status === 'idle'

  /** Запускает доставку выбранным ровером. */
  async function handleSend() {
    if (!canSend || !player) return
    try {
      if (!canSend || !player) return
      const scene = useGameStore.getState().scene
      const delivery = await startDelivery(selectedRover.id, selectedOrder.id)

      // запускаем анимацию
      scene?.animateDelivery(
        selectedRover.id,
        { x: selectedRover.pos_x, y: selectedRover.pos_y },
        { x: selectedOrder.to_x, y: selectedOrder.to_y },
        delivery.eta_seconds * 1000,
        () => console.log('animation done')
      )

      // ожидаем завершения доставки перед разрешением результата
      setTimeout(async () => {
        await resolveDelivery(delivery.id)
        // обновление состояния через polling или событие
      }, delivery.eta_seconds * 1000)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: { reason?: string } } } }
      const reason = err.response?.data?.detail?.reason ?? 'error'
      alert(`Cannot deliver: ${reason}`)
    }
  }

  return (
    <div className="panel order-panel">
      <h3>📦 Orders</h3>
      {orders
        .filter((o) => o.status === 'pending')
        .map((o) => (
          <div
            key={o.id}
            className={`order-card urgency-${o.urgency} ${selectedOrder?.id === o.id ? 'selected' : ''}`}
            onClick={() => selectOrder(selectedOrder?.id === o.id ? null : o)}
          >
            <span className="order-zone">{o.zone}</span>
            <span>{o.weight}kg</span>
            <span className="order-reward">+{o.reward}¢</span>
            <span>{'⚡'.repeat(o.urgency)}</span>
            <span className="order-risk">risk {(o.risk * 100).toFixed(0)}%</span>
          </div>
        ))}
      <button className="btn-send" disabled={!canSend} onClick={() => void handleSend()}>
        🚀 Launch Delivery
      </button>
    </div>
  )
}
