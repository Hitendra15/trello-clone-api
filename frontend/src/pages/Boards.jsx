import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Pencil, Plus, Search, SquareKanban, Trash2 } from 'lucide-react'
import { boardsApi } from '../api'
import { boardColor, pluralize } from '../lib/format'
import { useTitle } from '../lib/useTitle'
import { useWorkspace } from '../data/useWorkspace'
import BoardFormModal from '../components/board/BoardFormModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { EmptyState, ErrorState } from '../components/ui/State'

export default function Boards() {
  useTitle('Boards')
  const navigate = useNavigate()
  const ws = useWorkspace()
  const [modal, setModal] = useState(null) // { type: 'new' | 'edit' | 'delete', board? }
  const [query, setQuery] = useState('')

  // Task count per list, used to draw each board's mini column strip.
  const countByList = useMemo(() => {
    const map = new Map()
    ws.tasks.forEach((t) => map.set(t.list, (map.get(t.list) || 0) + 1))
    return map
  }, [ws.tasks])

  const listsByBoard = useMemo(() => {
    const map = new Map()
    ws.lists.forEach((l) => map.set(l.board, [...(map.get(l.board) || []), l]))
    return map
  }, [ws.lists])

  const needle = query.trim().toLowerCase()
  const boards = ws.boards.filter((b) => !needle || `${b.name} ${b.description}`.toLowerCase().includes(needle))

  const removeBoard = async () => {
    const { board } = modal
    try {
      await boardsApi.remove(board.id)
      ws.setState((s) => {
        const gone = new Set(s.lists.filter((l) => l.board === board.id).map((l) => l.id))
        return {
          ...s,
          boards: s.boards.filter((b) => b.id !== board.id),
          lists: s.lists.filter((l) => l.board !== board.id),
          tasks: s.tasks.filter((t) => !gone.has(t.list)),
        }
      })
      toast.success('Board deleted')
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Boards</h1>
          <p>One board per project. Open a board to manage its lists and cards.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModal({ type: 'new' })}>
          <Plus size={18} /> New board
        </button>
      </div>

      {ws.status === 'loading' && (
        <div className="board-grid" aria-busy="true">
          {[0, 1, 2].map((i) => <div key={i} className="tile-skeleton skeleton" />)}
        </div>
      )}

      {ws.status === 'error' && <ErrorState error={ws.error} onRetry={ws.reload} title="Couldn't load your boards" />}

      {ws.status === 'ready' && ws.boards.length === 0 && (
        <EmptyState
          icon={SquareKanban} title="Create your first board"
          action={<button type="button" className="btn btn-primary" onClick={() => setModal({ type: 'new' })}><Plus size={18} /> New board</button>}
        >
          Boards organise a project into lists and cards. Start with one for whatever you&rsquo;re working on now.
        </EmptyState>
      )}

      {ws.status === 'ready' && ws.boards.length > 0 && (
        <>
          {ws.boards.length > 5 && (
            <div className="toolbar">
              <div className="input-icon">
                <Search size={17} />
                <input className="input" type="search" placeholder="Search boards" aria-label="Search boards"
                  value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </div>
          )}

          <div className="board-grid">
            <button type="button" className="tile tile-new" onClick={() => setModal({ type: 'new' })}>
              <span className="state-icon"><Plus size={22} /></span>
              New board
            </button>

            {boards.map((board) => {
              const stats = ws.stats.get(board.id) || { lists: 0, total: 0, done: 0 }
              const strip = (listsByBoard.get(board.id) || []).slice(0, 6)
              const percent = stats.total ? Math.round((stats.done / stats.total) * 100) : 0
              return (
                <article key={board.id} className="tile">
                  <div className="tile-cover" style={{ '--c': boardColor(board.id) }}>
                    {strip.length ? (
                      <div className="strip" aria-hidden="true">
                        {strip.map((l) => <i key={l.id} style={{ '--n': Math.min(countByList.get(l.id) || 0, 6) }} />)}
                      </div>
                    ) : <span className="strip-empty">No lists yet</span>}
                    <div className="tile-actions">
                      <button type="button" className="btn btn-cover" aria-label={`Edit ${board.name}`} onClick={() => setModal({ type: 'edit', board })}>
                        <Pencil size={15} />
                      </button>
                      <button type="button" className="btn btn-cover" aria-label={`Delete ${board.name}`} onClick={() => setModal({ type: 'delete', board })}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="tile-body">
                    <h2><Link className="tile-link" to={`/boards/${board.id}`} title={board.name}>{board.name}</Link></h2>
                    <p className="tile-desc">{board.description || 'No description'}</p>
                    <div className="tile-foot">
                      <span>{pluralize(stats.lists, 'list')}, {stats.total ? `${stats.done}/${stats.total} done` : 'no cards'}</span>
                      <span className="progress-bar" aria-hidden="true"><span style={{ width: `${percent}%`, background: boardColor(board.id) }} /></span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          {needle && boards.length === 0 && <p className="muted" style={{ marginTop: 20 }}>No boards match &ldquo;{query}&rdquo;.</p>}
        </>
      )}

      {modal?.type === 'new' && (
        <BoardFormModal onClose={() => setModal(null)} onSaved={(board) => navigate(`/boards/${board.id}`)} />
      )}
      {modal?.type === 'edit' && (
        <BoardFormModal board={modal.board} onClose={() => setModal(null)}
          onSaved={(saved) => ws.setState((s) => ({ ...s, boards: s.boards.map((b) => (b.id === saved.id ? saved : b)) }))} />
      )}
      {modal?.type === 'delete' && (
        <ConfirmDialog
          title={`Delete "${modal.board.name}"?`}
          message={`The board and all of its lists and cards (${pluralize(ws.stats.get(modal.board.id)?.total || 0, 'card')}) will be permanently deleted.`}
          confirmLabel="Delete board" onConfirm={removeBoard} onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
