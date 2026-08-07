import { createClient } from 'next-sanity'
import { readdir, stat, readFile } from 'fs/promises'
import { join, basename } from 'path'

const SELLER_ROOT = 'i:\\pawonsjg\\seller'

// Load env
const envLines = require('fs').readFileSync('i:\\pawonsjg\\.env.local', 'utf-8').split('\n')
for (const line of envLines) {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const [k, ...v] = trimmed.split('=')
    const key = k.trim()
    const value = v.join('=').replace(/^["']|["']$/g, '')
    if (key && !process.env[key]) process.env[key] = value
  }
}

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
})

function slugify(text: string): string {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

async function uploadImage(localPath: string): Promise<string | null> {
  try {
    const buffer = await readFile(localPath)
    const fileName = basename(localPath)
    const asset = await sanityClient.assets.upload('image', buffer, { filename: fileName })
    console.log(`    Uploaded: ${fileName} -> ${asset._id.substring(0, 30)}...`)
    return asset._id
  } catch (err) {
    console.error(`    Upload failed: ${localPath}`)
    return null
  }
}

async function scanStickers(outerName: string, innerName: string): Promise<string[]> {
  const outerPath = join(SELLER_ROOT, outerName)
  const innerPath = join(outerPath, innerName)
  const entries = await readdir(innerPath, { withFileTypes: true })
  
  for (const entry of entries) {
    const name = entry.name.toLowerCase().replace(/_+$/, '')
    if (name === 'stiker') {
      const stickerPath = join(innerPath, entry.name)
      const files = await readdir(stickerPath)
      return files.map((f) => join(innerName, entry.name, f))
    }
  }
  return []
}

async function main() {
  // Scan all seller folders
  const sellerDirs = await readdir(SELLER_ROOT)
  const stickerMap: Record<string, { outerName: string; innerName: string; stickers: string[] }> = {}

  console.log('Scanning sticker folders...\n')

  for (const outerName of sellerDirs) {
    const outerPath = join(SELLER_ROOT, outerName)
    const s = await stat(outerPath)
    if (!s.isDirectory()) continue

    const innerDirs = await readdir(outerPath, { withFileTypes: true })
    for (const innerDir of innerDirs) {
      if (!innerDir.isDirectory()) continue
      const stickers = await scanStickers(outerName, innerDir.name)
      if (stickers.length > 0) {
        stickerMap[innerDir.name] = { outerName, innerName: innerDir.name, stickers }
      }
    }
  }

  console.log(`Found stickers in ${Object.keys(stickerMap).length} sellers\n`)

  // Get sellers with products
  const sellers = await sanityClient.fetch(
    `*[_type == "seller" && count(products) > 0] { _id, name, slug, products }`
  )

  let updated = 0

  for (const seller of sellers) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Processing: ${seller.name}`)

    const sellerSlug = seller.slug?.current || slugify(seller.name)
    
    // Find matching sticker folder by comparing RT/RW
    let stickerInfo: { outerName: string; innerName: string; stickers: string[] } | undefined
    const sellerRtRw = sellerSlug.match(/rt-(\d+)-rw-(\d+)/)
    if (sellerRtRw) {
      const [, rt, rw] = sellerRtRw
      for (const [folderName, info] of Object.entries(stickerMap)) {
        const folderRtRw = folderName.match(/rt\s+(\d+)\s+rw\s+(\d+)/i)
        if (folderRtRw && folderRtRw[1] === rt && folderRtRw[2] === rw) {
          stickerInfo = info
          break
        }
      }
    } else {
      stickerInfo = stickerMap[sellerSlug] || stickerMap[seller.name]
    }

    if (!stickerInfo) {
      console.log(`  No sticker folder found for ${sellerSlug}\n`)
      continue
    }

    // Upload all stickers and map by name
    const stickerAssets: Record<string, string> = {}

    for (const stickerPath of stickerInfo.stickers) {
      const fullPath = join(SELLER_ROOT, stickerInfo.outerName, stickerPath)
      const assetId = await uploadImage(fullPath)
      if (assetId) {
        const fileName = basename(stickerPath).replace(/\.[^/.]+$/, '')
        const cleanName = fileName.replace(/^\d+\.\s*/, '').replace(/^stiker\s*/i, '').trim().toLowerCase()
        stickerAssets[cleanName] = assetId
      }
    }

    console.log(`\n  Product sticker mapping:`)

    // Match products to stickers
    for (const productName of seller.products || []) {
      const cleanProduct = productName.replace(/^\d+\.\s*/, '').trim().toLowerCase()
      
      // Find matching sticker
      let assetId: string | undefined
      for (const [stickerName, stickerAsset] of Object.entries(stickerAssets)) {
        if (cleanProduct === stickerName || cleanProduct.includes(stickerName) || stickerName.includes(cleanProduct)) {
          assetId = stickerAsset
          break
        }
      }

      if (!assetId) {
        console.log(`  - NO MATCH: "${productName}" (clean: "${cleanProduct}")`)
        continue
      }

      try {
        await sanityClient
          .patch(`product-${sellerSlug}-${slugify(productName)}`)
          .set({
            image: {
              _type: 'image',
              asset: { _type: 'reference', _ref: assetId },
            },
          })
        console.log(`  [OK] ${productName} -> ${stickerAssets[cleanProduct] ? 'matched' : '?'}`)
        updated++
      } catch (err) {
        console.error(`  [ERR] ${productName}: ${err}`)
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`Done! Updated: ${updated}`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
