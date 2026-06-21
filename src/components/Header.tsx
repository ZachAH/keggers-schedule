interface Props {
  isAdmin: boolean
  demoMode: boolean
  onLogin: () => void
  onLogout: () => void
  onManageWorkers: () => void
}

export default function Header({
  isAdmin,
  demoMode,
  onLogin,
  onLogout,
  onManageWorkers,
}: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-lg">
            🍹
          </div>
          <div className="leading-tight">
            <h1 className="text-base font-bold text-slate-900">
              Kegger Mocktails
            </h1>
            <p className="text-xs text-slate-500">Work schedule</p>
          </div>
          {demoMode && (
            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              DEMO
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <button
                type="button"
                onClick={onManageWorkers}
                className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Workers
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onLogin}
              className="rounded-lg bg-brand-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
