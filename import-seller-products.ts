import { createClient } from 'next-sanity'
import { readFileSync } from 'fs'

function loadEnv(path: string): Record<string, string> {
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
      if (key && value !== undefined) result[key.trim()] = value
    }
  })
  return result
}

const env = loadEnv('i:\\pawonsjg\\.env.local')
for (const [k, v] of Object.entries(env)) {
  if (!process.env[k]) process.env[k] = v
}

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
})

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

async function main() {
  console.log('Fetching sellers with products...\n')
  const sellers = await sanityClient.fetch(
    `*[_type == "seller" && defined(logo) && count(products) > 0] {
      _id, name, slug, products, logo
    }`
  )

  console.log(`Found ${sellers.length} sellers with products\n`)

  let created = 0
  let skipped = 0

  for (const seller of sellers) {
    console.log(`\nProcessing: ${seller.name}`)
    console.log(`  Products to create: ${seller.products.length}`)

    const sellerSlug = seller.slug?.current || slugify(seller.name)
    for (const productName of seller.products) {
      try {
        const productSlug = slugify(`${productName}-${sellerSlug}`)
        const productId = `product-${sellerSlug}-${productSlug}`

        // Check if product already exists
        const existing = await sanityClient.fetch(
          `*[_id == $productId][0]`,
          { productId }
        )

        if (existing) {
          console.log(`  - SKIP: ${productName} (exists)`)
          continue
        }

        const productDoc = {
          _id: productId,
          _type: 'product',
          name: productName,
          slug: { _type: 'slug', current: productSlug },
          price: 10000, // Default price
          stock: 50,
          description: `Produk dari ${seller.name}`,
          image: seller.logo,
          vendor: {
            _type: 'reference',
            _ref: seller._id,
          },
        }

        await sanityClient.createIfNotExists(productDoc)
        console.log(`  [OK] ${productName}`)
        created++
      } catch (err) {
        console.error(`  [ERR] ${productName}: ${err}`)
        skipped++
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`Import complete!`)
  console.log(`  Created: ${created}`)
  console.log(`  Skipped: ${skipped}`)
}

main().catch(console.error)
