import { Link } from 'react-router-dom'

export function LegalDocumentLayout({
  title,
  updatedAt,
  children,
}: {
  title: string
  updatedAt: string
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-stone-400">
        <Link to="/" className="transition-colors hover:text-stone-700">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-700">{title}</span>
      </nav>

      <h1 className="text-2xl font-medium text-stone-900 sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-stone-500">Дата публикации: {updatedAt}</p>

      <article className="mt-8 space-y-6 text-[15px] leading-relaxed text-stone-600">{children}</article>
    </div>
  )
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-base font-medium text-stone-900">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
