import { format, isToday } from 'date-fns'
import { toIso, weekDays } from '../lib/scheduleUtils'
import ShiftCard from './ShiftCard'
import type { Shift, Worker } from '../types'

interface Props {
  cursor: Date
  shiftsByDay: Map<string, Shift[]>
  workers: Map<string, Worker>
  onSelectShift: (s: Shift) => void
  onSelectDay: (day: Date) => void
}

export default function WeekView({
  cursor,
  shiftsByDay,
  workers,
  onSelectShift,
  onSelectDay,
}: Props) {
  const days = weekDays(cursor)

  return (
    <div className="mx-auto max-w-3xl space-y-3 px-4 pb-24">
      {days.map((day) => {
        const iso = toIso(day)
        const dayShifts = shiftsByDay.get(iso) ?? []
        const today = isToday(day)

        return (
          <div key={iso} className="rounded-xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => onSelectDay(day)}
              className="flex w-full items-center justify-between px-4 py-2.5"
            >
              <span
                className={`text-sm font-bold ${today ? 'text-brand-700' : 'text-slate-700'}`}
              >
                {format(day, 'EEEE, MMM d')}
                {today && (
                  <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] text-brand-700">
                    Today
                  </span>
                )}
              </span>
              <span className="text-xs text-slate-400">
                {dayShifts.length
                  ? `${dayShifts.length} shift${dayShifts.length > 1 ? 's' : ''}`
                  : '—'}
              </span>
            </button>

            {dayShifts.length > 0 && (
              <div className="space-y-1.5 px-3 pb-3">
                {dayShifts.map((s) => (
                  <ShiftCard
                    key={s.id}
                    shift={s}
                    worker={workers.get(s.workerId)}
                    onClick={() => onSelectShift(s)}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
