import { createClient } from 'next-sanity'
import { readFileSync } from 'fs'

function loadEnv(path: string): Record<string, string> {
  const result: Record<string, string> = {}
  let content: string
  try { content = readFileSync(path, 'utf-8') } catch { return result }
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
for (const [k, v] of Object.entries(env)) if (!process.env[k]) process.env[k] = v

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
})

export async function main() {
  // Get sellers with their posters
  const sellers = await client.fetch(
    `*[_type == "seller" && defined(logo) && count(posters) > 0] {
      _id, name, posters[]
    }`
  )

  console.log(`Found ${sellers.length} sellers with posters\n`)

  let updated = 0

  for (const seller of sellers) {
    console.log(`Processing: ${seller.name} (${seller.posters.length} posters)`)

    // Get products for this seller
    const products = await client.fetch(
      `*[_type == "product" && vendor._ref == $sellerId] | order(_createdAt asc) {
        _id, name
      }`,
      { sellerId: seller._id }
    )

    console.log(`  Products to update: ${products.length}`)

    // Distribute poster images to products cyclically
    for (let i = 0; i < products.length; i++) {
      const poster = seller.posters[i % seller.posters.length]
      if (!poster) continue

      try {
        await client.patch(products[i]._id).set({
          image: {
            _type: 'image',
            asset: { _type: 'reference', _ref: poster.asset._ref },
          },
        })
        console.log(`  [OK] ${products[i].name} -> poster ${i % seller.posters.length + 1}`)
        updated++
      } catch (err) {
        console.error(`  [ERR] ${products[i].name}: ${err}`)
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`Update complete!`)
  console.log(`Updated: ${updated} products`)
}

main().catch(console.error)
