import { useDraggable } from '@dnd-kit/core'
import { AlignLeft, Circle, CircleCheck } from 'lucide-react'
import { DueChip, StatusPill } from '../ui/Pills'

/**
 * Presentational card. Also used (with `overlay`) as the floating copy while dragging.
 * The whole card is clickable; the title is the real button so keyboard users can open it.
 */
export function TaskCardView({ task, onOpen, onToggleDone, overlay = false, dragging = false, ...rest }) {
  const done = task.status === 'done'
  return (
    <div
      className={`task-card${done ? ' is-done' : ''}${dragging ? ' is-dragging' : ''}${overlay ? ' is-overlay' : ''}`}
      onClick={onOpen}
      {...rest}
    >
      <button
        type="button" className="task-check"
        aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        aria-pressed={done}
        onClick={(e) => { e.stopPropagation(); onToggleDone?.(task) }}
      >
        {done ? <CircleCheck size={20} /> : <Circle size={20} />}
      </button>

      <div className="task-body">
        <button type="button" className="task-title">{task.title}</button>
        {(task.status === 'in_progress' || task.due_date || task.description) && (
          <div className="task-meta-row">
            {task.status === 'in_progress' && <StatusPill status="in_progress" />}
            <DueChip task={task} />
            {task.description && <AlignLeft size={15} className="task-desc-icon" aria-label="Has a description" />}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DraggableTaskCard({ task, onOpen, onToggleDone }) {
  // Keyboard users move cards with the "List" select in the card editor, so only pointer listeners are used.
  const { listeners, setNodeRef, isDragging } = useDraggable({ id: `task-${task.id}`, data: { task } })
  return (
    <div ref={setNodeRef}>
      <TaskCardView
        task={task} onOpen={onOpen} onToggleDone={onToggleDone} dragging={isDragging}
        {...listeners}
      />
    </div>
  )
}
