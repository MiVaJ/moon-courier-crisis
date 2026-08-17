import { useEffect, useState } from 'react'
import { PhaserGame } from './game/PhaserGame'
import { NicknameModal } from './components/NicknameModal'
import { HUD } from './components/HUD'
import { RoverPanel } from './components/RoverPanel'
import { OrderPanel } from './components/OrderPanel'
import { EventLog } from './components/EventLog'
import { Tutorial } from './components/Tutorial'
import { initSession } from './main'
import { useGameStore } from './store/gameStore'
import { useDeliveryPoller } from '@/hooks/useDeliveryPoller'

export function App() {
  const player = useGameStore((s) => s.player)
  const [loading, setLoading] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)

  useDeliveryPoller()

  useEffect(() => {
    void initSession()
      .then((restored) => {
        setLoading(false)

        if (restored && !useGameStore.getState().player?.tutorial_done) {
          setShowTutorial(true)
        }
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="loading">Loading...</div>
  if (!player) return <NicknameModal />

  return (
    <div className="app">
      <HUD />
      <div className="content-area">
        <div className="game-area">
          <PhaserGame />
          {showTutorial && <Tutorial onDone={() => setShowTutorial(false)} />}
        </div>
        <div className="side-panel">
          <RoverPanel />
          <OrderPanel />
          <EventLog />
        </div>
      </div>
    </div>
  )
}
