import { CalendarClock } from 'lucide-react'
import { STATUS_META, dueLabel, dueState } from '../../lib/format'

export function StatusPill({ status }) {
  const meta = STATUS_META[status]
  if (!meta) return null
  const Icon = meta.icon
  return (
    <span className={`pill pill-${status}`}>
      <Icon size={13} strokeWidth={2.4} />
      {meta.label}
    </span>
  )
}

/** Due-date chip coloured by urgency. Renders nothing without a due date. */
export function DueChip({ task }) {
  const state = dueState(task)
  if (!state) return null
  return (
    <span className={`pill pill-${state === 'done' ? 'later' : state}`} title={new Date(task.due_date).toLocaleString()}>
      <CalendarClock size={13} strokeWidth={2.4} />
      {dueLabel(task)}
    </span>
  )
}
