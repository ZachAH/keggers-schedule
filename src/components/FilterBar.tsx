import { addMonths, addWeeks, format } from 'date-fns'
import type { ViewMode, Worker } from '../types'

interface Props {
  view: ViewMode
  onViewChange: (v: ViewMode) => void
  cursor: Date
  onCursorChange: (d: Date) => void
  workers: Worker[]
  workerFilter: string
  onWorkerFilterChange: (id: string) => void
}

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: 'month', label: 'Month' },
  { id: 'week', label: 'Week' },
  { id: 'agenda', label: 'Agenda' },
]

export default function FilterBar({
  view,
  onViewChange,
  cursor,
  onCursorChange,
  workers,
  workerFilter,
  onWorkerFilterChange,
}: Props) {
  const step = (dir: number) => {
    if (view === 'week') onCursorChange(addWeeks(cursor, dir))
    else onCursorChange(addMonths(cursor, dir))
  }

  const label =
    view === 'week'
      ? `Week of ${format(cursor, 'MMM d, yyyy')}`
      : format(cursor, 'MMMM yyyy')

  return (
    <div className="mx-auto max-w-5xl space-y-3 px-4 py-3">
      {/* View switcher + date nav */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-lg bg-slate-100 p-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onViewChange(v.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                view === v.id
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {view !== 'agenda' && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => onCursorChange(new Date())}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {view !== 'agenda' && (
        <div className="text-lg font-bold text-slate-900">{label}</div>
      )}

      {/* Worker filter chips */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <FilterChip
          active={workerFilter === 'all'}
          onClick={() => onWorkerFilterChange('all')}
          label="Everyone"
        />
        {workers.map((w) => (
          <FilterChip
            key={w.id}
            active={workerFilter === w.id}
            onClick={() => onWorkerFilterChange(w.id)}
            label={w.name}
            color={w.color}
          />
        ))}
      </div>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean
  onClick: () => void
  label: string
  color?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      }`}
    >
      {color && (
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: active ? '#fff' : color }}
        />
      )}
      {label}
    </button>
  )
}
