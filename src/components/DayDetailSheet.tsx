import { format } from 'date-fns'
import Modal from './Modal'
import ShiftCard from './ShiftCard'
import { toIso } from '../lib/scheduleUtils'
import type { Shift, Worker } from '../types'

interface Props {
  day: Date | null
  shiftsByDay: Map<string, Shift[]>
  workers: Map<string, Worker>
  isAdmin: boolean
  onClose: () => void
  onEditShift: (s: Shift) => void
  onAddShift: (day: Date) => void
}

export default function DayDetailSheet({
  day,
  shiftsByDay,
  workers,
  isAdmin,
  onClose,
  onEditShift,
  onAddShift,
}: Props) {
  if (!day) return null
  const dayShifts = shiftsByDay.get(toIso(day)) ?? []

  return (
    <Modal open={!!day} onClose={onClose} title={format(day, 'EEEE, MMMM d')} sheet>
      {dayShifts.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">
          No one scheduled this day.
        </p>
      ) : (
        <div className="space-y-2">
          {dayShifts.map((s) => (
            <ShiftCard
              key={s.id}
              shift={s}
              worker={workers.get(s.workerId)}
              onClick={isAdmin ? () => onEditShift(s) : undefined}
            />
          ))}
        </div>
      )}

      {isAdmin && (
        <button
          type="button"
          onClick={() => onAddShift(day)}
          className="mt-4 w-full rounded-lg bg-brand-700 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          + Add shift
        </button>
      )}
    </Modal>
  )
}
