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

function slugify(text: string): string {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

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
  const STICKER_DIR = 'i:\\pawonsjg\\seller\\RT 03 RW 01-20260805T093902Z-1-001\\RT 03 RW 01\\Stiker'
  const files = await readdir(STICKER_DIR)
  
  console.log('=== RT 03 RW 01 STICKER FILES ===')
  for (const file of files) {
    console.log(`  ${file} -> clean: "${cleanName(file)}"`)
  }

  const seller = await sanityClient.fetch(
    `*[_type == "seller" && slug.current == "rt-03-rw-01"][0] {
      _id, name, products
    }`
  )
  console.log('\n=== SELLER ===')
  console.log(JSON.stringify(seller, null, 2))

  const newProducts = files.map(f => cleanName(f))
  console.log('\n=== PRODUCTS TO CREATE ===')
  for (const p of newProducts) {
    console.log(`  ${p}`)
  }

  // Update seller
  await sanityClient
    .patch(seller._id)
    .set({ products: newProducts })
    .commit()
  console.log(`\nSeller updated: ${newProducts.length} products`)

  // Create products
  for (const file of files) {
    const productName = cleanName(file)
    const productId = `product-${slugify(productName)}-rt-03-rw-01`
    
    console.log(`\nCreating: ${productName}`)
    
    const buffer = await resizeImage(join(STICKER_DIR, file))
    const asset = await sanityClient.assets.upload('image', buffer, { filename: slugify(productName) + '.webp' })

    await sanityClient.create({
      _id: productId,
      _type: 'product',
      name: productName,
      slug: { _type: 'slug', current: slugify(productName) + '-rt-03-rw-01' },
      price: 10000,
      stock: 50,
      description: `Produk dari ${seller.name}`,
      image: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
      },
      vendor: {
        _type: 'reference',
        _ref: seller._id,
      },
    })
    console.log(`  [OK] ${productName}`)
  }

  console.log(`\nDone! Created: ${files.length} products`)
}

main().catch(console.error)
