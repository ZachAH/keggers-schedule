import { useRef, useState } from 'react'
import Modal from './Modal'
import type { EmployeeOfMonth } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  eotm: EmployeeOfMonth
  onSave: (e: EmployeeOfMonth) => Promise<void>
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

/**
 * Reads an image File and returns a downscaled JPEG data URL. Keeping the photo
 * small (max 512px) means it fits comfortably in a Firestore doc / localStorage
 * without needing a separate file-storage service.
 */
function fileToScaledDataUrl(file: File, max = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('That file is not a valid image.'))
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Could not process the image.'))
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

export default function EotmEditModal({ open, onClose, eotm, onSave }: Props) {
  const [name, setName] = useState(eotm.name)
  const [month, setMonth] = useState(eotm.month)
  const [image, setImage] = useState(eotm.image)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const pickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    try {
      setImage(await fileToScaledDataUrl(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load image.')
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Add a name.')
    setBusy(true)
    setError('')
    try {
      await onSave({ name: name.trim(), month: month.trim(), image })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Employee of the Month" sheet>
      <form onSubmit={submit} className="space-y-3">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="group relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow ring-2 ring-amber-300"
            aria-label="Choose photo"
          >
            {image ? (
              <img src={image} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl">
                🌟
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-black/45 py-1 text-[11px] font-semibold text-white">
              Change photo
            </span>
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            onChange={pickFile}
            className="hidden"
          />
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">
            Name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Who's the star this month?"
            className={inputClass}
            autoFocus
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">
            Month label
          </span>
          <input
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="e.g. June 2026"
            className={inputClass}
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save spotlight'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
