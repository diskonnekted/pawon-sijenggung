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
  // Get sellers with posters
  const sellers = await client.fetch(
    `*[_type == "seller" && count(posters) > 0] {
      _id, name, slug, posters[] {
        _id,
        "assetId": asset->_id,
        mimeType
      }
    }`
  )

  console.log(`Found ${sellers.length} sellers with posters\n`)

  let updated = 0
  let skipped = 0

  for (const seller of sellers) {
    console.log(`Processing: ${seller.name}`)
    console.log(`  Posters: ${seller.posters.map(p => p.assetId || 'NO ASSET').join(', ')}`)

    // Get products linked to this seller via vendor reference
    const products = await client.fetch(
      `*[_type == "product" && vendor._ref == $sellerId] {
        _id, name, "currentImage": image.asset->_id
      }`,
      { sellerId: seller._id }
    )

    console.log(`  Products: ${products.length}`)

    if (products.length === 0) {
      console.log(`  Skipping (no products linked)\n`)
      skipped++
      continue
    }

    for (let i = 0; i < products.length; i++) {
      const poster = seller.posters[i % seller.posters.length]
      if (!poster || !poster.assetId) {
        console.log(`  - SKIP ${products[i].name} (no poster)`);
        continue;
      }

      const newImageRef = poster.assetId
      const currentImage = products[i].currentImage

      if (currentImage === newImageRef) {
        console.log(`  - SKIP ${products[i].name} (already ${newImageRef.substring(0, 20)}...)`)
        continue
      }

      try {
        await client
          .patch(products[i]._id)
          .set({
            image: {
              _type: 'image',
              asset: { _type: 'reference', _ref: newImageRef },
            },
          })

        console.log(`  [OK] ${products[i].name}: ${currentImage?.substring(0, 20) || 'null'}... -> ${newImageRef.substring(0, 20)}...`)
        updated++
      } catch (err) {
        console.error(`  [ERR] ${products[i].name}: ${err}`)
      }
    }
    console.log('')
  }

  console.log(`${'='.repeat(60)}`)
  console.log(`Update complete!`)
  console.log(`Updated: ${updated}`)
  console.log(`Skipped: ${skipped}`)
}

main().catch(console.error)
