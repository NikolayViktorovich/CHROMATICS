import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api, setToken } from '../lib/api'
import { Logo } from '../components/Logo'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const passwordChanged = Boolean(
    (location.state as { passwordChanged?: boolean } | null)?.passwordChanged,
  )
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token } = await api.login(username, password)
      setToken(token)
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <form
          onSubmit={submit}
          className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
        >
          <h1 className="mb-6 text-center text-xl font-bold">Вход в админ-панель</h1>
          {passwordChanged && (
            <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
              Пароль изменён. Войдите с новым паролем.
            </p>
          )}
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">Логин</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-neutral-400"
            />
          </label>
          <label className="mb-6 block">
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-neutral-400"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-neutral-900 py-2.5 font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            {loading ? 'Входим…' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
