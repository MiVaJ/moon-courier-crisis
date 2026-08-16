import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { MapScene } from './scenes/MapScene'
import { MAP_W, MAP_H } from './constants'

/** React-компонент, инициализирующий игровую сцену Phaser. */
export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: MAP_W,
      height: MAP_H,
      parent: containerRef.current,
      backgroundColor: '#0a0a14',
      scene: [MapScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    })

    return () => game.destroy(true)
  }, [])

  return <div ref={containerRef} className="phaser-container" />
}
