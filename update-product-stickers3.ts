import { createClient } from 'next-sanity'
import { readFileSync } from 'fs'
import { readdir, stat } from 'fs/promises'
import { join, basename } from 'path'

const envLines = readFileSync('i:\\pawonsjg\\.env.local', 'utf-8').split('\n')
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
    const buffer = await require('fs').readFileSync(localPath)
    const fileName = basename(localPath)
    const asset = await sanityClient.assets.upload('image', buffer, { filename: fileName })
    return asset._id
  } catch (err) {
    return null
  }
}

async function scanStickers(outerName: string, innerName: string): Promise<string[]> {
  const join = require('path').join
  const readdir = require('fs/promises').readdir
  const SELLER_ROOT = 'i:\\pawonsjg\\seller'
  const outerPath = join(SELLER_ROOT, outerName)
  const innerPath = join(outerPath, innerName)
  const entries = await readdir(innerPath, { withFileTypes: true })
  for (const entry of entries) {
    const name = entry.name.toLowerCase().replace(/_+$/, '')
    if (name === 'stiker') {
      const stickerPath = join(innerPath, entry.name)
      const files = await readdir(stickerPath)
      return files.map((f: string) => join(innerName, entry.name, f))
    }
  }
  return []
}

// Clean sticker filename to product name
function cleanName(fileName: string): string {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/^stiker\s*/i, '')
    .trim()
}

async function main() {
  const join = require('path').join
  const readdir = require('fs/promises').readdir
  const stat = require('fs/promises').stat
  const SELLER_ROOT = 'i:\\pawonsjg\\seller'

  // Scan stickers
  const sellerDirs = await readdir(SELLER_ROOT)
  const stickerMap: Record<string, { outerName: string; innerName: string; stickers: string[] }> = {}

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

  const sellers = await sanityClient.fetch(
    `*[_type == "seller" && count(products) > 0] { _id, name, slug, products }`
  )

  let updated = 0

  for (const seller of sellers) {
    const sellerSlug = seller.slug?.current

    let stickerInfo
    const sellerRtRw = sellerSlug?.match(/rt-(\d+)-rw-(\d+)/)
    if (sellerRtRw) {
      const [, rt, rw] = sellerRtRw
      for (const [folderName, info] of Object.entries(stickerMap)) {
        const folderRtRw = folderName.match(/rt\s+(\d+)\s+rw\s+(\d+)/i)
        if (folderRtRw && folderRtRw[1] === rt && folderRtRw[2] === rw) {
          stickerInfo = info
          break
        }
      }
    }
    if (!stickerInfo) continue

    // Build sticker name -> asset map with CLEAN names
    const stickerAssets: Map<string, string> = new Map()
    for (const stickerPath of stickerInfo.stickers) {
      const fullPath = join(SELLER_ROOT, stickerInfo.outerName, stickerPath)
      const assetId = await uploadImage(fullPath)
      if (assetId) {
        const clean = cleanName(basename(stickerPath))
        stickerAssets.set(clean.toLowerCase(), assetId)
        console.log(`  Sticker: "${clean}" -> ${assetId.substring(0, 25)}...`)
      }
    }

    const products = await sanityClient.fetch(
      `*[_type == "product" && vendor._ref == $sellerId] { _id, name }`,
      { sellerId: seller._id }
    )

    for (const product of products) {
      const cleanProduct = cleanName(product.name).toLowerCase()

      // EXACT match only
      const assetId = stickerAssets.get(cleanProduct)

      if (!assetId) {
        console.log(`  NO MATCH: "${product.name}" (clean: "${cleanProduct}")`)
        console.log(`    Available: ${[...stickerAssets.keys()].join(', ')}`)
        continue
      }

      await sanityClient
        .patch(product._id)
        .set({
          image: {
            _type: 'image',
            asset: { _type: 'reference', _ref: assetId },
          },
        })
      console.log(`  [OK] "${product.name}" -> ${cleanName(basename([...stickerAssets.entries()].find(([k]) => k === cleanProduct)![1]))}`)
      updated++
    }
  }

  console.log(`\nDone! Updated: ${updated}`)
}

main().catch(console.error)
