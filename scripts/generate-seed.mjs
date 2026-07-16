import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const TECH_LIST = path.join(ROOT, 'tech_list')
const OUT = path.join(ROOT, 'src/lib/seed-data.ts')

const CATEGORIES = [
  {
    id: 1,
    slug: 'dekorativnye-pokrytiya',
    name: 'Декоративные покрытия',
    description: 'Декоративные штукатурки, лазури и фактурные покрытия',
    sortOrder: 1,
  },
  {
    id: 2,
    slug: 'interernye-kraski',
    name: 'Интерьерные краски',
    description: 'Краски для стен и потолков внутри помещений',
    sortOrder: 2,
  },
  {
    id: 3,
    slug: 'fasadnye-kraski',
    name: 'Фасадные краски',
    description: 'Краски для наружных работ и фасадов',
    sortOrder: 3,
  },
  {
    id: 4,
    slug: 'grunty',
    name: 'Грунты',
    description: 'Грунтовки и подготовительные составы',
    sortOrder: 4,
  },
  {
    id: 5,
    slug: 'emali',
    name: 'Эмали и спецсоставы',
    description: 'Эмали, лаки и специализированные составы',
    sortOrder: 5,
  },
]

const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]))

function slugify(value) {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
    й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
    у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
    э: 'e', ю: 'yu', я: 'ya',
  }
  return value
    .toLowerCase()
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

function parseFabioName(filename) {
  return filename
    .replace(/^tm_fabio[-_]?/i, '')
    .replace(/\.pdf$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

function parseAuraName(filename) {
  return filename
    .replace(/\.pdf$/i, '')
    .replace(/^WEB_Pas(s)?port_?\s*/i, '')
    .replace(/^AURA_?/i, '')
    .replace(/_/g, ' ')
    .replace(/\s+\(\d+\)$/, '')
    .replace(/\s+\d{6}$/, '')
    .trim()
}

function parseProfiTecName(filename) {
  return filename.replace(/\.pdf$/i, '').trim()
}

function categoryForFabio(filename) {
  const n = filename.toLowerCase()
  if (/emal/.test(n)) return 'emali'
  if (/grund|tiefgrund|primer|grunt-kvarc|klebervlies/.test(n)) return 'grunty'
  if (/fassade|fassaden|objekt-fassaden|hybrid-fassaden/.test(n)) return 'fasadnye-kraski'
  if (/art-beton|decor|travertino|shtukaturka|terreno|carbon|seta|fakturnaya|siliconputz/.test(n)) {
    return 'dekorativnye-pokrytiya'
  }
  return 'interernye-kraski'
}

function categoryForProfiTec(subfolder) {
  if (subfolder === 'Грунты') return 'grunty'
  if (subfolder === 'Фасадные Краски') return 'fasadnye-kraski'
  return 'interernye-kraski'
}

function collectAuraImages() {
  const auraRoot = path.join(TECH_LIST, 'AURA DEKOR')
  const map = new Map()
  if (!fs.existsSync(auraRoot)) return map

  for (const entry of fs.readdirSync(auraRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const dirPath = path.join(auraRoot, entry.name)
    const png = fs.readdirSync(dirPath).find((f) => /\.(png|jpe?g|webp)$/i.test(f))
    if (!png) continue
    const key = entry.name.replace(/^AURA DEKOR\s+/i, '').toLowerCase()
    map.set(key, `/tech_list/AURA DEKOR/${entry.name}/${png}`)
  }
  return map
}

function findAuraImage(name, imageMap) {
  const normalized = name.toLowerCase()
  for (const [key, url] of imageMap) {
    if (normalized.includes(key) || key.includes(normalized.split(' ')[0])) {
      return url
    }
  }
  if (normalized.includes('beton')) return imageMap.get('art beton') ?? null
  if (normalized.includes('barkhan')) return imageMap.get('barkhan') ?? null
  return null
}

function walkPdfs(dir, brand, subfolder = '') {
  const items = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      items.push(...walkPdfs(fullPath, brand, entry.name))
      continue
    }
    if (!entry.name.toLowerCase().endsWith('.pdf')) continue
    items.push({ brand, subfolder, filename: entry.name, fullPath })
  }
  return items
}

function toPublicPath(fullPath) {
  const rel = path.relative(TECH_LIST, fullPath).split(path.sep).join('/')
  return `/tech_list/${rel}`
}

function buildProducts() {
  const auraImages = collectAuraImages()
  const raw = []

  for (const brand of fs.readdirSync(TECH_LIST, { withFileTypes: true })) {
    if (!brand.isDirectory() || brand.name.startsWith('.')) continue
    const brandPath = path.join(TECH_LIST, brand.name)
    raw.push(...walkPdfs(brandPath, brand.name))
  }

  const now = new Date(0).toISOString()
  const usedSlugs = new Set()

  return raw.map((item, index) => {
    let categorySlug
    let name
    let image = null

    if (item.brand === 'FaBio') {
      categorySlug = categoryForFabio(item.filename)
      name = parseFabioName(item.filename)
    } else if (item.brand === 'AURA DEKOR') {
      categorySlug = 'dekorativnye-pokrytiya'
      name = parseAuraName(item.filename)
      image = findAuraImage(name, auraImages)
    } else if (item.brand === 'ProfiTec') {
      categorySlug = categoryForProfiTec(item.subfolder)
      name = parseProfiTecName(item.filename)
    } else {
      categorySlug = 'interernye-kraski'
      name = parseProfiTecName(item.filename)
    }

    const category = CATEGORY_BY_SLUG[categorySlug]
    let slug = slugify(`${item.brand}-${name}`)
    if (usedSlugs.has(slug)) slug = slugify(`${item.brand}-${category.slug}-${name}`)
    if (usedSlugs.has(slug)) slug = `${slug}-${index + 1}`
    usedSlugs.add(slug)

    const passport = toPublicPath(item.fullPath)

    return {
      id: index + 1,
      slug,
      brand: item.brand,
      name,
      tagline: `${item.brand} · ${category.name}`,
      description: `${name} — профессиональный материал бренда ${item.brand}. Подробные характеристики и условия применения указаны в техническом паспорте.`,
      features: ['Профессиональное качество', 'Подробный технический паспорт'],
      specs: {
        Бренд: item.brand,
        Категория: category.name,
        'Технический паспорт': passport,
      },
      sizes: '',
      price: null,
      image,
      isActive: true,
      category: {
        id: category.id,
        slug: category.slug,
        name: category.name,
      },
      createdAt: now,
      updatedAt: now,
    }
  })
}

const products = buildProducts()
const categoryCounts = Object.fromEntries(CATEGORIES.map((c) => [c.slug, 0]))
for (const product of products) {
  categoryCounts[product.category.slug] = (categoryCounts[product.category.slug] ?? 0) + 1
}

const categoriesWithCounts = CATEGORIES.map((c) => ({
  ...c,
  productCount: categoryCounts[c.slug] ?? 0,
}))

const file = `/* eslint-disable */
// Generated by scripts/generate-seed.mjs — do not edit manually

import type { Category, Product } from './types'

export const SEED_CATEGORIES: Category[] = ${JSON.stringify(categoriesWithCounts, null, 2)}

export const SEED_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)}
`

fs.writeFileSync(OUT, file)
console.log(`Generated ${products.length} products in ${OUT}`)
