import type { Shift, Worker } from '../types'

interface Props {
  shift: Shift
  worker?: Worker
  onClick?: () => void
  /** Compact single-line style for dense month cells. */
  compact?: boolean
}

export default function ShiftCard({ shift, worker, onClick, compact }: Props) {
  const color = worker?.color ?? '#64748b'
  const name = worker?.name ?? 'Unassigned'

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[10px] leading-tight transition active:scale-[0.98]"
        style={{ backgroundColor: `${color}1a` }}
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="truncate font-medium" style={{ color }}>
          {name}
        </span>
      </button>
    )
  }

  const time =
    shift.startTime && shift.endTime
      ? `${shift.startTime} – ${shift.endTime}`
      : shift.startTime ?? ''

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-0.5 rounded-lg border-l-4 bg-white px-3 py-2 text-left shadow-sm transition hover:shadow active:scale-[0.99]"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-slate-900">{shift.event}</span>
        {time && (
          <span className="shrink-0 text-xs font-medium text-slate-500">
            {time}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-sm">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-medium" style={{ color }}>
          {name}
        </span>
        {shift.location && (
          <span className="truncate text-slate-400">· {shift.location}</span>
        )}
      </div>
    </button>
  )
}
