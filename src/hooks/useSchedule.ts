import { useCallback, useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase'
import { DEMO_WORKERS, buildDemoShifts } from '../lib/demoData'
import type { Shift, Worker } from '../types'

const LS_SHIFTS = 'kegger.shifts'
const LS_WORKERS = 'kegger.workers'

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
  loading: boolean
  demoMode: boolean
  /** Set when live Firestore reads fail (e.g. security rules not deployed). */
  error: string | null
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Initial load + live subscription ──────────────────────────────
  useEffect(() => {
    if (demoMode) {
      const w = loadLocal<Worker[]>(LS_WORKERS, DEMO_WORKERS)
      const s = loadLocal<Shift[]>(LS_SHIFTS, buildDemoShifts())
      setWorkers(w)
      setShifts(s)
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
    return () => {
      unsubWorkers()
      unsubShifts()
    }
  }, [demoMode])

  // ── Persist demo data on change ───────────────────────────────────
  useEffect(() => {
    if (demoMode && !loading) saveLocal(LS_WORKERS, workers)
  }, [workers, demoMode, loading])
  useEffect(() => {
    if (demoMode && !loading) saveLocal(LS_SHIFTS, shifts)
  }, [shifts, demoMode, loading])

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
    loading,
    demoMode,
    error,
    addShift,
    updateShift,
    deleteShift,
    addWorker,
    updateWorker,
    deleteWorker,
  }
}
