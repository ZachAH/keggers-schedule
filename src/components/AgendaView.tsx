import { format, parseISO, isToday, isPast } from 'date-fns'
import ShiftCard from './ShiftCard'
import type { Shift, Worker } from '../types'

interface Props {
  shifts: Shift[]
  workers: Map<string, Worker>
  onSelectShift: (s: Shift) => void
}

/** Upcoming shifts grouped by date, soonest first. Past dates are hidden. */
export default function AgendaView({ shifts, workers, onSelectShift }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = shifts
    .filter((s) => {
      const d = parseISO(s.date)
      return isToday(d) || !isPast(d)
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  const groups = new Map<string, Shift[]>()
  for (const s of upcoming) {
    const arr = groups.get(s.date)
    if (arr) arr.push(s)
    else groups.set(s.date, [s])
  }

  if (groups.size === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-400">
        No upcoming shifts.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 pb-24">
      {[...groups.entries()].map(([iso, dayShifts]) => {
        const d = parseISO(iso)
        return (
          <div key={iso}>
            <div className="mb-2 flex items-baseline gap-2">
              <span className="text-sm font-bold text-slate-900">
                {format(d, 'EEEE, MMMM d')}
              </span>
              {isToday(d) && (
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                  Today
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              {dayShifts.map((s) => (
                <ShiftCard
                  key={s.id}
                  shift={s}
                  worker={workers.get(s.workerId)}
                  onClick={() => onSelectShift(s)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
