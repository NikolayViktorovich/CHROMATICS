import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, api, getToken, setToken } from '../lib/api'

const CHECK_INTERVAL_MS = 10_000

export function useSessionGuard() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!getToken()) return

    let active = true

    const logout = () => {
      if (!active) return
      setToken(null)
      navigate('/admin/login', { replace: true })
    }

    const checkSession = async () => {
      try {
        await api.getMe()
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          logout()
        }
      }
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === 'admin_token' && !event.newValue) {
        logout()
      }
    }

    void checkSession()
    const timer = window.setInterval(() => {
      void checkSession()
    }, CHECK_INTERVAL_MS)
    window.addEventListener('storage', onStorage)

    return () => {
      active = false
      window.clearInterval(timer)
      window.removeEventListener('storage', onStorage)
    }
  }, [navigate])
}
