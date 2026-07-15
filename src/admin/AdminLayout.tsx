import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { getToken, setToken } from '../lib/api'
import { Logo } from '../components/Logo'
import { ConfirmDialogProvider } from './ConfirmDialog'
import { useSessionGuard } from './useSessionGuard'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 px-0.5 py-4 text-sm transition -mb-px ${
    isActive
      ? 'border-neutral-900 font-medium text-neutral-900'
      : 'border-transparent text-neutral-500 hover:text-neutral-900'
  }`

export function AdminLayout() {
  const navigate = useNavigate()
  useSessionGuard()

  if (!getToken()) {
    return <Navigate to="/admin/login" replace />
  }

  const logout = () => {
    setToken(null)
    navigate('/admin/login')
  }

  return (
    <ConfirmDialogProvider>
      <div className="min-h-screen bg-neutral-50">
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
            <Logo to="/admin" />

            <nav className="ml-8 flex h-full items-center gap-6">
              <NavLink to="/admin" end className={navLinkClass}>
                Товары
              </NavLink>
              <NavLink to="/admin/categories" className={navLinkClass}>
                Категории
              </NavLink>
              <NavLink to="/admin/password" className={navLinkClass}>
                Безопасность
              </NavLink>
            </nav>

            <div className="ml-auto flex items-center gap-5 text-sm">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-neutral-500 transition hover:text-neutral-900"
              >
                Сайт
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0" aria-hidden>
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
              <button
                type="button"
                onClick={logout}
                className="text-neutral-500 transition hover:text-neutral-900"
              >
                Выйти
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Outlet />
        </main>
      </div>
    </ConfirmDialogProvider>
  )
}
