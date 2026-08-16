import Phaser from 'phaser'
import type { OrderData } from '@/store/gameStore'

const URGENCY_COLOR: Record<number, number> = { 1: 0x44ff88, 2: 0xffcc44, 3: 0xff4444 }

/** Графический маркер заказа на карте. */
export class OrderMarker extends Phaser.GameObjects.Container {
  /** Круг для анимации пульсации. */
  private pulse!: Phaser.GameObjects.Arc

  /** Создаёт маркер заказа. */
  constructor(scene: Phaser.Scene, order: OrderData, onClick: (o: OrderData) => void) {
    super(scene, order.to_x, order.to_y)

    const color = URGENCY_COLOR[order.urgency] ?? 0xffffff

    // пульсирующий круг
    this.pulse = scene.add.circle(0, 0, 14, color, 0.2)
    const dot = scene.add.circle(0, 0, 7, color, 1)
    const label = scene.add
      .text(0, -20, `${order.weight}kg\n+${order.reward}¢`, {
        fontSize: '9px',
        color: '#ffffff',
        fontFamily: 'monospace',
        align: 'center',
      })
      .setOrigin(0.5)

    this.add([this.pulse, dot, label])
    scene.add.existing(this)

    // анимация пульса
    scene.tweens.add({
      targets: this.pulse,
      scaleX: 1.8,
      scaleY: 1.8,
      alpha: 0,
      duration: 1200,
      repeat: -1,
      ease: 'Sine.easeOut',
    })

    // клик
    dot.setInteractive({ useHandCursor: true })
    dot.on('pointerdown', () => onClick(order))
    dot.on('pointerover', () => dot.setScale(1.3))
    dot.on('pointerout', () => dot.setScale(1.0))
  }
}
