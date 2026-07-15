import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, setToken } from '../lib/api'

export function useAuthGuard() {
  const navigate = useNavigate()
  return useCallback((err: unknown): string => {
    if (err instanceof ApiError && err.status === 401) {
      setToken(null)
      navigate('/admin/login')
      return 'Сессия истекла. Войдите снова.'
    }
    return err instanceof Error ? err.message : 'Неизвестная ошибка'
  }, [navigate])
}
