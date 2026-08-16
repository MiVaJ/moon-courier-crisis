import Phaser from 'phaser'
import type { RoverData } from '@/store/gameStore'

/** Графическое представление ровера на карте. */
export class RoverSprite extends Phaser.GameObjects.Container {
  /** Тело ровера. */
  private roverBody!: Phaser.GameObjects.Rectangle

  /** Индикатор заряда батареи. */
  private batteryBar!: Phaser.GameObjects.Rectangle

  /** Создаёт графическое представление ровера. */
  constructor(scene: Phaser.Scene, rover: RoverData, onClick: (r: RoverData) => void) {
    super(scene, rover.pos_x, rover.pos_y)

    this.roverBody = scene.add.rectangle(0, 0, 16, 10, 0xaaddff)
    const outline = scene.add.rectangle(0, 0, 18, 12).setStrokeStyle(1, 0x4488ff)
    const nameLbl = scene.add
      .text(0, -16, rover.name.slice(0, 8), {
        fontSize: '8px',
        color: '#aaddff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    // батарея под ровером
    const bgBar = scene.add.rectangle(0, 10, 18, 3, 0x333333)
    this.batteryBar = scene.add
      .rectangle(-9 + (rover.battery / 100) * 9, 10, (rover.battery / 100) * 18, 3, 0x44ff88)
      .setOrigin(0, 0.5)

    this.add([bgBar, this.batteryBar, this.roverBody, outline, nameLbl])
    scene.add.existing(this)

    this.roverBody.setInteractive({ useHandCursor: true })
    this.roverBody.on('pointerdown', () => onClick(rover))
    this.roverBody.on('pointerover', () => this.roverBody.setFillStyle(0xffffff))
    this.roverBody.on('pointerout', () => this.roverBody.setFillStyle(0xaaddff))
  }

  /** Обновляет отображение заряда батареи. */
  updateBattery(pct: number) {
    this.batteryBar.setScale(pct / 100, 1)
    const color = pct > 50 ? 0x44ff88 : pct > 20 ? 0xffcc44 : 0xff4444
    this.batteryBar.setFillStyle(color)
  }

  /** Подсвечивает ровер красным при ошибке. */
  flashError() {
    this.scene.tweens.add({
      targets: this.roverBody,
      fillColor: 0xff0000,
      duration: 200,
      yoyo: true,
      repeat: 3,
    })
  }
}
