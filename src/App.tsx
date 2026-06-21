import { useMemo, useState } from 'react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import MonthView from './components/MonthView'
import WeekView from './components/WeekView'
import AgendaView from './components/AgendaView'
import DayDetailSheet from './components/DayDetailSheet'
import ShiftFormModal from './components/ShiftFormModal'
import LoginModal from './components/LoginModal'
import WorkerManager from './components/WorkerManager'
import { useSchedule } from './hooks/useSchedule'
import { useAuth } from './hooks/useAuth'
import {
  applyFilter,
  shiftsByDate,
  toIso,
  workerById,
} from './lib/scheduleUtils'
import type { Shift, ViewMode } from './types'

export default function App() {
  const schedule = useSchedule()
  const auth = useAuth()

  const [view, setView] = useState<ViewMode>('month')
  const [cursor, setCursor] = useState(() => new Date())
  const [workerFilter, setWorkerFilter] = useState('all')

  // Modal state
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [workersOpen, setWorkersOpen] = useState(false)
  const [shiftForm, setShiftForm] = useState<{
    open: boolean
    editing: Shift | null
    date: string
  }>({ open: false, editing: null, date: toIso(new Date()) })

  const filtered = useMemo(
    () => applyFilter(schedule.shifts, workerFilter),
    [schedule.shifts, workerFilter],
  )
  const byDay = useMemo(() => shiftsByDate(filtered), [filtered])
  const workerMap = useMemo(
    () => workerById(schedule.workers),
    [schedule.workers],
  )

  const openAdd = (day: Date) => {
    setSelectedDay(null)
    setShiftForm({ open: true, editing: null, date: toIso(day) })
  }
  const openEdit = (s: Shift) => {
    setSelectedDay(null)
    setShiftForm({ open: true, editing: s, date: s.date })
  }

  return (
    <div className="min-h-screen">
      <Header
        isAdmin={auth.isAdmin}
        demoMode={schedule.demoMode}
        onLogin={() => setLoginOpen(true)}
        onLogout={auth.signOutUser}
        onManageWorkers={() => setWorkersOpen(true)}
      />

      <FilterBar
        view={view}
        onViewChange={setView}
        cursor={cursor}
        onCursorChange={setCursor}
        workers={schedule.workers}
        workerFilter={workerFilter}
        onWorkerFilterChange={setWorkerFilter}
      />

      {schedule.error && (
        <div className="mx-auto max-w-5xl px-4">
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {schedule.error}
          </div>
        </div>
      )}

      {schedule.loading ? (
        <div className="py-20 text-center text-slate-400">Loading schedule…</div>
      ) : view === 'month' ? (
        <MonthView
          month={cursor}
          shiftsByDay={byDay}
          workers={workerMap}
          onSelectDay={setSelectedDay}
        />
      ) : view === 'week' ? (
        <WeekView
          cursor={cursor}
          shiftsByDay={byDay}
          workers={workerMap}
          onSelectShift={(s) => (auth.isAdmin ? openEdit(s) : undefined)}
          onSelectDay={setSelectedDay}
        />
      ) : (
        <AgendaView
          shifts={filtered}
          workers={workerMap}
          onSelectShift={(s) => (auth.isAdmin ? openEdit(s) : undefined)}
        />
      )}

      {/* Floating add button for admins */}
      {auth.isAdmin && !schedule.loading && (
        <button
          type="button"
          onClick={() => openAdd(selectedDay ?? new Date())}
          className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-3xl text-white shadow-lg transition hover:bg-brand-800 active:scale-95"
          aria-label="Add shift"
        >
          +
        </button>
      )}

      <DayDetailSheet
        day={selectedDay}
        shiftsByDay={byDay}
        workers={workerMap}
        isAdmin={auth.isAdmin}
        onClose={() => setSelectedDay(null)}
        onEditShift={openEdit}
        onAddShift={openAdd}
      />

      <ShiftFormModal
        key={`${shiftForm.editing?.id ?? 'new'}-${shiftForm.date}-${shiftForm.open}`}
        open={shiftForm.open}
        onClose={() => setShiftForm((s) => ({ ...s, open: false }))}
        workers={schedule.workers}
        editing={shiftForm.editing}
        defaultDate={shiftForm.date}
        onSave={(data) =>
          shiftForm.editing
            ? schedule.updateShift(shiftForm.editing.id, data)
            : schedule.addShift(data)
        }
        onDelete={schedule.deleteShift}
      />

      <LoginModal
        open={loginOpen}
        demoMode={auth.demoMode}
        onClose={() => setLoginOpen(false)}
        onSignIn={auth.signIn}
      />

      <WorkerManager
        open={workersOpen}
        onClose={() => setWorkersOpen(false)}
        workers={schedule.workers}
        onAdd={schedule.addWorker}
        onUpdate={schedule.updateWorker}
        onDelete={schedule.deleteWorker}
      />
    </div>
  )
}
