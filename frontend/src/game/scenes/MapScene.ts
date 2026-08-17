import Phaser from 'phaser'
import { ZONES, MAP_W, MAP_H, BASE } from '../constants'
import { RoverSprite } from '../objects/RoverSprite'
import { useGameStore } from '@/store/gameStore'

/** Создаёт генератор псевдослучайных чисел. */
function seededRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

/** Игровая сцена с картой лунной поверхности. */
export class MapScene extends Phaser.Scene {
  public roverSprites: Map<string, RoverSprite> = new Map()
  constructor() {
    super('MapScene')
  }

  /** Создаёт и отображает основные элементы игровой карты. */
  create() {
    this.drawZones()
    this.drawCraters()
    this.drawBase()
    this.drawZoneLabels()

    useGameStore.getState().setScene(this)
  }

  /** Отрисовывает зоны карты с различным уровнем риска. */
  private drawZones() {
    const g = this.add.graphics()
    for (const z of ZONES) {
      g.fillStyle(z.color, 1)
      g.fillRect(z.x, z.y, z.w, z.h)
      // граница зоны
      g.lineStyle(1, 0x334455, 0.5)
      g.strokeRect(z.x, z.y, z.w, z.h)
    }
  }

  /** Генерирует и отрисовывает кратеры на поверхности карты. */
  private drawCraters() {
    const g = this.add.graphics()
    const rng = seededRng(42)
    const count = 30

    for (let i = 0; i < count; i++) {
      const x = rng() * MAP_W
      const y = rng() * MAP_H
      const r = 8 + rng() * 35

      g.fillStyle(0x1a1a2e, 1)
      g.fillCircle(x, y, r)

      g.fillStyle(0x0d0d1a, 1)
      g.fillCircle(x, y, r * 0.6)

      // блик -имитация освещения с северо-запада
      g.fillStyle(0x3a3a5c, 0.35)
      g.fillCircle(x - r * 0.3, y - r * 0.3, r * 0.22)
    }
  }

  /** Отрисовывает базу игрока и её визуальное обозначение. */
  private drawBase() {
    const g = this.add.graphics()
    // основание базы
    g.fillStyle(0x4488ff, 0.9)
    g.fillCircle(BASE.x, BASE.y, 18)
    g.lineStyle(2, 0x88aaff, 1)
    g.strokeCircle(BASE.x, BASE.y, 22)
    // пульсирующий ореол
    g.fillStyle(0x4488ff, 0.15)
    g.fillCircle(BASE.x, BASE.y, 35)

    this.add
      .text(BASE.x, BASE.y - 32, '⬡ BASE', {
        fontSize: '11px',
        color: '#88aaff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
  }

  /** Отображает названия зон и их уровень риска. */
  private drawZoneLabels() {
    const labels = [
      { text: 'SAFE ZONE\nrisk 10%', x: 150, y: 20, color: '#44ff88' },
      { text: 'MED ZONE\nrisk 40%', x: 450, y: 20, color: '#ffcc44' },
      { text: 'DANGER ZONE\nrisk 80%', x: 750, y: 20, color: '#ff4444' },
    ]
    for (const l of labels) {
      this.add
        .text(l.x, l.y, l.text, {
          fontSize: '10px',
          color: l.color,
          fontFamily: 'monospace',
          align: 'center',
        })
        .setOrigin(0.5, 0)
        .setAlpha(0.7)
    }
  }

  /** Анимирует перемещение ровера к точке доставки. */
  public animateDelivery(
    roverId: string,
    from: { x: number; y: number },
    to: { x: number; y: number },
    durationMs: number,
    onComplete: () => void
  ) {
    const sprite = this.roverSprites.get(roverId)
    if (!sprite) return

    // Добавляем случайное отклонение маршрута.
    const mid = {
      x: (from.x + to.x) / 2 + (Math.random() - 0.5) * 80,
      y: (from.y + to.y) / 2 + (Math.random() - 0.5) * 60,
    }

    // Создаём частицы пыли за движущимся ровером.
    const particles = this.add.particles(from.x, from.y, '__DEFAULT', {
      speed: { min: 10, max: 30 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.5, end: 0 },
      tint: 0x888899,
      lifespan: 400,
      quantity: 1,
      follow: sprite,
    })

    this.tweens.add({
      targets: sprite,
      x: { value: [from.x, mid.x, to.x] },
      y: { value: [from.y, mid.y, to.y] },
      duration: durationMs,
      ease: 'Linear',
      onComplete: () => {
        particles.destroy()
        onComplete() // просто сигнал "анимация завершена"
      },
    })
  }

  /** Показывает анимацию перехода на новый игровой день. */
  public animateDayTransition(day: number, onDone: () => void) {
    const overlay = this.add.rectangle(450, 300, 900, 600, 0x000000, 0).setDepth(50)
    const text = this.add
      .text(450, 300, `DAY ${day}`, {
        fontSize: '48px',
        color: '#4488ff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(51)
      .setAlpha(0)

    this.tweens.chain({
      tweens: [
        { targets: overlay, fillAlpha: 0.8, duration: 500 },
        { targets: text, alpha: 1, duration: 400 },
        { targets: text, alpha: 0, duration: 400, delay: 800 },
        {
          targets: overlay,
          fillAlpha: 0,
          duration: 500,
          onComplete: () => {
            overlay.destroy()
            text.destroy()
            onDone()
          },
        },
      ],
    })
  }
}
