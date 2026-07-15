import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
      <p className="text-6xl font-extrabold text-neutral-300">404</p>
      <h1 className="mt-4 text-2xl font-bold">Страница не найдена</h1>
      <p className="mt-2 text-neutral-500">Возможно, товар был удалён или ссылка устарела.</p>
      <Link
        to="/catalog"
        className="mt-8 inline-block rounded-lg bg-neutral-900 px-6 py-3 font-semibold text-white transition hover:bg-neutral-700"
      >
        Вернуться в каталог
      </Link>
    </div>
  )
}
