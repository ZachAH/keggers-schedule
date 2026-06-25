export interface Worker {
  id: string
  name: string
  /** Tailwind-friendly hex color used for this worker's shift pills. */
  color: string
}

export interface Shift {
  id: string
  /** ISO date string, day-precision: "yyyy-MM-dd". */
  date: string
  workerId: string
  /** The event / gig they're working, e.g. "Smith Wedding". */
  event: string
  /** Optional time range, free-form, e.g. "5:00 PM" or "5–9 PM". */
  startTime?: string
  endTime?: string
  /** Optional location / notes. */
  location?: string
}

export interface EmployeeOfMonth {
  /** The honoree's name shown under the photo. */
  name: string
  /** Image source — either a public path ("/EOTM_JUNE.webp") or a data URL. */
  image: string
  /** Free-form label for the period, e.g. "June 2026". */
  month: string
}

export type ViewMode = 'month' | 'week' | 'agenda'

export interface Filters {
  /** Worker id to filter by, or "all". */
  workerId: string
}
