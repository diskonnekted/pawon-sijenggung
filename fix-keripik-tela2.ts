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

async function resizeImage(inputPath: string): Promise<Buffer> {
  return sharp(inputPath)
    .resize({ fit: 'inside', width: 800, height: 800 })
    .webp({ quality: 80 })
    .toBuffer()
}

async function main() {
  // Get the exact product
  const product = await sanityClient.fetch(
    `*[_type == "product" && name == "Keripik tela"][0] {
      _id, name, "currentImageId": image.asset->_id, "currentRev": _rev
    }`,
    {},
    { perspective: 'drafts' }
  )

  console.log('=== BEFORE ===')
  console.log(`Product: ${product.name}`)
  console.log(`Current Image: ${product.currentImageId}`)
  console.log(`Current Rev: ${product.currentRev}`)

  // Upload the correct sticker
  const join = require('path').join
  const readdir = require('fs/promises').readdir
  const SELLER_ROOT = 'i:\\pawonsjg\\seller'
  const stickerPath = join(SELLER_ROOT, 'RT 04 RW 01-20260805T093847Z-1-001', 'RT 04 RW 01', 'Stiker')
  const files = await readdir(stickerPath)
  
  let targetFile: string | undefined
  for (const file of files) {
    if (cleanName(file).toLowerCase() === 'keripik tela') {
      targetFile = file
      break
    }
  }

  if (!targetFile) {
    console.log('ERROR: keripik tela.png not found!')
    console.log('Available files:', files)
    return
  }

  console.log(`\nUploading: ${targetFile}`)
  const buffer = await resizeImage(join(stickerPath, targetFile))
  const asset = await sanityClient.assets.upload('image', buffer, { filename: 'keripik-tela.webp' })
  console.log(`Uploaded asset: ${asset._id}`)

  // Update with explicit transaction
  console.log(`\nUpdating product ${product._id}`)
  
  const result = await sanityClient
    .patch(product._id)
    .set({
      image: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
      },
    })
    .commit()

  console.log(`Commit result:`, result)

  // Verify
  const verify = await sanityClient.fetch(
    `*[_type == "product" && _id == $id][0] {
      _id, name, "newImageId": image.asset->_id, "newRev": _rev
    }`,
    { id: product._id },
    { perspective: 'drafts' }
  )

  console.log(`\n=== AFTER ===`)
  console.log(`Product: ${verify.name}`)
  console.log(`New Image: ${verify.newImageId}`)
  console.log(`New Rev: ${verify.newRev}`)
  console.log(`Updated: ${verify.newImageId === asset._id ? 'YES ✓' : 'NO ✗'}`)
}

main().catch(console.error)
