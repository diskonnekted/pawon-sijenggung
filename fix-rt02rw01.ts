import { createClient } from 'next-sanity'
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { readdir } from 'fs/promises'
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

function cleanName(fileName: string): string {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/^stiker\s*/i, '')
    .trim()
}

async function resizeImage(inputPath: string): Promise<Buffer> {
  return sharp(inputPath)
    .resize({ fit: 'inside', width: 800, height: 800 })
    .webp({ quality: 80 })
    .toBuffer()
}

async function main() {
  const STICKER_DIR = 'i:\\pawonsjg\\seller\\RT 02 RW 01-20260805T093802Z-1-001\\RT 02 RW 01\\Stiker'
  const files = await readdir(STICKER_DIR)
  
  console.log('=== STICKER FILES ===')
  for (const file of files) {
    console.log(`  ${file} -> clean: "${cleanName(file)}"`)
  }

  const products = await sanityClient.fetch(
    `*[_type == "product" && vendor._ref == "seller-rt-02-rw-01"] { _id, name }`
  )

  console.log('\n=== PRODUCTS ===')
  for (const p of products) {
    console.log(`  ${p.name} (clean: "${cleanName(p.name)}")`)
  }

  // Match and update
  for (const product of products) {
    const cleanProduct = cleanName(product.name).toLowerCase()
    
    let targetFile: string | undefined
    for (const file of files) {
      const clean = cleanName(file).toLowerCase()
      if (clean === cleanProduct) {
        targetFile = file
        break
      }
    }

    if (!targetFile) {
      console.log(`\nNO MATCH: ${product.name}`)
      continue
    }

    console.log(`\nProcessing: ${product.name}`)
    console.log(`  Found sticker: ${targetFile}`)
    
    const fullPath = join(STICKER_DIR, targetFile)
    const buffer = await resizeImage(fullPath)
    const asset = await sanityClient.assets.upload('image', buffer, { filename: cleanName(targetFile) + '.webp' })
    const assetId = asset._id
    console.log(`  Uploaded: ${assetId}`)

    await sanityClient
      .patch(product._id)
      .set({
        image: {
          _type: 'image',
          asset: { _type: 'reference', _ref: assetId },
        },
      })
      .commit()
    
    console.log(`  [FIXED] ${product.name}`)
  }
}

main().catch(console.error)
