import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
} from 'date-fns'
import type { Shift, Worker } from '../types'

export const ISO = 'yyyy-MM-dd'

export function toIso(date: Date): string {
  return format(date, ISO)
}

/** All days to render for a month grid (padded to full weeks, Mon start). */
export function monthGridDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

/** The seven days of the week containing `date` (Mon start). */
export function weekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function workerById(workers: Worker[]): Map<string, Worker> {
  return new Map(workers.map((w) => [w.id, w]))
}

/** Index shifts by ISO date for fast day lookups. */
export function shiftsByDate(shifts: Shift[]): Map<string, Shift[]> {
  const map = new Map<string, Shift[]>()
  for (const s of shifts) {
    const arr = map.get(s.date)
    if (arr) arr.push(s)
    else map.set(s.date, [s])
  }
  // Sort each day's shifts by start time then event for stable display.
  for (const arr of map.values()) {
    arr.sort((a, b) =>
      (a.startTime ?? '').localeCompare(b.startTime ?? '') ||
      a.event.localeCompare(b.event),
    )
  }
  return map
}

export function applyFilter(shifts: Shift[], workerId: string): Shift[] {
  if (workerId === 'all') return shifts
  return shifts.filter((s) => s.workerId === workerId)
}
