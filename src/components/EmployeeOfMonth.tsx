import type { EmployeeOfMonth as Eotm } from '../types'

interface Props {
  eotm: Eotm
  isAdmin: boolean
  onEdit: () => void
}

// Sparkles scattered around the photo. Each gets a position, size, and a
// staggered animation delay so they twinkle out of sync.
const SPARKLES = [
  { top: '-6%', left: '12%', size: 'text-xl', delay: '0s' },
  { top: '4%', left: '84%', size: 'text-2xl', delay: '0.5s' },
  { top: '38%', left: '-8%', size: 'text-lg', delay: '1s' },
  { top: '44%', left: '100%', size: 'text-xl', delay: '0.3s' },
  { top: '86%', left: '6%', size: 'text-2xl', delay: '1.4s' },
  { top: '92%', left: '78%', size: 'text-lg', delay: '0.8s' },
  { top: '70%', left: '94%', size: 'text-base', delay: '1.8s' },
  { top: '14%', left: '-4%', size: 'text-base', delay: '1.1s' },
]

export default function EmployeeOfMonth({ eotm, isAdmin, onEdit }: Props) {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-3">
      <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-pink-50 px-4 py-5 shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:gap-5 sm:text-left">
          {/* Photo with spinning gradient ring + twinkling sparkles. */}
          <div className="relative shrink-0">
            <div className="eotm-ring absolute -inset-1.5 rounded-full bg-[conic-gradient(from_0deg,#fbbf24,#ec4899,#8b5cf6,#14b8a6,#fbbf24)] blur-[1px]" />
            <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-white shadow-md sm:h-32 sm:w-32">
              {eotm.image ? (
                <img
                  src={eotm.image}
                  alt={eotm.name || 'Employee of the Month'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">
                  🌟
                </div>
              )}
            </div>
            {SPARKLES.map((s, i) => (
              <span
                key={i}
                className={`eotm-sparkle pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 ${s.size}`}
                style={{ top: s.top, left: s.left, animationDelay: s.delay }}
                aria-hidden
              >
                ✨
              </span>
            ))}
          </div>

          {/* Title + honoree. */}
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
              ✨ Employee of the Month ✨
            </p>
            <h2 className="mt-0.5 truncate text-2xl font-extrabold text-slate-900">
              {eotm.name || 'To be announced'}
            </h2>
            {eotm.month && (
              <p className="text-sm font-medium text-slate-500">{eotm.month}</p>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={onEdit}
                className="mt-2 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50"
              >
                ✏️ Edit spotlight
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
