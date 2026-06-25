import { useState } from 'react'
import Modal from './Modal'
import type { Shift, Worker } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  workers: Worker[]
  /** Existing shift to edit, or null to create. */
  editing: Shift | null
  /** Default date (ISO) when creating. */
  defaultDate: string
  onSave: (data: Omit<Shift, 'id'>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

export default function ShiftFormModal({
  open,
  onClose,
  workers,
  editing,
  defaultDate,
  onSave,
  onDelete,
}: Props) {
  const [date, setDate] = useState(editing?.date ?? defaultDate)
  // When editing we target a single shift; when adding, the admin can pick
  // several workers at once and we create one shift per selected worker.
  const [workerId, setWorkerId] = useState(editing?.workerId ?? workers[0]?.id ?? '')
  const [workerIds, setWorkerIds] = useState<string[]>(
    editing ? [editing.workerId] : [],
  )
  const [event, setEvent] = useState(editing?.event ?? '')
  const [startTime, setStartTime] = useState(editing?.startTime ?? '')
  const [endTime, setEndTime] = useState(editing?.endTime ?? '')
  const [location, setLocation] = useState(editing?.location ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event.trim()) return setError('Event name is required.')
    // Editing targets one shift; adding can target several workers at once.
    const targets = editing ? [workerId] : workerIds
    if (targets.length === 0)
      return setError(editing ? 'Pick a worker.' : 'Pick at least one worker.')
    setBusy(true)
    setError('')
    try {
      // Firestore rejects undefined values — only include optional fields when set.
      const base: Omit<Shift, 'id' | 'workerId'> = { date, event: event.trim() }
      if (startTime.trim()) base.startTime = startTime.trim()
      if (endTime.trim()) base.endTime = endTime.trim()
      if (location.trim()) base.location = location.trim()
      // One shift per selected worker — same event/time/location for all.
      await Promise.all(targets.map((id) => onSave({ ...base, workerId: id })))
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  const toggleWorker = (id: string) => {
    setWorkerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const remove = async () => {
    if (!editing) return
    if (!confirm('Delete this shift?')) return
    setBusy(true)
    try {
      await onDelete(editing.id)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit shift' : 'Add shift'}
      sheet
    >
      <form onSubmit={submit} className="space-y-3">
        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
            required
          />
        </Field>

        {editing ? (
          <Field label="Worker">
            <select
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              className={inputClass}
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <Field label={`Workers${workerIds.length ? ` (${workerIds.length})` : ''}`}>
            <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-slate-300 p-1">
              {workers.length === 0 ? (
                <p className="px-2 py-1.5 text-sm text-slate-400">
                  No workers yet — add some first.
                </p>
              ) : (
                workers.map((w) => (
                  <label
                    key={w.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={workerIds.includes(w.id)}
                      onChange={() => toggleWorker(w.id)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
                    />
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: w.color }}
                    />
                    {w.name}
                  </label>
                ))
              )}
            </div>
          </Field>
        )}

        <Field label="Event / gig">
          <input
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            placeholder="e.g. Smith Wedding"
            className={inputClass}
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start time">
            <input
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="5:00 PM"
              className={inputClass}
            />
          </Field>
          <Field label="End time">
            <input
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="11:00 PM"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Location (optional)">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Venue / address"
            className={inputClass}
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-1">
          {editing && (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            disabled={busy}
            className="ml-auto rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
          >
            {busy
              ? 'Saving…'
              : editing
                ? 'Save changes'
                : workerIds.length > 1
                  ? `Add ${workerIds.length} shifts`
                  : 'Add shift'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600">
        {label}
      </span>
      {children}
    </label>
  )
}
