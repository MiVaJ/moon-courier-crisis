import { useState } from 'react'
import { createPlayer } from '@/api/client'
import { useGameStore } from '@/store/gameStore'

/** Отображает форму создания нового игрока. */
export function NicknameModal() {
  const [nick, setNick] = useState('')
  const [error, setError] = useState('')
  const setPlayer = useGameStore((s) => s.setPlayer)

  /** Создаёт игрока и сохраняет его идентификатор для восстановления сессии. */
  async function handleSubmit() {
    if (nick.length < 2) {
      setError('Min 2 chars')
      return
    }

    try {
      const player = await createPlayer(nick)
      localStorage.setItem('player_id', player.id)
      setPlayer(player)
    } catch {
      setError('Nickname taken')
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>🌙 Moon Courier Crisis</h2>
        <p>Enter your callsign to begin</p>
        <input
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void handleSubmit()}
          placeholder="Commander name..."
          maxLength={32}
        />
        {error && <span className="error">{error}</span>}
        <button onClick={() => void handleSubmit()}>Start Mission</button>
      </div>
    </div>
  )
}
