import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rawDir = path.resolve(__dirname, '../seed/raw')
const legacyRawDir = path.resolve(__dirname, '../../server/seed/raw')
const outFile = path.resolve(__dirname, '../src/mock/catalog-data.ts')

const CATEGORIES = [
  { slug: 'interior-paints', name: 'Интерьерные краски', description: 'Краски для стен и потолков внутри помещений', sortOrder: 1 },
  { slug: 'facade-paints', name: 'Фасадные краски', description: 'Атмосферостойкие краски для наружных работ', sortOrder: 2 },
  { slug: 'primers', name: 'Грунты', description: 'Грунтовки и праймеры для подготовки оснований', sortOrder: 3 },
  { slug: 'enamels', name: 'Эмали и лазури', description: 'Эмали, лаки и защитные лазури для дерева и металла', sortOrder: 4 },
  { slug: 'decorative', name: 'Декоративные покрытия', description: 'Декоративные краски и покрытия с эффектами', sortOrder: 5 },
  { slug: 'plasters', name: 'Штукатурки', description: 'Декоративные и фактурные штукатурки', sortOrder: 6 },
  { slug: 'wallpaper', name: 'Обои', description: 'Обои и материалы для стен', sortOrder: 7 },
]

const CYRILLIC_MAP = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function slugify(text) {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => CYRILLIC_MAP[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function uniqueSlug(base, used) {
  let slug = base || 'product'
  let n = 2
  while (used.has(slug)) {
    slug = `${base}-${n++}`
  }
  used.add(slug)
  return slug
}

const seedDir = fs.existsSync(rawDir) ? rawDir : legacyRawDir

if (!fs.existsSync(seedDir)) {
  if (fs.existsSync(outFile)) {
    console.warn(`Seed не найден (${rawDir}), используется существующий catalog-data.ts`)
    process.exit(0)
  }
  console.error(`Не найдена папка с seed-данными: ${rawDir}`)
  process.exit(1)
}

const files = fs.readdirSync(seedDir).filter((f) => f.endsWith('.json'))
if (files.length === 0) {
  console.error(`Нет JSON в ${seedDir}`)
  process.exit(1)
}

const categoryBySlug = Object.fromEntries(CATEGORIES.map((c, i) => [c.slug, { ...c, id: i + 1 }]))
const usedSlugs = new Set()
const products = []
const now = '2026-01-01T00:00:00.000Z'

for (const file of files) {
  const items = JSON.parse(fs.readFileSync(path.join(seedDir, file), 'utf8'))
  for (const item of items) {
    const category = categoryBySlug[item.category]
    if (!category) {
      console.warn(`Пропуск «${item.name}»: неизвестная категория ${item.category}`)
      continue
    }

    const baseSlug = slugify(item.name)
    products.push({
      id: products.length + 1,
      slug: uniqueSlug(baseSlug, usedSlugs),
      brand: item.brand || '',
      name: item.name,
      tagline: item.tagline || '',
      description: item.description || '',
      features: item.features || [],
      specs: item.specs || {},
      sizes: item.sizes || '',
      price: null,
      image: null,
      isActive: true,
      category: {
        id: category.id,
        slug: category.slug,
        name: category.name,
      },
      createdAt: now,
      updatedAt: now,
    })
  }
}

const categories = CATEGORIES.map((c) => ({
  id: categoryBySlug[c.slug].id,
  slug: c.slug,
  name: c.name,
  description: c.description,
  sortOrder: c.sortOrder,
  productCount: products.filter((p) => p.category.slug === c.slug).length,
})).filter((c) => c.productCount > 0)

const payload = { categories, products }

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(
  outFile,
  `/* eslint-disable */\n/** Автогенерация: npm run build-mock-data */\n\nimport type { Category, Product } from '../lib/types'\n\nexport const MOCK_CATEGORIES: Category[] = ${JSON.stringify(categories, null, 2)}\n\nexport const MOCK_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)}\n`,
  'utf8',
)

console.log(`Mock-каталог: ${products.length} товаров, ${categories.length} категорий → ${path.relative(process.cwd(), outFile)}`)
