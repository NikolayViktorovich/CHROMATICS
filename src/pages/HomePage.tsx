import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { Category, Product } from '../lib/types'
import { HomeHero } from '../components/home/HomeHero'
import { CategoryBento } from '../components/home/CategoryBento'
import { FeaturedProducts } from '../components/home/FeaturedProducts'
import { HomeLocation } from '../components/home/HomeLocation'
import { PHONES, TAGLINE } from '../lib/contacts'

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getCategories(), api.getProducts({ perPage: 8 })])
      .then(([cats, products]) => {
        setCategories(cats)
        setFeatured(products.items)
      })
      .finally(() => setLoading(false))
  }, [])

  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount ?? 0), 0)

  return (
    <>
      <HomeHero totalProducts={totalProducts} loading={loading} />

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <SectionHeader title="Разделы каталога" label="Категории" href="/catalog" linkText="Все" />
        <div className={loading ? 'content-dimmed' : ''}>
          <CategoryBento categories={categories} loading={loading} />
        </div>
      </section>

      <section className="home-featured-band border-y border-stone-200/80 bg-stone-50/80 py-12 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <SectionHeader title="Популярные позиции" label="Подборка" href="/catalog" linkText="Смотреть все" />
          <div className={loading ? 'content-dimmed' : ''}>
            <FeaturedProducts products={featured} loading={loading} />
          </div>
        </div>
      </section>

      <HomeLocation />

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="home-about relative overflow-hidden rounded-[1.75rem] bg-stone-900 px-6 py-10 text-white sm:px-10 sm:py-14 lg:flex lg:items-end lg:justify-between lg:gap-16">
          <div className="home-about-glow absolute -top-24 -right-16 h-64 w-64 rounded-full bg-stone-600/30 blur-3xl" aria-hidden />
          <div className="relative max-w-xl">
            <p className="font-jost text-xs tracking-[0.3em] text-stone-500 uppercase">О компании</p>
            <h2 className="mt-3 font-jost text-2xl font-semibold tracking-wide uppercase sm:text-3xl">
              Хроматика
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-stone-400 sm:text-base">
              {TAGLINE}. У каждой позиции указаны расход, состав и условия нанесения.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/catalog"
                className="rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                Весь каталог
              </Link>
              {PHONES.map((phone) => (
                <a
                  key={phone.href}
                  href={phone.href}
                  className="rounded-full px-5 py-2.5 text-sm text-stone-400 transition-colors hover:text-white"
                >
                  {phone.display}
                </a>
              ))}
            </div>
          </div>

          <dl className="relative mt-10 grid grid-cols-2 gap-8 sm:gap-12 lg:mt-0">
            <div>
              <dt className="text-sm text-stone-500">Позиций</dt>
              <dd className="mt-2 font-jost text-4xl font-semibold tabular-nums sm:text-5xl">
                {loading ? '…' : totalProducts}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-stone-500">Категорий</dt>
              <dd className="mt-2 font-jost text-4xl font-semibold tabular-nums sm:text-5xl">
                {loading ? '…' : categories.length}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  )
}

function SectionHeader({
  label,
  title,
  href,
  linkText,
}: {
  label: string
  title: string
  href: string
  linkText: string
}) {
  return (
    <div className="mb-8 sm:mb-10">
      <p className="text-xs font-semibold tracking-[0.15em] text-stone-400 uppercase">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <h2 className="font-jost text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          {title}
        </h2>
        <Link
          to={href}
          className="shrink-0 rounded-full border border-stone-200 px-3 py-1.5 text-sm text-stone-600 transition-colors hover:border-stone-300 hover:bg-white hover:text-stone-900 sm:px-4"
        >
          {linkText}
        </Link>
      </div>
    </div>
  )
}
