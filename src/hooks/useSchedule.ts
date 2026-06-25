import { useCallback, useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  query,
  orderBy,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase'
import { DEMO_WORKERS, buildDemoShifts, DEFAULT_EOTM } from '../lib/demoData'
import type { EmployeeOfMonth, Note, Shift, Worker } from '../types'

const LS_SHIFTS = 'kegger.shifts'
const LS_WORKERS = 'kegger.workers'
const LS_EOTM = 'kegger.eotm'
const LS_NOTES = 'kegger.notes'

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export interface ScheduleApi {
  workers: Worker[]
  shifts: Shift[]
  eotm: EmployeeOfMonth
  notes: Note[]
  loading: boolean
  demoMode: boolean
  /** Set when live Firestore reads fail (e.g. security rules not deployed). */
  error: string | null
  setEmployeeOfMonth: (e: EmployeeOfMonth) => Promise<void>
  addNote: (text: string) => Promise<void>
  updateNote: (id: string, text: string) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  addShift: (s: Omit<Shift, 'id'>) => Promise<void>
  updateShift: (id: string, s: Partial<Omit<Shift, 'id'>>) => Promise<void>
  deleteShift: (id: string) => Promise<void>
  addWorker: (w: Omit<Worker, 'id'>) => Promise<void>
  updateWorker: (id: string, w: Partial<Omit<Worker, 'id'>>) => Promise<void>
  deleteWorker: (id: string) => Promise<void>
}

export function useSchedule(): ScheduleApi {
  const demoMode = !isFirebaseConfigured
  const [workers, setWorkers] = useState<Worker[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [eotm, setEotm] = useState<EmployeeOfMonth>(DEFAULT_EOTM)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Initial load + live subscription ──────────────────────────────
  useEffect(() => {
    if (demoMode) {
      const w = loadLocal<Worker[]>(LS_WORKERS, DEMO_WORKERS)
      const s = loadLocal<Shift[]>(LS_SHIFTS, buildDemoShifts())
      setWorkers(w)
      setShifts(s)
      setEotm(loadLocal<EmployeeOfMonth>(LS_EOTM, DEFAULT_EOTM))
      setNotes(loadLocal<Note[]>(LS_NOTES, []))
      setLoading(false)
      return
    }

    const onErr = (e: { code?: string }) => {
      setLoading(false)
      setError(
        e.code === 'permission-denied'
          ? 'Permission denied — deploy the Firestore security rules (see step 7 in the README).'
          : 'Could not reach the database. Check your connection and Firebase config.',
      )
    }

    // Live Firestore subscriptions.
    const unsubWorkers = onSnapshot(
      query(collection(db!, 'workers'), orderBy('name')),
      (snap) => {
        setError(null)
        setWorkers(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Worker))
      },
      onErr,
    )
    const unsubShifts = onSnapshot(
      query(collection(db!, 'shifts'), orderBy('date')),
      (snap) => {
        setError(null)
        setShifts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Shift))
        setLoading(false)
      },
      onErr,
    )
    // Single doc holding the current Employee of the Month.
    const unsubEotm = onSnapshot(
      doc(db!, 'meta', 'eotm'),
      (snap) => {
        if (snap.exists()) setEotm(snap.data() as EmployeeOfMonth)
      },
      onErr,
    )
    // Admin notes / announcements, newest first.
    const unsubNotes = onSnapshot(
      query(collection(db!, 'notes'), orderBy('createdAt', 'desc')),
      (snap) => {
        setNotes(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Note))
      },
      onErr,
    )
    return () => {
      unsubWorkers()
      unsubShifts()
      unsubEotm()
      unsubNotes()
    }
  }, [demoMode])

  // ── Persist demo data on change ───────────────────────────────────
  useEffect(() => {
    if (demoMode && !loading) saveLocal(LS_WORKERS, workers)
  }, [workers, demoMode, loading])
  useEffect(() => {
    if (demoMode && !loading) saveLocal(LS_SHIFTS, shifts)
  }, [shifts, demoMode, loading])
  useEffect(() => {
    if (demoMode && !loading) saveLocal(LS_EOTM, eotm)
  }, [eotm, demoMode, loading])
  useEffect(() => {
    if (demoMode && !loading) saveLocal(LS_NOTES, notes)
  }, [notes, demoMode, loading])

  // ── Shift mutations ───────────────────────────────────────────────
  const addShift = useCallback(
    async (s: Omit<Shift, 'id'>) => {
      if (demoMode) {
        setShifts((prev) => [...prev, { ...s, id: uid() }])
        return
      }
      await addDoc(collection(db!, 'shifts'), s)
    },
    [demoMode],
  )

  const updateShift = useCallback(
    async (id: string, s: Partial<Omit<Shift, 'id'>>) => {
      if (demoMode) {
        setShifts((prev) => prev.map((x) => (x.id === id ? { ...x, ...s } : x)))
        return
      }
      await updateDoc(doc(db!, 'shifts', id), s)
    },
    [demoMode],
  )

  const deleteShift = useCallback(
    async (id: string) => {
      if (demoMode) {
        setShifts((prev) => prev.filter((x) => x.id !== id))
        return
      }
      await deleteDoc(doc(db!, 'shifts', id))
    },
    [demoMode],
  )

  // ── Employee of the Month ─────────────────────────────────────────
  const setEmployeeOfMonth = useCallback(
    async (e: EmployeeOfMonth) => {
      if (demoMode) {
        setEotm(e)
        return
      }
      await setDoc(doc(db!, 'meta', 'eotm'), e)
    },
    [demoMode],
  )

  // ── Note mutations ────────────────────────────────────────────────
  const addNote = useCallback(
    async (text: string) => {
      const note = { text, createdAt: Date.now() }
      if (demoMode) {
        setNotes((prev) => [{ ...note, id: uid() }, ...prev])
        return
      }
      await addDoc(collection(db!, 'notes'), note)
    },
    [demoMode],
  )

  const updateNote = useCallback(
    async (id: string, text: string) => {
      if (demoMode) {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)))
        return
      }
      await updateDoc(doc(db!, 'notes', id), { text })
    },
    [demoMode],
  )

  const deleteNote = useCallback(
    async (id: string) => {
      if (demoMode) {
        setNotes((prev) => prev.filter((n) => n.id !== id))
        return
      }
      await deleteDoc(doc(db!, 'notes', id))
    },
    [demoMode],
  )

  // ── Worker mutations ──────────────────────────────────────────────
  const addWorker = useCallback(
    async (w: Omit<Worker, 'id'>) => {
      if (demoMode) {
        setWorkers((prev) => [...prev, { ...w, id: uid() }])
        return
      }
      await addDoc(collection(db!, 'workers'), w)
    },
    [demoMode],
  )

  const updateWorker = useCallback(
    async (id: string, w: Partial<Omit<Worker, 'id'>>) => {
      if (demoMode) {
        setWorkers((prev) => prev.map((x) => (x.id === id ? { ...x, ...w } : x)))
        return
      }
      await updateDoc(doc(db!, 'workers', id), w)
    },
    [demoMode],
  )

  const deleteWorker = useCallback(
    async (id: string) => {
      if (demoMode) {
        setWorkers((prev) => prev.filter((x) => x.id !== id))
        setShifts((prev) => prev.filter((x) => x.workerId !== id))
        return
      }
      await deleteDoc(doc(db!, 'workers', id))
    },
    [demoMode],
  )

  return {
    workers,
    shifts,
    eotm,
    notes,
    loading,
    demoMode,
    error,
    setEmployeeOfMonth,
    addNote,
    updateNote,
    deleteNote,
    addShift,
    updateShift,
    deleteShift,
    addWorker,
    updateWorker,
    deleteWorker,
  }
}
