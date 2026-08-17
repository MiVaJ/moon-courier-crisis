import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { MapScene } from './scenes/MapScene'
import { MAP_W, MAP_H } from './constants'
import { useGameStore } from '@/store/gameStore'

/** React-компонент, инициализирующий игровую сцену Phaser. */
export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rovers = useGameStore((s) => s.rovers)
  const orders = useGameStore((s) => s.orders)
  const scene = useGameStore((s) => s.scene)

  useEffect(() => {
    if (!containerRef.current) return

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: MAP_W,
      height: MAP_H,
      parent: containerRef.current,
      backgroundColor: '#0a0a14',
      scene: [MapScene],
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    })

    return () => {
      useGameStore.getState().setScene(null)
      game.destroy(true)
    }
  }, [])

  // когда сцена готова, сразу инициализируем всё что уже есть в store
  useEffect(() => {
    if (!scene) return
    const { rovers, orders } = useGameStore.getState()

    if (rovers.length > 0) scene.initRovers(rovers)
    scene.initOrders(orders, (o) => useGameStore.getState().selectOrder(o))
  }, [scene]) // eslint-disable-line react-hooks/exhaustive-deps

  // когда orders меняются (поллер), обновляем маркеры
  useEffect(() => {
    if (!scene) return
    scene.initOrders(orders, (o) => useGameStore.getState().selectOrder(o))
  }, [orders]) // eslint-disable-line react-hooks/exhaustive-deps

  // когда rovers меняются, обновляем спрайты
  useEffect(() => {
    if (!scene || rovers.length === 0) return
    scene.initRovers(rovers)
  }, [rovers]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="phaser-container"
      style={{ width: '100%', height: '100%' }}
    />
  )
}
