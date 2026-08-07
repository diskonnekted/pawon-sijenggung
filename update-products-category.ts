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

export async function main() {
  // Get makanan category ID
  const makananCat = await sanityClient.fetch(
    `*[_type == "category" && slug.current == "makanan"][0]`,
    {},
    { cache: 'no-cache' }
  )

  if (!makananCat) {
    console.log('Category "makanan" not found!')
    return
  }

  console.log(`Found category: ${makananCat.name} (${makananCat._id})\n`)

  // Get all products that don't have the makanan category yet
  // These are products created from sellers (they have vendor reference to seller type)
  const products = await sanityClient.fetch(
    `*[_type == "product" && !(categories[]->_id == $catId)] | order(_createdAt desc) {
      _id, name, categories[]-> { _id, name, slug }
    }`,
    { catId: makananCat._id }
  )

  console.log(`Products to update: ${products.length}\n`)

  let updated = 0
  const batchSize = 5

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize)
    const promises = batch.map(async (product) => {
      try {
        const existingCats = product.categories || []
        const hasMakanan = existingCats.some((c: any) => c._id === makananCat._id)

        if (hasMakanan) {
          console.log(`  - SKIP: ${product.name} (already has makanan)`)
          return
        }

        await sanityClient.patch(product._id).set({
          categories: [
            ...existingCats.map((c: any) => ({
              _type: 'reference',
              _ref: c._id,
              _key: c._id,
            })),
            {
              _type: 'reference',
              _ref: makananCat._id,
              _key: makananCat._id,
            },
          ],
        })
        console.log(`  [OK] ${product.name}`)
        updated++
      } catch (err) {
        console.error(`  [ERR] ${product.name}: ${err}`)
      }
    })
    await Promise.all(promises)
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`Update complete!`)
  console.log(`  Updated: ${updated}`)
}

main().catch(console.error)
