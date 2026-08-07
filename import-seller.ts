import { createClient } from 'next-sanity'
import { readdir, stat, readFile } from 'fs/promises'
import { readFileSync } from 'fs'
import { join, basename, dirname } from 'path'

// Simple .env.local loader (sync)
function loadEnvFile(path: string): Record<string, string> {
  const result: Record<string, string> = {}
  let content: string
  try {
    content = readFileSync(path, 'utf-8')
  } catch {
    return result
  }
  content.split('\n').forEach((line) => {
    line = line.trim()
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=').replace(/^["']|["']$/g, '')
      if (key && value !== undefined) {
        result[key.trim()] = value
      }
    }
  })
  return result
}

const env = loadEnvFile(join(__dirname, '.env.local'))
for (const [k, v] of Object.entries(env)) {
  if (!process.env[k]) process.env[k] = v
}

// --- Config ---
const SELLER_ROOT = join(__dirname, 'seller')
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !token) {
  console.error('Missing env vars. Use: NEXT_PUBLIC_SANITY_PROJECT_ID=x SANITY_API_WRITE_TOKEN=y npx tsx import-seller.ts')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token,
})

// --- Types ---
interface SellerFolder {
  outerName: string
  innerName: string
  rt: string
  rw: string
  banners: string[]     // paths relative to inner folder (e.g. "Stiker/dawet ayu.jpg")
  posters: string[]
  stickers: string[]
  standaloneFiles: string[]
}

// --- Helpers ---
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

function parseOuterFolderName(outerName: string): { innerName: string; rt: string; rw: string } {
  // Pattern: "RT 01 RW 01-20260805T093908Z-1-001"
  const match = outerName.match(/^(RT\s+\d+\s+RW\s+\d+)-/)
  if (!match) return { innerName: outerName, rt: '', rw: '' }
  const rtRw = match[1].trim()
  const rtMatch = rtRw.match(/RT\s+(\d+)/i)
  const rwMatch = rtRw.match(/RW\s+(\d+)/i)
  return {
    innerName: rtRw,
    rt: rtMatch?.[1] || '',
    rw: rwMatch?.[1] || '',
  }
}

function normalizeFolderName(name: string): string {
  return name.toLowerCase().replace(/_+$/, '').trim()
}

function isBannerFolder(name: string): boolean {
  const n = normalizeFolderName(name)
  return n === 'banner' || n === 'banner_'
}

function isPosterFolder(name: string): boolean {
  const n = normalizeFolderName(name)
  return n === 'poster' || n === 'poster_'
}

function isStickerFolder(name: string): boolean {
  const n = normalizeFolderName(name)
  return n === 'stiker' || n === 'stiker_' || n === 'stiker'
}

// --- Scan ---
async function scanSellerFolder(): Promise<SellerFolder[]> {
  const entries = await readdir(SELLER_ROOT, { withFileTypes: true })
  const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name)

  const sellers: SellerFolder[] = []

  for (const outerName of folders) {
    const outerPath = join(SELLER_ROOT, outerName)
    const innerNames = (await readdir(outerPath, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name)

    for (const innerName of innerNames) {
      const parsed = parseOuterFolderName(outerName)
      const innerPath = join(outerPath, innerName)
      const contents = await readdir(innerPath, { withFileTypes: true })

      const banners: string[] = []
      const posters: string[] = []
      const stickers: string[] = []
      const standaloneFiles: string[] = []

      for (const item of contents) {
        const itemPath = join(innerPath, item.name)
        const itemStat = await stat(itemPath)

        if (itemStat.isDirectory()) {
          if (isBannerFolder(item.name)) {
            const files = await readdir(itemPath)
            // Store path relative to inner folder: "Banner/file.jpg"
            banners.push(...files.map((f) => join(item.name, f)))
          } else if (isPosterFolder(item.name)) {
            const files = await readdir(itemPath)
            posters.push(...files.map((f) => join(item.name, f)))
          } else if (isStickerFolder(item.name)) {
            const files = await readdir(itemPath)
            stickers.push(...files.map((f) => join(item.name, f)))
          } else {
            // Unknown folder - skip
          }
        } else {
          // File directly in inner folder
          standaloneFiles.push(item.name)
        }
      }

      // Only add if there's content
      if (banners.length + posters.length + stickers.length > 0) {
        sellers.push({
          outerName,
          innerName: parsed.innerName,
          rt: parsed.rt,
          rw: parsed.rw,
          banners,
          posters,
          stickers,
          standaloneFiles,
        })
      }
    }
  }

  return sellers
}

// --- Upload ---
async function uploadImageFromFile(localPath: string, mimeType: string = 'image/png'): Promise<string | null> {
  try {
    const buffer = await readFile(localPath)
    const fileName = basename(localPath)
    const asset = await client.assets.upload('image', buffer, { filename: fileName })
    console.log(`  Uploaded: ${fileName} -> ${asset._id}`)
    return asset._id
  } catch (err) {
    console.error(`  Upload failed: ${localPath}`, err)
    return null
  }
}

async function uploadImageFromPath(outerName: string, innerName: string, relativePath: string): Promise<string | null> {
  const fullPath = join(SELLER_ROOT, outerName, innerName, relativePath)
  return uploadImageFromFile(fullPath)
}

// --- Extract product names from sticker filenames ---
function extractProductNames(stickers: string[]): string[] {
  const names: string[] = []
  for (const sticker of stickers) {
    // sticker is like "Stiker/dawet ayu.jpg" or "STIKER/1. Bolu Mekar.png"
    const fileName = basename(sticker)
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
    // Remove numbering prefix like "1. ", "2. "
    const cleanName = nameWithoutExt.replace(/^\d+\.\s*/, '')
    // Remove common prefixes
    const cleaned = cleanName
      .replace(/^stiker\s*/i, '')
      .replace(/^banner\s*/i, '')
      .replace(/^poster\s*/i, '')
      .replace(/\s*fix(?:xxx)?\s*$/i, '')
      .trim()
    if (cleaned && !cleaned.startsWith('IMG_') && !cleaned.match(/^[0-9a-f]{8}-/)) {
      names.push(cleaned)
    }
  }
  return [...new Set(names)] // deduplicate
}

// --- Import ---
async function importSellers() {
  console.log('Scanning seller folder...')
  const sellers = await scanSellerFolder()
  console.log(`Found ${sellers.length} seller groups\n`)

  let created = 0
  let skipped = 0
  const errors: string[] = []

  for (const seller of sellers) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Processing: ${seller.innerName} (RT ${seller.rt} RW ${seller.rw})`)
    console.log(`  Banners: ${seller.banners.length}, Posters: ${seller.posters.length}, Stickers: ${seller.stickers.length}`)

    try {
      // 1. Upload banner (first one as main)
      let bannerAssetId: string | null = null
      if (seller.banners.length > 0) {
        console.log('  Uploading banner...')
        bannerAssetId = await uploadImageFromPath(
          seller.outerName,
          seller.innerName,
          seller.banners[0]
        )
      }

      // 2. Upload logo from first sticker (or first standalone)
      let logoAssetId: string | null = null
      let logoFileName = 'logo.jpg'
      if (seller.stickers.length > 0) {
        logoFileName = basename(seller.stickers[0])
        logoAssetId = await uploadImageFromPath(
          seller.outerName,
          seller.innerName,
          seller.stickers[0]
        )
      } else if (seller.standaloneFiles.length > 0) {
        logoAssetId = await uploadImageFromPath(seller.outerName, seller.innerName, seller.standaloneFiles[0])
      }

      // 3. Upload posters
      const posterRefs: Array<{ _key: string; _type: 'image'; asset: { _type: 'reference'; _ref: string } }> = []
      for (const poster of seller.posters) {
        const assetId = await uploadImageFromPath(seller.outerName, seller.innerName, poster)
        if (assetId) {
          posterRefs.push({
            _key: `poster-${slugify(poster)}`,
            _type: 'image',
            asset: { _type: 'reference', _ref: assetId },
          })
        }
      }

      // 4. Extract product names from stickers
      const products = extractProductNames(seller.stickers)
      if (products.length > 0) {
        console.log(`  Products detected: ${products.length}`)
      }

      // 5. Create seller document
      const sellerSlug = slugify(seller.innerName)
      const sellerId = `seller-${sellerSlug}`
      const now = new Date().toISOString()

      const sellerDoc: any = {
        _id: sellerId,
        _type: 'seller',
        name: `Toko ${seller.innerName.replace(/\s+/g, ' ').trim()}`,
        slug: { _type: 'slug', current: sellerSlug },
        rt: seller.rt,
        rw: seller.rw,
        localImagePath: seller.innerName,
        importedAt: now,
        isActive: true,
        products,
      }

      if (logoAssetId) {
        sellerDoc.logo = {
          _type: 'image',
          asset: { _type: 'reference', _ref: logoAssetId },
        }
      }

      if (bannerAssetId) {
        sellerDoc.banner = {
          _type: 'image',
          asset: { _type: 'reference', _ref: bannerAssetId },
        }
      }

      if (posterRefs.length > 0) {
        sellerDoc.posters = posterRefs
      }

      await client.createOrReplace(sellerDoc)
      console.log(`  [OK] Seller created: ${sellerDoc.name}`)
      created++
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error(`  [ERROR] ${errorMsg}`)
      errors.push(`${seller.innerName}: ${errorMsg}`)
      skipped++
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`Import complete!`)
  console.log(`  Created/Updated: ${created}`)
  console.log(`  Errors: ${skipped}`)
  if (errors.length > 0) {
    console.log('\nErrors:')
    errors.forEach((e) => console.log(`  - ${e}`))
  }
}

importSellers().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})
