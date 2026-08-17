import axios from 'axios'
import type { PlayerData, RoverData, OrderData, EventData } from '@/store/gameStore'

const api = axios.create({ baseURL: 'http://localhost:8000' })

interface GenerateOrdersResponse {
  generated: number
}

interface DeliveryResponse {
  id: string
  eta_seconds: number
}

interface ResolveDeliveryResponse {
  success: boolean
}

interface NextDayResponse {
  day: number
  money: number
}

/** Создаёт нового игрока по указанному имени. */
export const createPlayer = (nickname: string) =>
  api.post<PlayerData>('/players/', { nickname }).then((r) => r.data)

/** Получает данные игрока по его идентификатору. */
export const getPlayer = (id: string) => api.get<PlayerData>(`/players/${id}`).then((r) => r.data)

/** Отмечает обучение игрока как завершённое. */
export const completeTutorial = (id: string) =>
  api.patch<PlayerData>(`/players/${id}/tutorial`).then((r) => r.data)

/** Получает список роверов игрока. */
export const getRovers = (playerId: string) =>
  api.get<RoverData[]>(`/game/${playerId}/rovers`).then((r) => r.data)

/** Получает список доступных заказов игрока. */
export const getOrders = (playerId: string) =>
  api.get<OrderData[]>(`/game/${playerId}/orders`).then((r) => r.data)

/** Генерирует новые заказы для игрока. */
export const generateOrders = (playerId: string) =>
  api.post<GenerateOrdersResponse>(`/game/${playerId}/orders/generate`).then((r) => r.data)

/** Запускает доставку заказа выбранным ровером. */
export const startDelivery = (roverId: string, orderId: string) =>
  api
    .post<DeliveryResponse>('/deliveries/', {
      rover_id: roverId,
      order_id: orderId,
    })
    .then((r) => r.data)

/** Завершает доставку и получает результат выполнения заказа. */
export const resolveDelivery = (deliveryId: string) =>
  api.post<ResolveDeliveryResponse>(`/deliveries/${deliveryId}/resolve`).then((r) => r.data)

/** Переводит игрока на следующий игровой день. */
export const nextDay = (playerId: string) =>
  api.post<NextDayResponse>(`/game/${playerId}/next-day`).then((r) => r.data)

/** Получает последние игровые события игрока. */
export const getEvents = (playerId: string) =>
  api.get<EventData[]>(`/game/${playerId}/events`).then((r) => r.data)
