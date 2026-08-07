import { createClient } from 'next-sanity'
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

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
})

async function main() {
  // Check all RT 04 RW 01 products
  const products = await client.fetch(
    `*[_type == "product" && vendor._ref == $sellerId] {
      _id, name,
      "imageId": image.asset->_id,
      "imageFilename": image.asset->originalFilename
    }`,
    { sellerId: "seller-rt-04-rw-01" }
  )

  console.log('=== RT 04 RW 01 PRODUCTS ===')
  for (const p of products) {
    console.log(`${p.name}:`)
    console.log(`  _id: ${p._id}`)
    console.log(`  imageId: ${p.image?.asset?._id || 'NONE'}`)
    console.log(`  filename: ${p.image?.asset?.originalFilename || 'NONE'}`)
  }

  // Also check what the expected sticker asset should be
  console.log('\n=== EXPECTED STICKER ===')
  console.log('Expected: kupat pecel.png')
}

main().catch(console.error)
