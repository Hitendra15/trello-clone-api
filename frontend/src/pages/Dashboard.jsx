import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, SquareKanban } from 'lucide-react'
import { dashboardApi } from '../api'
import { useAuth } from '../auth/AuthContext'
import { useWorkspace } from '../data/useWorkspace'
import { boardColor, dueState, greeting, pluralize } from '../lib/format'
import { useTitle } from '../lib/useTitle'
import { DueChip, StatusPill } from '../components/ui/Pills'
import { EmptyState, ErrorState } from '../components/ui/State'
import BoardFormModal from '../components/board/BoardFormModal'

function TaskRows({ tasks, locate, empty, showDue }) {
  if (!tasks.length) return <p className="panel-empty">{empty}</p>
  return (
    <ul className="row-list">
      {tasks.map((task) => {
        const { list, board } = locate(task)
        return (
          <li key={task.id}>
            <Link className="task-row" to={board ? `/boards/${board.id}` : '/boards'}>
              <span className="task-row-main">
                <span className="task-row-title">{task.title}</span>
                <span className="task-row-sub">{board ? `${board.name} / ${list.title}` : 'Unknown board'}</span>
              </span>
              {showDue ? <DueChip task={task} /> : <StatusPill status={task.status} />}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default function Dashboard() {
  useTitle('Dashboard')
  const { user } = useAuth()
  const navigate = useNavigate()
  const ws = useWorkspace()
  const [dash, setDash] = useState(null)
  const [dashError, setDashError] = useState(null)
  const [creating, setCreating] = useState(false)

  const loadDash = useCallback(() => {
    setDashError(null)
    dashboardApi.get().then(setDash).catch(setDashError)
  }, [])
  useEffect(() => { loadDash() }, [])

  const { upcoming, recent, overdue } = useMemo(() => {
    const open = ws.tasks.filter((t) => t.status !== 'done' && t.due_date)
    const byDue = [...open].sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    return {
      upcoming: byDue.slice(0, 6),
      overdue: open.filter((t) => dueState(t) === 'overdue').length,
      recent: [...ws.tasks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6),
    }
  }, [ws.tasks])

  const failed = ws.status === 'error' || dashError
  const ready = ws.status === 'ready' && dash
  const stats = dash?.statistics
  const open = stats ? stats.todo_tasks + stats.in_progress_tasks : 0

  const summary = !stats ? '' :
    stats.total_boards === 0 ? 'Create a board to start planning your work.' :
    overdue > 0 ? `${pluralize(overdue, 'card')} ${overdue === 1 ? 'is' : 'are'} overdue.` :
    open > 0 ? `${pluralize(open, 'card')} still open across ${pluralize(stats.total_boards, 'board')}.` :
    'Everything is done. Nice work.'

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{greeting()}, {user?.first_name || 'there'}</h1>
          <p>{summary || 'Loading your workspace…'}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
          <Plus size={18} /> New board
        </button>
      </div>

      {failed && (
        <ErrorState error={ws.error || dashError} title="Couldn't load your dashboard"
          onRetry={() => { loadDash(); ws.reload() }} />
      )}

      {!failed && !ready && (
        <div className="stack" aria-busy="true">
          <div className="skeleton" style={{ height: 132 }} />
          <div className="dash-grid">
            <div className="skeleton" style={{ height: 280 }} />
            <div className="skeleton" style={{ height: 280 }} />
          </div>
        </div>
      )}

      {ready && stats.total_boards === 0 && (
        <EmptyState icon={SquareKanban} title="Your workspace is empty"
          action={<button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={18} /> Create a board</button>}>
          Boards hold your lists and cards. Create one and add your first task.
        </EmptyState>
      )}

      {ready && stats.total_boards > 0 && (
        <>
          <section className="panel" aria-labelledby="workload-h">
            <div className="workload-top">
              <h2 id="workload-h">Workload</h2>
              <span>{pluralize(stats.total_tasks, 'card')} on {pluralize(stats.total_boards, 'board')}, {pluralize(stats.total_lists, 'list')}</span>
            </div>
            <div className="workload-bar" role="img"
              aria-label={`${stats.todo_tasks} to do, ${stats.in_progress_tasks} in progress, ${stats.completed_tasks} done`}>
              {stats.total_tasks === 0 ? null : (
                <>
                  <span className="seg-todo" style={{ flexGrow: stats.todo_tasks }} />
                  <span className="seg-progress" style={{ flexGrow: stats.in_progress_tasks }} />
                  <span className="seg-done" style={{ flexGrow: stats.completed_tasks }} />
                </>
              )}
            </div>
            <div className="workload-legend">
              <span className="legend-item"><i className="dot seg-todo" /> To do <strong>{stats.todo_tasks}</strong></span>
              <span className="legend-item"><i className="dot seg-progress" /> In progress <strong>{stats.in_progress_tasks}</strong></span>
              <span className="legend-item"><i className="dot seg-done" /> Done <strong>{stats.completed_tasks}</strong></span>
            </div>
          </section>

          <div className="dash-grid">
            <section className="panel" aria-labelledby="due-h">
              <div className="panel-head"><h2 id="due-h">Due soon</h2></div>
              <TaskRows tasks={upcoming} locate={ws.locate} showDue empty="No open cards have a due date. Add one from a card to see it here." />
            </section>
            <section className="panel" aria-labelledby="recent-h">
              <div className="panel-head"><h2 id="recent-h">Recently added</h2></div>
              <TaskRows tasks={recent} locate={ws.locate} empty="No cards yet. Open a board and add your first one." />
            </section>
          </div>

          <section className="panel" style={{ marginTop: 20 }} aria-labelledby="boards-h">
            <div className="panel-head">
              <h2 id="boards-h">Your boards</h2>
              <Link to="/boards">View all</Link>
            </div>
            <div className="chip-row">
              {dash.boards.map((b) => (
                <Link key={b.id} to={`/boards/${b.id}`} className="board-chip">
                  <i style={{ background: boardColor(b.id) }} />{b.name}
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {creating && <BoardFormModal onClose={() => setCreating(false)} onSaved={(b) => navigate(`/boards/${b.id}`)} />}
    </div>
  )
}
