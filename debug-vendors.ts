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
  // Test VENDORS_QUERY
  const query = `
  *[_type == "vendor" && isVerified == true] {
    _id,
    name,
    "slug": slug.current,
    logo,
    address,
    description,
    isVerified,
    "_refType": _type
  } +
  *[_type == "seller" && isActive == true && defined(logo)] {
    _id,
    name,
    "slug": "seller-" + slug.current,
    logo,
    "address": ("RT " + rt + " RW " + rw),
    "description": ("Toko UMKM di RT " + rt + " RW " + rw + " - " + count(products) + " produk"),
    "isVerified": true,
    "_refType": "seller"
  }
  | order(name asc)
  `

  const result = await client.fetch(query)
  console.log('VENDORS_QUERY result:', result.length)
  for (const item of result) {
    console.log(`  ${item._refType} - ${item.name} - ${item.slug}`)
  }
}

main().catch(console.error)
