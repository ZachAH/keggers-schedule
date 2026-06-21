import { format, addDays, startOfWeek } from 'date-fns'
import type { Shift, Worker } from '../types'

/** A friendly default palette for workers. */
export const WORKER_COLORS = [
  '#0d9488', // teal
  '#db2777', // pink
  '#7c3aed', // violet
  '#ea580c', // orange
  '#2563eb', // blue
  '#65a30d', // lime
  '#dc2626', // red
  '#0891b2', // cyan
]

export const DEMO_WORKERS: Worker[] = [
  { id: 'w-mom', name: 'Mom', color: WORKER_COLORS[0] },
  { id: 'w-sara', name: 'Sara', color: WORKER_COLORS[1] },
  { id: 'w-jake', name: 'Jake', color: WORKER_COLORS[2] },
  { id: 'w-emma', name: 'Emma', color: WORKER_COLORS[3] },
  { id: 'w-luke', name: 'Luke', color: WORKER_COLORS[4] },
]

function iso(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Builds some seed shifts around the current week so the demo never looks empty. */
export function buildDemoShifts(): Shift[] {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 })
  const d = (offset: number) => iso(addDays(monday, offset))

  return [
    { id: 's1', date: d(1), workerId: 'w-mom', event: 'Farmers Market Booth', startTime: '8:00 AM', endTime: '1:00 PM', location: 'Downtown Square' },
    { id: 's2', date: d(1), workerId: 'w-sara', event: 'Farmers Market Booth', startTime: '8:00 AM', endTime: '1:00 PM', location: 'Downtown Square' },
    { id: 's3', date: d(3), workerId: 'w-jake', event: 'Corporate Happy Hour', startTime: '4:00 PM', endTime: '8:00 PM', location: 'Acme HQ' },
    { id: 's4', date: d(5), workerId: 'w-emma', event: 'Smith Wedding', startTime: '5:00 PM', endTime: '11:00 PM', location: 'Lakeside Venue' },
    { id: 's5', date: d(5), workerId: 'w-mom', event: 'Smith Wedding', startTime: '5:00 PM', endTime: '11:00 PM', location: 'Lakeside Venue' },
    { id: 's6', date: d(5), workerId: 'w-luke', event: 'Smith Wedding', startTime: '5:00 PM', endTime: '11:00 PM', location: 'Lakeside Venue' },
    { id: 's7', date: d(6), workerId: 'w-sara', event: 'Birthday Party', startTime: '2:00 PM', endTime: '5:00 PM', location: 'Private Home' },
    { id: 's8', date: d(8), workerId: 'w-jake', event: 'Brewery Pop-up', startTime: '6:00 PM', endTime: '10:00 PM' },
  ]
}
