import { createClient } from 'next-sanity'
import sharp from 'sharp'
import { readdir, stat } from 'fs/promises'
import { join, basename } from 'path'
import { readFileSync, writeFileSync } from 'fs'

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

const SELLER_ROOT = 'i:\\pawonsjg\\seller'
const TMP_DIR = 'i:\\pawonsjg\\tmp-stickers'

// Ensure tmp dir exists
try { require('fs').mkdirSync(TMP_DIR, { recursive: true }) } catch {}

// Resize image to 40%
async function resizeImage(inputPath: string): Promise<Buffer> {
  return sharp(inputPath)
    .resize({ fit: 'inside', width: 800, height: 800 })
    .webp({ quality: 80 })
    .toBuffer()
}

async function uploadImage(buffer: Buffer, fileName: string): Promise<string | null> {
  try {
    const asset = await sanityClient.assets.upload('image', buffer, { filename: fileName })
    console.log(`    Uploaded: ${fileName}`)
    return asset._id
  } catch (err) {
    console.error(`    Upload failed: ${fileName}`)
    return null
  }
}

async function scanStickers(outerName: string, innerName: string): Promise<string[]> {
  const outerPath = join(SELLER_ROOT, outerName)
  const innerPath = join(outerPath, innerName)
  const readdir = require('fs/promises').readdir
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

function cleanName(fileName: string): string {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/^stiker\s*/i, '')
    .trim()
}

async function main() {
  const readdir = require('fs/promises').readdir
  const stat = require('fs/promises').stat

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
  let errors = 0

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

    // Build sticker map with resized images
    const stickerAssets: Map<string, string> = new Map()

    for (const stickerPath of stickerInfo.stickers) {
      const fullPath = join(SELLER_ROOT, stickerInfo.outerName, stickerPath)
      
      try {
        // Resize and convert to webp
        const buffer = await resizeImage(fullPath)
        const webpFileName = basename(stickerPath).replace(/\.[^/.]+$/, '') + '.webp'
        const assetId = await uploadImage(buffer, webpFileName)
        
        if (assetId) {
          const clean = cleanName(basename(stickerPath))
          stickerAssets.set(clean.toLowerCase(), assetId)
        }
      } catch (err) {
        console.error(`  Resize failed: ${stickerPath}`)
        errors++
      }
    }

    const products = await sanityClient.fetch(
      `*[_type == "product" && vendor._ref == $sellerId] { _id, name }`,
      { sellerId: seller._id }
    )

    for (const product of products) {
      const cleanProduct = cleanName(product.name).toLowerCase()
      const assetId = stickerAssets.get(cleanProduct)

      if (!assetId) continue

      await sanityClient
        .patch(product._id)
        .set({
          image: {
            _type: 'image',
            asset: { _type: 'reference', _ref: assetId },
          },
        })
      console.log(`  [OK] ${product.name}`)
      updated++
    }
  }

  console.log(`\nDone! Updated: ${updated}, Errors: ${errors}`)
}

main().catch(console.error)
