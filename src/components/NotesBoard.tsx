import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { Note } from '../types'

interface Props {
  notes: Note[]
  isAdmin: boolean
  onAdd: (text: string) => Promise<void>
  onUpdate: (id: string, text: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function NotesBoard({
  notes,
  isAdmin,
  onAdd,
  onUpdate,
  onDelete,
}: Props) {
  const [draft, setDraft] = useState('')

  // Nothing to show for visitors when the board is empty.
  if (!isAdmin && notes.length === 0) return null

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    await onAdd(text)
    setDraft('')
  }

  return (
    <section className="mx-auto max-w-5xl px-4 pt-3">
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-800">
          📌 Notes from the boss
        </h2>

        {notes.length === 0 ? (
          <p className="text-sm text-slate-400">
            No notes yet — add one below for the team to see.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((n) => (
              <NoteCard
                key={n.id}
                note={n}
                isAdmin={isAdmin}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}

        {isAdmin && (
          <form onSubmit={add} className="mt-3 flex items-start gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a note for the team…"
              rows={2}
              className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-40"
            >
              Post
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

function NoteCard({
  note,
  isAdmin,
  onUpdate,
  onDelete,
}: {
  note: Note
  isAdmin: boolean
  onUpdate: (id: string, text: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [text, setText] = useState(note.text)

  // Persist edits when the admin clicks away, if anything actually changed.
  const commit = () => {
    const trimmed = text.trim()
    if (!trimmed) {
      setText(note.text)
      return
    }
    if (trimmed !== note.text) onUpdate(note.id, trimmed)
  }

  return (
    <div className="relative rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm">
      {isAdmin ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          rows={3}
          className="w-full resize-none rounded-md border border-transparent bg-transparent pr-5 text-sm text-slate-800 focus:border-amber-300 focus:bg-white focus:outline-none"
        />
      ) : (
        <p className="whitespace-pre-wrap pr-1 text-sm text-slate-800">
          {note.text}
        </p>
      )}

      <div className="mt-1 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          {formatDistanceToNow(note.createdAt, { addSuffix: true })}
        </span>
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              if (confirm('Delete this note?')) onDelete(note.id)
            }}
            className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-red-600 hover:bg-red-100"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
