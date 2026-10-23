import { useEffect } from 'react'

export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Trello Clone` : 'Trello Clone'
  }, [title])
}
