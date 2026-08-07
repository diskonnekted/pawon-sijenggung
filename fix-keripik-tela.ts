import { createClient } from 'next-sanity'
import sharp from 'sharp'
import { readFileSync } from 'fs'

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

function cleanName(fileName: string): string {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/^stiker\s*/i, '')
    .trim()
}

// Get all stickers for a seller
async function getStickers() {
  const readdir = require('fs/promises').readdir
  const stat = require('fs/promises').stat
  const join = require('path').join
  const SELLER_ROOT = 'i:\\pawonsjg\\seller'
  
  const stickerMap: Map<string, string[]> = new Map()
  const sellerDirs = await readdir(SELLER_ROOT)
  
  for (const outerName of sellerDirs) {
    const outerPath = join(SELLER_ROOT, outerName)
    const s = await stat(outerPath)
    if (!s.isDirectory()) continue
    const innerDirs = await readdir(outerPath, { withFileTypes: true })
    for (const innerDir of innerDirs) {
      if (!innerDir.isDirectory()) continue
      const innerPath = join(outerPath, innerDir.name)
      const entries = await readdir(innerPath, { withFileTypes: true })
      for (const entry of entries) {
        const name = entry.name.toLowerCase().replace(/_+$/, '')
        if (name === 'stiker') {
          const stickerPath = join(innerPath, entry.name)
          const files = await readdir(stickerPath)
          stickerMap.set(innerDir.name, files)
        }
      }
    }
  }
  return stickerMap
}

async function resizeImage(inputPath: string): Promise<Buffer> {
  return sharp(inputPath)
    .resize({ fit: 'inside', width: 800, height: 800 })
    .webp({ quality: 80 })
    .toBuffer()
}

async function uploadImage(buffer: Buffer, fileName: string): Promise<string | null> {
  try {
    const asset = await sanityClient.assets.upload('image', buffer, { filename: fileName })
    return asset._id
  } catch (err) {
    return null
  }
}

async function main() {
  // Check keripik tela
  const product = await sanityClient.fetch(
    `*[_type == "product" && name == "Keripik tela"][0] {
      _id, name, "imageId": image.asset->_id, "vendorId": vendor->_id
    }`
  )
  console.log('=== KERIPEK TEJA PRODUCT ===')
  console.log(JSON.stringify(product, null, 2))

  // Get RT 04 RW 01 stickers
  const stickerMap = await getStickers()
  const rt04rw01Stickers = stickerMap.get('RT 04 RW 01') || []
  console.log('\n=== RT 04 RW 01 STICKERS ===')
  for (const s of rt04rw01Stickers) {
    console.log(`  ${s}`)
  }

  // Upload keripik tela sticker and update
  const join = require('path').join
  const readdir = require('fs/promises').readdir
  const stat = require('fs/promises').stat
  const SELLER_ROOT = 'i:\\pawonsjg\\seller'
  const outerName = 'RT 04 RW 01-20260805T093847Z-1-001'
  const innerName = 'RT 04 RW 01'
  const outerPath = join(SELLER_ROOT, outerName)
  const innerPath = join(outerPath, innerName)
  const entries = await readdir(innerPath, { withFileTypes: true })
  
  for (const entry of entries) {
    const name = entry.name.toLowerCase().replace(/_+$/, '')
    if (name === 'stiker') {
      const stickerPath = join(innerPath, entry.name)
      const files = await readdir(stickerPath)
      
      for (const file of files) {
        const clean = cleanName(file).toLowerCase()
        if (clean === 'keripik tela') {
          console.log(`\n=== UPLOADING keripik tela ===`)
          const fullPath = join(stickerPath, file)
          const buffer = await resizeImage(fullPath)
          const assetId = await uploadImage(buffer, file.replace(/\.[^/.]+$/, '') + '.webp')
          
          if (assetId && product?._id) {
            await sanityClient
              .patch(product._id)
              .set({
                image: {
                  _type: 'image',
                  asset: { _type: 'reference', _ref: assetId },
                },
              })
            console.log(`[OK] Updated product ${product._id}`)
            console.log(`New imageId: ${assetId}`)
          }
        }
      }
    }
  }
}

main().catch(console.error)
