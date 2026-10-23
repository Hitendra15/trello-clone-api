import { Circle, CircleDashed, CircleCheck } from 'lucide-react'

/* ----------------------------------------------------------------- status */

export const STATUSES = [
  { value: 'todo', label: 'To do', icon: CircleDashed },
  { value: 'in_progress', label: 'In progress', icon: Circle },
  { value: 'done', label: 'Done', icon: CircleCheck },
]

export const STATUS_META = Object.fromEntries(STATUSES.map((s) => [s.value, s]))

/* ------------------------------------------------------------------ people */

export const initials = (first = '', last = '') =>
  `${first.trim().charAt(0)}${last.trim().charAt(0)}`.toUpperCase() || 'U'

export const greeting = (date = new Date()) => {
  const h = date.getHours()
  if (h < 5) return 'Working late'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

/* ------------------------------------------------------------------ colour */

/** Each board gets a stable accent from its id. Colours are defined in tokens.css. */
export const BOARD_COLOR_COUNT = 8
export const boardColor = (id) => `var(--board-${Math.abs(Number(id) || 0) % BOARD_COLOR_COUNT})`

/* ------------------------------------------------------------------- dates */

const DAY = 86_400_000
const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
const dayFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
const yearFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
const longFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

/** Calendar-day difference between a date and today (negative = past). */
const dayDiff = (date, now = new Date()) => Math.round((startOfDay(date) - startOfDay(now)) / DAY)

/** 'overdue' | 'soon' (within 2 days) | 'later' | 'done' | null */
export function dueState(task, now = new Date()) {
  if (!task.due_date) return null
  if (task.status === 'done') return 'done'
  const due = new Date(task.due_date)
  if (due < now) return 'overdue'
  return dayDiff(due, now) <= 2 ? 'soon' : 'later'
}

/** Short human label: "Today, 4:30 PM", "Tomorrow", "Oct 25", "3 days overdue". */
export function dueLabel(task, now = new Date()) {
  if (!task.due_date) return ''
  const due = new Date(task.due_date)
  const diff = dayDiff(due, now)
  const state = dueState(task, now)

  if (state === 'overdue') {
    if (diff === 0) return `Overdue, ${timeFmt.format(due)}`
    if (diff === -1) return 'Overdue since yesterday'
    return `${Math.abs(diff)} days overdue`
  }
  if (diff === 0) return `Today, ${timeFmt.format(due)}`
  if (diff === 1) return `Tomorrow, ${timeFmt.format(due)}`
  return due.getFullYear() === now.getFullYear() ? dayFmt.format(due) : yearFmt.format(due)
}

export const formatDateTime = (iso) => (iso ? longFmt.format(new Date(iso)) : '')

/** ISO string -> value for <input type="datetime-local"> (local time). */
export function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** <input type="datetime-local"> value -> ISO string (or null when empty). */
export const fromLocalInput = (value) => (value ? new Date(value).toISOString() : null)

export const pluralize = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
