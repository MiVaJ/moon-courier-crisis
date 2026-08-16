import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warn'
}

export function Toast({ message, type }: ToastProps) {
  const [visible, setVisible] = useState(true)
  /** Автоматически скрывает уведомление через 3,5 секунды. */
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3500)
    return () => clearTimeout(t)
  }, [])
  if (!visible) return null

  return (
    <div className={`toast toast-${type}`}>
      {type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'} {message}
    </div>
  )
}
