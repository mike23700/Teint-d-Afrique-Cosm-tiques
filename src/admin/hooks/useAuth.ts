import { useCallback, useEffect, useState } from 'react'
import { checkSession, login as apiLogin, logout as apiLogout } from '@/admin/api'

export type AuthStatus = 'checking' | 'authenticated' | 'anonymous'

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>('checking')

  useEffect(() => {
    checkSession()
      .then(authenticated => setStatus(authenticated ? 'authenticated' : 'anonymous'))
      .catch(() => setStatus('anonymous'))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await apiLogin(email, password)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } finally {
      setStatus('anonymous')
    }
  }, [])

  return { status, login, logout }
}
