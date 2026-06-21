import { useState } from 'react'
import Modal from './Modal'

interface Props {
  open: boolean
  demoMode: boolean
  onClose: () => void
  onSignIn: (email: string, password: string) => Promise<void>
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

export default function LoginModal({
  open,
  demoMode,
  onClose,
  onSignIn,
}: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onSignIn(email, password)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Admin sign in" sheet>
      <form onSubmit={submit} className="space-y-3">
        {demoMode && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Demo mode: any email & password will unlock the admin tools so you
            can try editing. Connect Firebase for real accounts.
          </p>
        )}
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoFocus
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-brand-700 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </Modal>
  )
}
