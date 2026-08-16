import { useState } from 'react'
import { completeTutorial } from '@/api/client'
import { useGameStore } from '@/store/gameStore'

// Шаги обучения с описанием и областью интерфейса для подсветки.
const STEPS = [
  {
    title: '🗺️ Lunar Map',
    text: 'This is your operations area. Green zone is safe, yellow is medium risk, red is danger. Higher risk = higher reward, but rovers can get stuck.',
    highlight: 'map',
  },
  {
    title: '📦 Orders',
    text: 'These pulsing markers are delivery orders. Each has weight, reward and urgency. Heavier orders drain battery faster and slow your rover down.',
    highlight: 'orders',
  },
  {
    title: '🛸 Rovers',
    text: 'Select a rover with enough battery and load capacity. A rover with low battery cannot reach danger zone orders.',
    highlight: 'rovers',
  },
  {
    title: '🚀 Launch',
    text: 'Select an order, then a rover, then hit Launch. Watch your rover move across the map. Results affect your money and base rating.',
    highlight: 'launch',
  },
]

export function Tutorial({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const player = useGameStore((s) => s.player)

  /** Пропускает обучение и сохраняет статус его прохождения. */
  async function skip() {
    if (player) await completeTutorial(player.id)
    onDone()
  }

  /** Переходит к следующему шагу или завершает обучение. */
  async function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      if (player) await completeTutorial(player.id)
      onDone()
    }
  }

  const s = STEPS[step]

  return (
    <div className="tutorial-overlay">
      {/* Подсвечиваем область интерфейса текущего шага. */}
      <div className={`tutorial-spotlight spotlight-${s.highlight}`} />

      <div className="tutorial-box">
        <div className="tutorial-progress">
          {STEPS.map((_, i) => (
            <div key={i} className={`progress-dot ${i <= step ? 'active' : ''}`} />
          ))}
        </div>
        <h3>{s.title}</h3>
        <p>{s.text}</p>
        <div className="tutorial-actions">
          <button className="btn-skip" onClick={() => void skip()}>
            Skip Tutorial
          </button>
          <button className="btn-next" onClick={() => void next()}>
            {step < STEPS.length - 1 ? 'Next →' : 'Start Playing!'}
          </button>
        </div>
      </div>
    </div>
  )
}
