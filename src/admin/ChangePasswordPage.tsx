import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken, type AdminSession } from '../lib/api'
import { useAuthGuard } from './useAuthGuard'

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-400'

const MIN_LENGTH = 10

function validateClient(current: string, next: string, confirm: string): string | null {
  if (!current || !next || !confirm) return 'Заполните все поля'
  if (next.length < MIN_LENGTH) return `Новый пароль — минимум ${MIN_LENGTH} символов`
  if (next.length > 128) return 'Пароль слишком длинный'
  if (!/[a-zA-Zа-яА-ЯёЁ]/.test(next) || !/\d/.test(next)) {
    return 'Пароль должен содержать буквы и цифры'
  }
  if (next !== confirm) return 'Пароли не совпадают'
  if (current === next) return 'Новый пароль должен отличаться от текущего'
  return null
}

function formatSessionTime(value: string) {
  const date = new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function shortUserAgent(ua: string) {
  if (ua.length <= 48) return ua
  return `${ua.slice(0, 48)}…`
}

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const handleError = useAuthGuard()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const [sessions, setSessions] = useState<AdminSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [sessionsError, setSessionsError] = useState('')
  const [sessionsBusy, setSessionsBusy] = useState(false)

  const refreshSessions = useCallback(
    async (initial = false) => {
      if (initial) setSessionsLoading(true)
      setSessionsError('')
      try {
        const data = await api.getSessions()
        setSessions(data.sessions)
      } catch (err) {
        const message = handleError(err)
        if (message !== 'Сессия истекла. Войдите снова.') {
          setSessionsError(message)
        }
      } finally {
        if (initial) setSessionsLoading(false)
      }
    },
    [handleError],
  )

  useEffect(() => {
    refreshSessions(true)
  }, [refreshSessions])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const clientError = validateClient(currentPassword, newPassword, confirmPassword)
    if (clientError) {
      setError(clientError)
      return
    }

    setLoading(true)
    try {
      await api.changePassword(currentPassword, newPassword)
      setToken(null)
      navigate('/admin/login', {
        replace: true,
        state: { passwordChanged: true },
      })
    } catch (err) {
      setError(handleError(err))
    } finally {
      setLoading(false)
    }
  }

  const revokeOne = async (id: string) => {
    setSessionsBusy(true)
    setError('')
    try {
      await api.revokeSession(id)
      setSuccess('Сессия завершена.')
      await refreshSessions()
    } catch (err) {
      setError(handleError(err))
    } finally {
      setSessionsBusy(false)
    }
  }

  const revokeOthers = async () => {
    setSessionsBusy(true)
    setError('')
    try {
      const { revoked } = await api.revokeOtherSessions()
      setSuccess(revoked > 0 ? `Завершено сессий: ${revoked}.` : 'Других активных сессий нет.')
      await refreshSessions()
    } catch (err) {
      setError(handleError(err))
    } finally {
      setSessionsBusy(false)
    }
  }

  const revokeAll = async () => {
    setSessionsBusy(true)
    setError('')
    try {
      const { token } = await api.revokeAllSessions()
      setToken(token)
      setSuccess('Все сессии завершены. Текущая сессия обновлена.')
      await refreshSessions()
    } catch (err) {
      setError(handleError(err))
    } finally {
      setSessionsBusy(false)
    }
  }

  const otherSessions = sessions.filter((s) => !s.current)

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div>
        <Link to="/admin" className="text-sm text-neutral-500 transition hover:text-neutral-900">
          ← Товары
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-neutral-900">Безопасность</h1>
        <p className="mt-1 text-sm text-neutral-500">
          После смены пароля все сессии завершаются — нужно войти заново.
        </p>
      </div>

      {(error || success) && (
        <div className="space-y-2">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          {success && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{success}</p>
          )}
        </div>
      )}

      <form onSubmit={submit} className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-base font-medium text-neutral-900">Смена пароля</h2>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">Текущий пароль</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
            className={inputClass}
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">Новый пароль</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
            className={inputClass}
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">
            Повторите новый пароль
          </span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            className={inputClass}
          />
        </label>

        <ul className="mb-6 space-y-1 text-xs text-neutral-500">
          <li>Минимум {MIN_LENGTH} символов</li>
          <li>Буквы и цифры</li>
          <li>Не совпадает с логином и текущим паролем</li>
        </ul>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {loading ? 'Сохраняем…' : 'Сменить пароль'}
        </button>
      </form>

      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-medium text-neutral-900">Активные сессии</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Если кто-то зашёл без вас — завершите чужие входы.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={sessionsBusy || otherSessions.length === 0}
              onClick={revokeOthers}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
            >
              Завершить остальные
            </button>
            <button
              type="button"
              disabled={sessionsBusy || sessions.length === 0}
              onClick={revokeAll}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-50"
            >
              Завершить все
            </button>
          </div>
        </div>

        {sessionsLoading ? (
          <p className="text-sm text-neutral-500">Загрузка сессий…</p>
        ) : sessionsError ? (
          <div>
            <p className="text-sm text-red-600">{sessionsError}</p>
            <button
              type="button"
              onClick={() => refreshSessions(true)}
              className="mt-3 text-sm text-neutral-600 underline hover:text-neutral-900"
            >
              Повторить
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Активных сессий нет. Выйдите и войдите заново.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900">
                    {session.ip}
                    {session.current && (
                      <span className="ml-2 rounded bg-neutral-100 px-2 py-0.5 text-xs font-normal text-neutral-600">
                        Текущая
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">{shortUserAgent(session.userAgent)}</p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Вход: {formatSessionTime(session.createdAt)} · Активность:{' '}
                    {formatSessionTime(session.lastSeenAt)}
                  </p>
                </div>
                {!session.current && (
                  <button
                    type="button"
                    disabled={sessionsBusy}
                    onClick={() => revokeOne(session.id)}
                    className="shrink-0 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                  >
                    Завершить
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
