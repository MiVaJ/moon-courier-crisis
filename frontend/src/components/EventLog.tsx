import { useGameStore } from '@/store/gameStore'

export function EventLog() {
  const events = useGameStore((s) => s.events)

  return (
    <div className="event-log">
      <h4>📡 Mission Log</h4>
      {events.map((e) => (
        <div key={e.id} className={`event-item type-${e.event_type}`}>
          <span className="event-desc">{e.description}</span>
          <span className="event-delta">
            {e.money_delta > 0
              ? `+${e.money_delta}¢`
              : e.money_delta < 0
                ? `${e.money_delta}¢`
                : ''}
          </span>
        </div>
      ))}
    </div>
  )
}
