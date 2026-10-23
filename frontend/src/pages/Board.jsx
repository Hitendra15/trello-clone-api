import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  DndContext, DragOverlay, MouseSensor, TouchSensor, pointerWithin, rectIntersection, useSensor, useSensors,
} from '@dnd-kit/core'
import { toast } from 'sonner'
import { ChevronLeft, Layers, Pencil, Search, Trash2, X } from 'lucide-react'
import { boardsApi, listsApi, tasksApi } from '../api'
import { STATUSES, boardColor, pluralize } from '../lib/format'
import Menu from '../components/ui/Menu'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { ErrorState } from '../components/ui/State'
import BoardFormModal from '../components/board/BoardFormModal'
import ListFormModal from '../components/board/ListFormModal'
import TaskModal from '../components/board/TaskModal'
import ListColumn from '../components/board/ListColumn'
import AddList from '../components/board/AddList'
import { TaskCardView } from '../components/board/TaskCard'

// Prefer the column under the pointer; fall back to overlap so quick flicks still land.
const collision = (args) => {
  const hits = pointerWithin(args)
  return hits.length ? hits : rectIntersection(args)
}

const STARTER_LISTS = ['To do', 'Doing', 'Done']

export default function Board() {
  const { boardId } = useParams()
  const navigate = useNavigate()

  const [state, setState] = useState({ status: 'loading', board: null, lists: [], tasks: [], error: null })
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [openTask, setOpenTask] = useState(null)
  const [editList, setEditList] = useState(null)
  const [deleteList, setDeleteList] = useState(null)
  const [editBoard, setEditBoard] = useState(false)
  const [deleteBoard, setDeleteBoard] = useState(false)
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
  )

  /* ------------------------------------------------------------- loading */

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading', error: null }))
    try {
      const [board, lists] = await Promise.all([boardsApi.get(boardId), boardsApi.lists(boardId)])
      const groups = await Promise.all(lists.map((l) => tasksApi.ofList(l.id)))
      setState({ status: 'ready', board, lists, tasks: groups.flat(), error: null })
    } catch (error) {
      setState({ status: 'error', board: null, lists: [], tasks: [], error })
    }
  }, [boardId])

  useEffect(() => { load() }, [load])

  const { board, lists, tasks } = state
  const patchState = (fn) => setState((s) => ({ ...s, ...fn(s) }))
  const replaceTask = (task) => patchState((s) => ({ tasks: s.tasks.map((t) => (t.id === task.id ? task : t)) }))

  /* ------------------------------------------------------ derived values */

  const needle = query.trim().toLowerCase()
  const filtering = !!needle || statusFilter !== 'all'

  const visibleByList = useMemo(() => {
    const map = new Map(lists.map((l) => [l.id, []]))
    tasks.forEach((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return
      if (needle && !`${t.title} ${t.description}`.toLowerCase().includes(needle)) return
      map.get(t.list)?.push(t)
    })
    return map
  }, [lists, tasks, needle, statusFilter])

  const totalByList = useMemo(() => {
    const map = new Map()
    tasks.forEach((t) => map.set(t.list, (map.get(t.list) || 0) + 1))
    return map
  }, [tasks])

  const done = tasks.filter((t) => t.status === 'done').length
  const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0
  const activeTask = activeId ? tasks.find((t) => `task-${t.id}` === activeId) : null

  /* ------------------------------------------------------------- actions */

  const addTask = async (listId, title) => {
    try {
      const task = await tasksApi.create({ title, list: listId })
      patchState((s) => ({ tasks: [...s.tasks, task] }))
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const toggleDone = async (task) => {
    const next = task.status === 'done' ? 'todo' : 'done'
    replaceTask({ ...task, status: next }) // optimistic
    try {
      // Completing uses the dedicated mark_done action; un-completing is a plain PATCH.
      if (next === 'done') await tasksApi.markDone(task.id)
      else await tasksApi.update(task.id, { status: next })
    } catch (err) {
      replaceTask(task)
      toast.error(err.message)
    }
  }

  const moveTask = async (task, listId) => {
    replaceTask({ ...task, list: listId }) // optimistic
    try {
      await tasksApi.update(task.id, { list: listId })
    } catch (err) {
      replaceTask(task)
      toast.error(`Couldn't move the card. ${err.message}`)
    }
  }

  const onDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over) return
    const task = active.data.current?.task
    const listId = Number(String(over.id).replace('list-', ''))
    const current = tasks.find((t) => t.id === task?.id)
    if (current && current.list !== listId) moveTask(current, listId)
  }

  const addList = async (title) => {
    try {
      const list = await listsApi.create(board.id, { title })
      patchState((s) => ({ lists: [...s.lists, list] }))
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const addStarterLists = async () => {
    try {
      const created = []
      for (const title of STARTER_LISTS) created.push(await listsApi.create(board.id, { title })) // sequential keeps order
      patchState((s) => ({ lists: [...s.lists, ...created] }))
    } catch (err) {
      toast.error(err.message)
      load()
    }
  }

  const removeList = async () => {
    try {
      await listsApi.remove(deleteList.id)
      patchState((s) => ({ lists: s.lists.filter((l) => l.id !== deleteList.id), tasks: s.tasks.filter((t) => t.list !== deleteList.id) }))
      toast.success('List deleted')
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const removeBoard = async () => {
    try {
      await boardsApi.remove(board.id)
      toast.success('Board deleted')
      navigate('/boards', { replace: true })
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  /* -------------------------------------------------------------- render */

  if (state.status === 'loading') {
    return (
      <div className="board-page" aria-busy="true">
        <div className="board-head"><div className="skeleton" style={{ height: 34, width: 260 }} /></div>
        <div className="board-canvas">
          {[0, 1, 2].map((i) => <div key={i} className="column skeleton" style={{ height: 260 }} />)}
        </div>
      </div>
    )
  }

  if (state.status === 'error') {
    const missing = [403, 404].includes(state.error?.status) // the lists endpoint answers 403 for boards you can't access
    return (
      <div className="page">
        <ErrorState
          title={missing ? 'Board not found' : "Couldn't load this board"}
          error={missing ? { message: "It may have been deleted, or it belongs to another account." } : state.error}
          onRetry={missing ? undefined : load}
        />
        <p style={{ textAlign: 'center', marginTop: 16 }}><Link to="/boards">Back to all boards</Link></p>
      </div>
    )
  }

  const taskModalLists = lists.map((l) => ({ id: l.id, title: l.title }))

  return (
    <div className="board-page">
      <header className="board-head">
        <div className="board-head-main">
          <Link to="/boards" className="crumb"><ChevronLeft size={16} /> Boards</Link>
          <div className="board-title-row">
            <span className="board-dot" style={{ background: boardColor(board.id) }} aria-hidden="true" />
            <h1 title={board.name}>{board.name}</h1>
            <Menu label="Board actions">
              {(close) => (
                <>
                  <button type="button" className="menu-item" role="menuitem" onClick={() => { close(); setEditBoard(true) }}>
                    <Pencil size={16} /> Edit board
                  </button>
                  <div className="menu-sep" />
                  <button type="button" className="menu-item is-danger" role="menuitem" onClick={() => { close(); setDeleteBoard(true) }}>
                    <Trash2 size={16} /> Delete board
                  </button>
                </>
              )}
            </Menu>
          </div>
          {board.description && <p className="board-desc">{board.description}</p>}
        </div>

        <div className="board-tools">
          <div className="progress" title={`${done} of ${tasks.length} cards done`}>
            <span className="progress-text">{tasks.length ? `${done} of ${pluralize(tasks.length, 'card')} done` : 'No cards yet'}</span>
            <span className="progress-bar"><span style={{ width: `${percent}%`, background: boardColor(board.id) }} /></span>
          </div>

          <div className="input-icon board-search">
            <Search size={17} />
            <input className="input" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter cards" aria-label="Filter cards on this board" />
          </div>

          <div className="segmented" role="radiogroup" aria-label="Filter by status">
            {[{ value: 'all', label: 'All' }, ...STATUSES].map(({ value, label }) => (
              <label key={value}>
                <input type="radio" name="status-filter" value={value} checked={statusFilter === value} onChange={() => setStatusFilter(value)} />
                {label}
              </label>
            ))}
          </div>
          {filtering && (
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => { setQuery(''); setStatusFilter('all') }}>
              <X size={15} /> Clear
            </button>
          )}
        </div>
      </header>

      <DndContext
        sensors={sensors} collisionDetection={collision}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="board-canvas">
          {lists.length === 0 ? (
            <div className="board-empty">
              <div className="state-icon"><Layers size={26} /></div>
              <h2>Start with a few lists</h2>
              <p>Lists are the columns of your board. Add the usual three, or create your own.</p>
              <button type="button" className="btn btn-primary" onClick={addStarterLists}>Add To do, Doing and Done</button>
              <div className="board-empty-add"><AddList onAdd={addList} /></div>
            </div>
          ) : (
            <>
              {lists.map((list) => (
                <ListColumn
                  key={list.id} list={list}
                  tasks={visibleByList.get(list.id) || []} total={totalByList.get(list.id) || 0} filtering={filtering}
                  onOpenTask={setOpenTask} onToggleDone={toggleDone} onAddTask={addTask}
                  onEdit={setEditList} onDelete={setDeleteList}
                />
              ))}
              <AddList onAdd={addList} />
            </>
          )}
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' }}>
          {activeTask && <TaskCardView task={activeTask} overlay />}
        </DragOverlay>
      </DndContext>

      {openTask && (
        <TaskModal
          task={tasks.find((t) => t.id === openTask.id) || openTask} lists={taskModalLists}
          onSaved={replaceTask}
          onDeleted={(id) => patchState((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))}
          onClose={() => setOpenTask(null)}
        />
      )}
      {editList && (
        <ListFormModal list={editList} onClose={() => setEditList(null)}
          onSaved={(saved) => patchState((s) => ({ lists: s.lists.map((l) => (l.id === saved.id ? saved : l)) }))} />
      )}
      {deleteList && (
        <ConfirmDialog
          title={`Delete "${deleteList.title}"?`}
          message={`This also deletes ${pluralize(totalByList.get(deleteList.id) || 0, 'card')} in the list. This can't be undone.`}
          confirmLabel="Delete list" onConfirm={removeList} onClose={() => setDeleteList(null)}
        />
      )}
      {editBoard && (
        <BoardFormModal board={board} onClose={() => setEditBoard(false)} onSaved={(saved) => patchState(() => ({ board: saved }))} />
      )}
      {deleteBoard && (
        <ConfirmDialog
          title={`Delete "${board.name}"?`}
          message={`The board, its ${pluralize(lists.length, 'list')} and ${pluralize(tasks.length, 'card')} will be permanently deleted.`}
          confirmLabel="Delete board" onConfirm={removeBoard} onClose={() => setDeleteBoard(false)}
        />
      )}
    </div>
  )
}

