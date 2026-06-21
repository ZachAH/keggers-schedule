import { useState } from 'react'
import Modal from './Modal'
import { WORKER_COLORS } from '../lib/demoData'
import type { Worker } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  workers: Worker[]
  onAdd: (w: Omit<Worker, 'id'>) => Promise<void>
  onUpdate: (id: string, w: Partial<Omit<Worker, 'id'>>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function WorkerManager({
  open,
  onClose,
  workers,
  onAdd,
  onUpdate,
  onDelete,
}: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(WORKER_COLORS[0])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await onAdd({ name: name.trim(), color })
    setName('')
    // Rotate to the next palette color for convenience.
    setColor(WORKER_COLORS[(WORKER_COLORS.indexOf(color) + 1) % WORKER_COLORS.length])
  }

  return (
    <Modal open={open} onClose={onClose} title="Workers" sheet>
      <div className="space-y-2">
        {workers.map((w) => (
          <div
            key={w.id}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"
          >
            <input
              type="color"
              value={w.color}
              onChange={(e) => onUpdate(w.id, { color: e.target.value })}
              className="h-6 w-6 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
              aria-label={`${w.name} color`}
            />
            <input
              value={w.name}
              onChange={(e) => onUpdate(w.id, { name: e.target.value })}
              className="flex-1 rounded border-0 bg-transparent text-sm font-medium focus:bg-slate-50 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (confirm(`Remove ${w.name}? Their shifts will be removed too.`))
                  onDelete(w.id)
              }}
              className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={add} className="mt-4 flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-9 w-9 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
          aria-label="New worker color"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New worker name"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          Add
        </button>
      </form>
    </Modal>
  )
}
