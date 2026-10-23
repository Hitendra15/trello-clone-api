import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Circle, CircleCheck, ListChecks, Search } from 'lucide-react'
import { boardsApi, listsApi, tasksApi } from '../api'
import { STATUSES } from '../lib/format'
import { useTitle } from '../lib/useTitle'
import { DueChip, StatusPill } from '../components/ui/Pills'
import { EmptyState, ErrorState } from '../components/ui/State'
import TaskModal from '../components/board/TaskModal'

const PAGE_SIZE = 10 // matches PAGE_SIZE in the Django REST_FRAMEWORK settings
const ORDERINGS = [
  { value: '-created_at', label: 'Newest first' },
  { value: 'created_at', label: 'Oldest first' },
  { value: 'due_date', label: 'Due date, earliest' },
  { value: '-due_date', label: 'Due date, latest' },
]

/**
 * Every card across all boards, driven by the API's own search, status filter,
 * ordering and pagination. Filters live in the URL so a view can be bookmarked.
 */
export default function Tasks() {
  useTitle('My tasks')
  const [params, setParams] = useSearchParams()
  const search = params.get('q') || ''
  const status = params.get('status') || ''
  const ordering = params.get('ordering') || '-created_at'
  const page = Number(params.get('page')) || 1

  const [searchText, setSearchText] = useState(search)
  const [state, setState] = useState({ status: 'loading', results: [], count: 0, error: null })
  const [where, setWhere] = useState({ lists: [], boards: [] })
  const [openTask, setOpenTask] = useState(null)
  const requestId = useRef(0)

  const update = useCallback((changes) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
      if (!('page' in changes)) next.delete('page') // any filter change goes back to page 1
      return next
    }, { replace: true })
  }, [setParams])

  // Debounce typing in the search box before it hits the API.
  useEffect(() => {
    if (searchText === search) return
    const id = setTimeout(() => update({ q: searchText.trim() }), 350)
    return () => clearTimeout(id)
  }, [searchText, search, update])

  // Lists + boards are needed to show where each card lives.
  useEffect(() => {
    Promise.all([listsApi.all(), boardsApi.list()]).then(([lists, boards]) => setWhere({ lists, boards })).catch(() => {})
  }, [])

  const load = useCallback(async () => {
    const id = ++requestId.current
    try {
      const data = await tasksApi.page({ search, status, ordering, page })
      if (id === requestId.current) setState({ status: 'ready', results: data.results, count: data.count, error: null })
    } catch (error) {
      if (id !== requestId.current) return
      // A page past the end (e.g. after deleting the last card on it) returns 404: step back.
      if (error.status === 404 && page > 1) update({ page: String(page - 1) })
      else setState((s) => ({ ...s, status: 'error', error }))
    }
  }, [search, status, ordering, page, update])

  useEffect(() => { load() }, [load])

  const { listLabel, modalLists } = useMemo(() => {
    const boardName = new Map(where.boards.map((b) => [b.id, b.name]))
    const labels = new Map(where.lists.map((l) => [l.id, `${boardName.get(l.board) ?? 'Board'} / ${l.title}`]))
    return {
      listLabel: (id) => labels.get(id) || '',
      modalLists: where.lists.map((l) => ({ id: l.id, title: l.title, boardName: boardName.get(l.board) })),
    }
  }, [where])

  const replaceTask = (task) => setState((s) => ({ ...s, results: s.results.map((t) => (t.id === task.id ? task : t)) }))

  const toggleDone = async (task) => {
    const next = task.status === 'done' ? 'todo' : 'done'
    replaceTask({ ...task, status: next })
    try {
      if (next === 'done') await tasksApi.markDone(task.id)
      else await tasksApi.update(task.id, { status: next })
    } catch (err) {
      replaceTask(task)
      toast.error(err.message)
    }
  }

  const pages = Math.max(1, Math.ceil(state.count / PAGE_SIZE))
  const from = state.count ? (page - 1) * PAGE_SIZE + 1 : 0
  const to = Math.min(page * PAGE_SIZE, state.count)
  const filtered = !!(search || status)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>My tasks</h1>
          <p>Every card across all your boards.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="input-icon">
          <Search size={17} />
          <input className="input" type="search" placeholder="Search titles and descriptions" aria-label="Search tasks"
            value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </div>
        <div className="segmented" role="radiogroup" aria-label="Filter by status">
          {[{ value: '', label: 'All' }, ...STATUSES].map(({ value, label }) => (
            <label key={label}>
              <input type="radio" name="task-status" value={value} checked={status === value} onChange={() => update({ status: value })} />
              {label}
            </label>
          ))}
        </div>
        <select className="select" aria-label="Sort tasks" value={ordering} onChange={(e) => update({ ordering: e.target.value === '-created_at' ? '' : e.target.value })}>
          {ORDERINGS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {state.status === 'error' && <ErrorState error={state.error} onRetry={load} title="Couldn't load your tasks" />}

      {state.status === 'loading' && (
        <div className="table-card" aria-busy="true">
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className="trow"><div className="skeleton" style={{ height: 22, gridColumn: '1 / -1' }} /></div>)}
        </div>
      )}

      {state.status === 'ready' && state.count === 0 && (
        <EmptyState icon={ListChecks} title={filtered ? 'No matching tasks' : 'No tasks yet'}
          action={filtered ? <button type="button" className="btn" onClick={() => { setSearchText(''); setParams({}, { replace: true }) }}>Clear filters</button> : null}>
          {filtered ? 'Try a different search or status.' : 'Cards you add on your boards will show up here.'}
        </EmptyState>
      )}

      {state.status === 'ready' && state.count > 0 && (
        <div className="table-card">
          <div className="trow trow-head" aria-hidden="true"><span /><span>Card</span><span>Status</span><span>Due</span></div>
          {state.results.map((task) => (
            <div key={task.id} className={`trow${task.status === 'done' ? ' is-done' : ''}`}>
              <button type="button" className="task-check" onClick={() => toggleDone(task)} aria-pressed={task.status === 'done'}
                aria-label={task.status === 'done' ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}>
                {task.status === 'done' ? <CircleCheck size={20} /> : <Circle size={20} />}
              </button>
              <button type="button" className="trow-title" onClick={() => setOpenTask(task)}>
                <b>{task.title}</b>
                <small>{listLabel(task.list)}</small>
              </button>
              <StatusPill status={task.status} />
              {task.due_date ? <DueChip task={task} /> : <span className="trow-due">No due date</span>}
            </div>
          ))}
          <div className="pager">
            <span>{from}–{to} of {state.count}</span>
            <div>
              <button type="button" className="btn btn-sm" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>Previous</button>
              <button type="button" className="btn btn-sm" disabled={page >= pages} onClick={() => update({ page: String(page + 1) })}>Next</button>
            </div>
          </div>
        </div>
      )}

      {openTask && (
        <TaskModal
          task={openTask} lists={modalLists}
          onSaved={replaceTask} onDeleted={() => load()} onClose={() => setOpenTask(null)}
        />
      )}
    </div>
  )
}
