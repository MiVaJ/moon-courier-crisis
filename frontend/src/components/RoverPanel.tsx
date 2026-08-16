import { useGameStore } from '@/store/gameStore'

/** Отображает список роверов и их текущее состояние. */
export function RoverPanel() {
  const { rovers, selectedRover, selectRover } = useGameStore()

  return (
    <div className="panel rover-panel">
      <h3>🛸 Rovers</h3>
      {rovers.map((r) => (
        <div
          key={r.id}
          className={`rover-card ${selectedRover?.id === r.id ? 'selected' : ''} status-${r.status}`}
          onClick={() => selectRover(selectedRover?.id === r.id ? null : r)}
        >
          <div className="rover-name">{r.name}</div>
          <div className="rover-status">{r.status.toUpperCase()}</div>
          <div className="battery-wrap">
            <div
              className="battery-fill"
              style={{
                width: `${r.battery}%`,
                background: r.battery > 50 ? '#44ff88' : r.battery > 20 ? '#ffcc44' : '#ff4444',
              }}
            />
          </div>
          <div className="rover-meta">
            ⚡{r.battery.toFixed(0)}% · 📦{r.current_load}/{r.max_load}kg
          </div>
        </div>
      ))}
    </div>
  )
}
