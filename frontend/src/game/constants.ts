/** Ширина игровой карты в пикселях. */
export const MAP_W = 900

/** Высота игровой карты в пикселях. */
export const MAP_H = 600

/** Координаты базы игрока. */
export const BASE = { x: 150, y: 300 }

/** Игровые зоны с координатами, цветом и уровнем риска. */
export const ZONES = [
  { name: 'safe', x: 0, y: 0, w: 300, h: MAP_H, risk: 0.1, color: 0x0d2b0d },
  { name: 'medium', x: 300, y: 0, w: 300, h: MAP_H, risk: 0.4, color: 0x2b2b0d },
  { name: 'danger', x: 600, y: 0, w: 300, h: MAP_H, risk: 0.8, color: 0x2b0d0d },
] as const

/** Возможные точки назначения заказов для каждой игровой зоны. */
export const ORDER_POINTS: Record<string, { x: number; y: number }[]> = {
  safe: [
    { x: 200, y: 150 },
    { x: 250, y: 450 },
    { x: 180, y: 300 },
  ],
  medium: [
    { x: 450, y: 200 },
    { x: 500, y: 400 },
    { x: 420, y: 300 },
  ],
  danger: [
    { x: 700, y: 120 },
    { x: 750, y: 350 },
    { x: 680, y: 500 },
  ],
}
