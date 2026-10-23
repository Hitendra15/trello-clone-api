import { useCallback, useEffect, useMemo, useState } from 'react'
import { boardsApi, listsApi, tasksApi } from '../api'

/**
 * Loads every board, list and task the user owns (all pages) and derives
 * lookup maps plus per-board progress. The API has no aggregate endpoint for
 * this, so counts are computed client-side.
 */
export function useWorkspace() {
  const [state, setState] = useState({ status: 'loading', boards: [], lists: [], tasks: [], error: null })

  const load = useCallback(async () => {
    try {
      const [boards, lists, tasks] = await Promise.all([boardsApi.list(), listsApi.all(), tasksApi.all()])
      setState({ status: 'ready', boards, lists, tasks, error: null })
    } catch (error) {
      setState((s) => ({ ...s, status: 'error', error }))
    }
  }, [])

  useEffect(() => { load() }, [load])

  const derived = useMemo(() => {
    const listById = new Map(state.lists.map((l) => [l.id, l]))
    const boardById = new Map(state.boards.map((b) => [b.id, b]))
    const stats = new Map(state.boards.map((b) => [b.id, { lists: 0, total: 0, done: 0 }]))

    state.lists.forEach((l) => { const s = stats.get(l.board); if (s) s.lists += 1 })
    state.tasks.forEach((t) => {
      const s = stats.get(listById.get(t.list)?.board)
      if (!s) return
      s.total += 1
      if (t.status === 'done') s.done += 1
    })

    /** Where a task lives, e.g. { list, board } */
    const locate = (task) => {
      const list = listById.get(task.list)
      return { list, board: list ? boardById.get(list.board) : undefined }
    }
    return { listById, boardById, stats, locate }
  }, [state.boards, state.lists, state.tasks])

  return { ...state, ...derived, reload: load, setState }
}
