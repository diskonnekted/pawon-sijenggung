import { createClient } from 'next-sanity'
import sharp from 'sharp'
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

async function resizeImage(inputPath: string): Promise<Buffer> {
  return sharp(inputPath)
    .resize({ fit: 'inside', width: 800, height: 800 })
    .webp({ quality: 80 })
    .toBuffer()
}

async function main() {
  const INNER_PATH = 'i:\\pawonsjg\\seller\\RT 03 RW 03-20260805T093805Z-1-001\\RT 03 RW 03'
  const entries = await readdir(INNER_PATH, { withFileTypes: true })
  
  console.log('=== RT 03 RW 03 FILES ===')
  const files: string[] = []
  const subdirs: string[] = []
  
  for (const entry of entries) {
    const entryPath = join(INNER_PATH, entry.name)
    const s = await stat(entryPath)
    if (s.isFile()) {
      files.push(entry.name)
      console.log(`  FILE: ${entry.name}`)
    } else {
      subdirs.push(entry.name)
      console.log(`  DIR: ${entry.name}`)
      // Read files in subdirectory
      const subFiles = await readdir(entryPath)
      for (const f of subFiles) {
        console.log(`    - ${f}`)
      }
    }
  }

  // Determine product name from first file
  const firstFile = files[0] || (subdirs.length > 0 ? join(subdirs[0], (await readdir(join(INNER_PATH, subdirs[0])))[0]) : null)
  
  if (!firstFile) {
    console.log('\nNo files found!')
    return
  }

  // Extract product name
  let productName: string
  if (typeof firstFile === 'string' && firstFile.includes('/')) {
    productName = basename(firstFile).replace(/\.[^/.]+$/, '').replace(/^\d+\.\s*/, '').trim()
  } else {
    productName = basename(firstFile).replace(/\.[^/.]+$/, '').replace(/^\d+\.\s*/, '').trim()
  }

  console.log(`\n=== PRODUCT NAME: ${productName} ===`)

  // Upload first file as logo/banner
  const fullPath = typeof firstFile === 'string' && firstFile.includes('/') 
    ? join(INNER_PATH, firstFile)
    : join(INNER_PATH, firstFile)
  
  const buffer = await resizeImage(fullPath)
  const logoAsset = await sanityClient.assets.upload('image', buffer, { filename: slugify(productName) + '.webp' })
  console.log(`Logo/Banner uploaded: ${logoAsset._id}`)

  // Update or create seller
  let seller = await sanityClient.fetch(
    `*[_type == "seller" && slug.current == "rt-03-rw-03"][0] { _id, name }`
  )

  if (!seller) {
    console.log('\nCreating seller...')
    await sanityClient.create({
      _id: 'seller-rt-03-rw-03',
      _type: 'seller',
      name: 'Toko RT 03 RW 03',
      slug: { _type: 'slug', current: 'rt-03-rw-03' },
      rt: '03',
      rw: '03',
      logo: { _type: 'image', asset: { _type: 'reference', _ref: logoAsset._id } },
      banner: { _type: 'image', asset: { _type: 'reference', _ref: logoAsset._id } },
      products: [productName],
      localImagePath: 'RT 03 RW 03',
    })
    seller = { _id: 'seller-rt-03-rw-03', name: 'Toko RT 03 RW 03' }
  } else {
    await sanityClient
      .patch(seller._id)
      .set({
        logo: { _type: 'image', asset: { _type: 'reference', _ref: logoAsset._id } },
        banner: { _type: 'image', asset: { _type: 'reference', _ref: logoAsset._id } },
        products: [productName]
      })
      .commit()
  }
  console.log(`Seller updated: ${productName}`)

  // Create product
  const productId = `product-${slugify(productName)}-rt-03-rw-03`
  await sanityClient.create({
    _id: productId,
    _type: 'product',
    name: productName,
    slug: { _type: 'slug', current: slugify(productName) + '-rt-03-rw-03' },
    price: 10000,
    stock: 50,
    description: `Produk dari Toko RT 03 RW 03`,
    image: { _type: 'image', asset: { _type: 'reference', _ref: logoAsset._id } },
    vendor: { _type: 'reference', _ref: seller._id },
  })
  console.log(`Product created: ${productName}`)
  
  console.log('\nDone!')
}

main().catch(console.error)
