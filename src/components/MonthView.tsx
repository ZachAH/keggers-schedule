import { format, isSameMonth, isToday } from 'date-fns'
import { monthGridDays, toIso } from '../lib/scheduleUtils'
import type { Shift, Worker } from '../types'

interface Props {
  month: Date
  shiftsByDay: Map<string, Shift[]>
  workers: Map<string, Worker>
  onSelectDay: (day: Date) => void
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MonthView({
  month,
  shiftsByDay,
  workers,
  onSelectDay,
}: Props) {
  const days = monthGridDays(month)

  return (
    <div className="mx-auto max-w-5xl px-2 pb-24 sm:px-4">
      <div className="grid grid-cols-7 gap-px">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400"
          >
            <span className="sm:hidden">{d[0]}</span>
            <span className="hidden sm:inline">{d}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-slate-200">
        {days.map((day) => {
          const iso = toIso(day)
          const dayShifts = shiftsByDay.get(iso) ?? []
          const inMonth = isSameMonth(day, month)
          const today = isToday(day)

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`flex min-h-[68px] flex-col gap-1 p-1 text-left transition sm:min-h-[110px] sm:p-1.5 ${
                inMonth ? 'bg-white' : 'bg-slate-50'
              } hover:bg-brand-50`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center self-start rounded-full text-xs font-semibold ${
                  today
                    ? 'bg-brand-700 text-white'
                    : inMonth
                      ? 'text-slate-700'
                      : 'text-slate-300'
                }`}
              >
                {format(day, 'd')}
              </span>

              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                {dayShifts.slice(0, 3).map((s) => {
                  const w = workers.get(s.workerId)
                  const color = w?.color ?? '#64748b'
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] leading-tight"
                      style={{ backgroundColor: `${color}1a` }}
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate font-medium text-slate-700">
                        <span className="hidden sm:inline">{w?.name} · </span>
                        {s.event}
                      </span>
                    </div>
                  )
                })}
                {dayShifts.length > 3 && (
                  <span className="px-1 text-[10px] font-medium text-slate-400">
                    +{dayShifts.length - 3} more
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
