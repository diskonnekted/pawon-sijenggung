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
  const [products, sellers, categories] = await Promise.all([
    sanityClient.fetch('*[_type == "product"]'),
    sanityClient.fetch('*[_type == "seller"]'),
    sanityClient.fetch('*[_type == "category"]'),
  ])

  console.log('=== DATA SUMMARY ===')
  console.log(`Products (_type=product): ${products.length}`)
  console.log(`Sellers (_type=seller):   ${sellers.length}`)
  console.log(`Categories:               ${categories.length}`)

  console.log('\n=== PRODUCTS ===')
  for (const p of products) {
    console.log(`  ${p._id} - ${p.name} - Rp${p.price}`)
  }

  console.log('\n=== SELLERS ===')
  for (const s of sellers) {
    console.log(`  ${s.name} - RT${s.rt} RW${s.rw} - products: ${s.products?.length || 0} - hasLogo: ${!!s.logo}`)
  }
}

main().catch(console.error)
