import { PHONES } from '../../lib/contacts'

const LAT = 54.7175631
const LON = 55.9766871
const ZOOM = 16

const ADDRESS_LINES = [
  'Айская улица, 39, 1 этаж',
  'Зелёная роща м-н, Кировский район',
  'Уфа, 450047',
] as const

const YANDEX_MAPS_URL = `https://yandex.ru/maps/?pt=${LON},${LAT}&z=${ZOOM}&l=map`
const MAP_EMBED_URL = `https://yandex.ru/map-widget/v1/?ll=${LON}%2C${LAT}&z=${ZOOM}&pt=${LON}%2C${LAT}&l=map`

export function HomeLocation() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 sm:mb-10">
        <p className="text-xs font-semibold tracking-[0.15em] text-stone-400 uppercase">Контакты</p>
        <h2 className="mt-2 font-jost text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          Как нас найти
        </h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_20px_48px_-32px_rgba(28,25,23,0.18)] lg:grid lg:grid-cols-[minmax(0,17rem)_1fr]">
        <div className="flex flex-col justify-between gap-6 border-b border-stone-100 p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <div>
            <p className="font-jost text-xs tracking-[0.28em] text-stone-400 uppercase">Адрес</p>
            <address className="mt-3 not-italic text-sm leading-relaxed text-stone-700 sm:text-[15px]">
              {ADDRESS_LINES.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>

          <div className="space-y-3 text-sm">
            {PHONES.map((phone) => (
              <a
                key={phone.href}
                href={phone.href}
                className="block font-medium text-stone-900 transition-colors hover:text-stone-600"
              >
                {phone.display}
              </a>
            ))}
            <a
              href={YANDEX_MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-stone-900 underline-offset-4 hover:underline"
            >
              Открыть в Яндекс.Картах
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>

        <div className="relative min-h-[14rem] bg-stone-100 sm:min-h-[16rem] lg:min-h-[18rem]">
          <iframe
            title="Офис Хроматика на карте — Айская улица, 39, Уфа"
            src={MAP_EMBED_URL}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  )
}
