import { useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../lib/firebase'

const DEMO_ADMIN_KEY = 'kegger.demoAdmin'

export interface AuthApi {
  user: User | null
  /** True when an admin is signed in (real auth) or demo-admin is unlocked. */
  isAdmin: boolean
  ready: boolean
  demoMode: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOutUser: () => Promise<void>
}

export function useAuth(): AuthApi {
  const demoMode = !isFirebaseConfigured
  const [user, setUser] = useState<User | null>(null)
  const [demoAdmin, setDemoAdmin] = useState(
    () => demoMode && localStorage.getItem(DEMO_ADMIN_KEY) === '1',
  )
  const [ready, setReady] = useState(demoMode)

  useEffect(() => {
    if (demoMode) return
    return onAuthStateChanged(auth!, (u) => {
      setUser(u)
      setReady(true)
    })
  }, [demoMode])

  const signIn = async (email: string, password: string) => {
    if (demoMode) {
      // In demo mode any non-empty credentials unlock the admin tools so the
      // owner can try the full workflow before Firebase Auth is configured.
      if (!email || !password) throw new Error('Enter an email and password.')
      localStorage.setItem(DEMO_ADMIN_KEY, '1')
      setDemoAdmin(true)
      return
    }
    await signInWithEmailAndPassword(auth!, email, password)
  }

  const signOutUser = async () => {
    if (demoMode) {
      localStorage.removeItem(DEMO_ADMIN_KEY)
      setDemoAdmin(false)
      return
    }
    await signOut(auth!)
  }

  return {
    user,
    isAdmin: demoMode ? demoAdmin : !!user,
    ready,
    demoMode,
    signIn,
    signOutUser,
  }
}
