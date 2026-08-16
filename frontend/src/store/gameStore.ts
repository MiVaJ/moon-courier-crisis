import { create } from 'zustand'

/** Данные ровера, необходимые для отображения и управления им в игре. */
export interface RoverData {
  id: string
  name: string
  battery: number
  max_load: number
  current_load: number
  status: string
  pos_x: number
  pos_y: number
}

/** Данные заказа, доступные клиентской части игры. */
export interface OrderData {
  id: string
  weight: number
  reward: number
  urgency: number
  risk: number
  zone: string
  from_x: number
  from_y: number
  to_x: number
  to_y: number
  status: string
}

/** Данные игрового события для отображения в журнале. */
export interface EventData {
  id: string
  event_type: string
  description: string
  money_delta: number
  rating_delta: number
}

/** Основные данные игрока и его текущего игрового прогресса. */
export interface PlayerData {
  id: string
  nickname: string
  money: number
  rating: number
  tutorial_done: boolean
  day: number
}

/** Состояние игры и методы для его обновления. */
interface GameStore {
  player: PlayerData | null
  rovers: RoverData[]
  orders: OrderData[]
  events: EventData[]
  selectedOrder: OrderData | null
  selectedRover: RoverData | null
  setPlayer: (p: PlayerData) => void
  setRovers: (r: RoverData[]) => void
  setOrders: (o: OrderData[]) => void
  setEvents: (e: EventData[]) => void
  selectOrder: (o: OrderData | null) => void
  selectRover: (r: RoverData | null) => void
  updateRover: (id: string, patch: Partial<RoverData>) => void
}

/** Глобальное состояние игры на основе Zustand. */
export const useGameStore = create<GameStore>((set) => ({
  player: null,
  rovers: [],
  orders: [],
  events: [],
  selectedOrder: null,
  selectedRover: null,
  setPlayer: (p) => set({ player: p }),
  setRovers: (r) => set({ rovers: r }),
  setOrders: (o) => set({ orders: o }),
  setEvents: (e) => set({ events: e }),
  selectOrder: (o) => set({ selectedOrder: o }),
  selectRover: (r) => set({ selectedRover: r }),
  updateRover: (id, patch) =>
    set((s) => ({
      rovers: s.rovers.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),
}))
