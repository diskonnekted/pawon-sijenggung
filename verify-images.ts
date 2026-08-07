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
  // Get all seller poster asset IDs
  const sellers = await client.fetch(
    `*[_type == "seller" && count(posters) > 0] {
      _id, name, "posterIds": posters[].asset->_id
    }`
  )

  console.log('=== SELLER POSTER ASSETS ===')
  for (const s of sellers) {
    console.log(`${s.name}: ${s.posterIds.join(', ')}`)
  }

  console.log('\n=== PRODUCT IMAGES ===')
  // Get sample products
  const products = await client.fetch(
    `*[_type == "product"] | order(_createdAt desc) [0...10] {
      _id, name, "imageId": image.asset->_id
    }`
  )

  for (const p of products) {
    console.log(`${p.name}: ${p.imageId}`)
  }
}

main().catch(console.error)
