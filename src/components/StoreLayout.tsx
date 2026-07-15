import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { Category } from '../lib/types'
import { COMPANY_NAME, COPYRIGHT_YEAR, INSTAGRAM, PHONES, TAGLINE } from '../lib/contacts'
import { Logo } from './Logo'
import { PageTransition } from './PageTransition'
import { SplashScreen } from './SplashScreen'

const desktopNavClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
    isActive
      ? 'bg-stone-900 text-white'
      : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
  }`

export function StoreLayout() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuClosing, setMenuClosing] = useState(false)
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    api.getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    if (!menuClosing) return
    const timer = window.setTimeout(() => {
      setMenuOpen(false)
      setMenuClosing(false)
    }, 220)
    return () => window.clearTimeout(timer)
  }, [menuClosing])

  useEffect(() => {
    if (!menuOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/catalog?search=${encodeURIComponent(q)}` : '/catalog')
  }

  const openMenu = () => {
    setMenuClosing(false)
    setMenuOpen(true)
  }

  const requestCloseMenu = () => setMenuClosing(true)

  const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center rounded-xl px-4 py-3 text-sm transition-colors ${
      isActive ? 'bg-stone-900 font-medium text-white' : 'text-stone-700 hover:bg-stone-50'
    }`

  return (
    <>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <div className="grid min-h-screen grid-rows-[auto_1fr_auto] overflow-x-hidden">
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/95 backdrop-blur-md">
        <div className="lg:hidden">
          <div className="flex h-14 items-center gap-3 px-4">
            <button
              type="button"
              onClick={openMenu}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-stone-700 transition-colors hover:bg-stone-100"
              aria-label="Открыть меню"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden>
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <div className="flex flex-1 justify-center">
              <Logo compact />
            </div>
            <div className="w-10 shrink-0" aria-hidden />
          </div>
          <div className="border-t border-stone-100 px-4 pb-3 pt-2">
            <form onSubmit={submitSearch}>
              <label className="sr-only" htmlFor="header-search-mobile">
                Поиск
              </label>
              <input
                id="header-search-mobile"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по каталогу…"
                className="w-full min-w-0 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-stone-400 focus:bg-white"
              />
            </form>
          </div>
        </div>

        <div className="mx-auto hidden h-16 max-w-6xl items-center gap-6 px-6 lg:flex">
          <Logo />
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={desktopNavClass}>
              Главная
            </NavLink>
            <NavLink to="/catalog" className={desktopNavClass}>
              Каталог
            </NavLink>
          </nav>
          <form onSubmit={submitSearch} className="ml-auto w-full max-w-xs">
            <label className="sr-only" htmlFor="header-search">
              Поиск
            </label>
            <input
              id="header-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по каталогу…"
              className="w-full rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm outline-none transition-colors duration-200 focus:border-stone-400 focus:bg-white"
            />
          </form>
        </div>
      </header>

      {menuOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Меню">
            <button
              type="button"
              className={`absolute inset-0 bg-stone-900/50 ${menuClosing ? 'drawer-backdrop-out' : 'drawer-backdrop-in'}`}
              aria-label="Закрыть меню"
              onClick={requestCloseMenu}
            />
            <div
              className={`absolute inset-y-0 left-0 z-10 flex h-full w-[min(88vw,20rem)] flex-col bg-white shadow-xl ${
                menuClosing ? 'drawer-panel-out' : 'drawer-panel-in'
              }`}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-stone-100 px-4 py-4">
                <Logo compact />
                <button
                  type="button"
                  onClick={requestCloseMenu}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-stone-700 transition-colors hover:bg-stone-100"
                  aria-label="Закрыть меню"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden>
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
                <ul className="space-y-1">
                  <li>
                    <NavLink to="/" end className={mobileNavClass} onClick={requestCloseMenu}>
                      Главная
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/catalog" className={mobileNavClass} onClick={requestCloseMenu}>
                      Каталог
                    </NavLink>
                  </li>
                </ul>
                {categories.length > 0 && (
                  <>
                    <p className="mb-2 mt-5 px-1 text-xs text-stone-400">Категории</p>
                    <ul className="space-y-1">
                      {categories.map((cat) => (
                        <li key={cat.id}>
                          <NavLink
                            to={`/catalog/${cat.slug}`}
                            className={mobileNavClass}
                            onClick={requestCloseMenu}
                          >
                            {cat.name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <div className="mt-6 border-t border-stone-100 px-1 pt-5">
                  <p className="mb-3 text-xs text-stone-400">Контакты</p>
                  <ul className="space-y-2 text-sm">
                    {PHONES.map((phone) => (
                      <li key={phone.href}>
                        <a
                          href={phone.href}
                          className="font-medium text-stone-900 underline-offset-4 hover:underline"
                          onClick={requestCloseMenu}
                        >
                          {phone.display}
                        </a>
                      </li>
                    ))}
                    <li>
                      <a
                        href={INSTAGRAM.href}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-stone-900 underline-offset-4 hover:underline"
                        onClick={requestCloseMenu}
                      >
                        {INSTAGRAM.label}
                      </a>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>,
          document.body,
        )}

      <main className="flex w-full min-w-0 flex-col overflow-x-hidden">
        <PageTransition />
      </main>

      <footer className="rounded-t-3xl bg-stone-900 text-stone-400">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,16rem)_1fr_minmax(0,12rem)] lg:gap-16">
            <div>
              <Logo light />
              <p className="mt-3 text-sm leading-relaxed text-stone-400">
                {COMPANY_NAME} — {TAGLINE}.
              </p>
            </div>

            <div className="min-h-[5.5rem]">
              <p className="mb-3 text-sm font-medium text-stone-300">Каталог</p>
              <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0">
                <li>
                  <NavLink
                    to="/catalog"
                    className="text-sm text-stone-400 transition-colors hover:text-white"
                  >
                    Все товары
                  </NavLink>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <NavLink
                      to={`/catalog/${cat.slug}`}
                      className="text-sm text-stone-400 transition-colors hover:text-white"
                    >
                      {cat.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-stone-300">Контакты</p>
              <ul className="space-y-2 text-sm text-stone-400">
                {PHONES.map((phone) => (
                  <li key={phone.href}>
                    <a href={phone.href} className="transition-colors hover:text-white">
                      {phone.display}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href={INSTAGRAM.href}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-white"
                  >
                    {INSTAGRAM.label}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-xs text-stone-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>© {COPYRIGHT_YEAR} {COMPANY_NAME}</span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <NavLink to="/privacy" className="transition-colors hover:text-stone-400">
                Политика конфиденциальности
              </NavLink>
              <NavLink to="/offer" className="transition-colors hover:text-stone-400">
                Публичная оферта
              </NavLink>
            </div>
            <NavLink to="/admin/login" className="transition-colors hover:text-stone-400">
              Вход
            </NavLink>
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}
