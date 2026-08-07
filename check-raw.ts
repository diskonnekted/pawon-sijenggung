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
  // Get one product raw
  const product = await client.fetch(
    `*[_type == "product" && name == "kupat pecel"][0]`,
    {},
    { perspective: 'previewDrafts' }
  )

  console.log('=== RAW PRODUCT DOCUMENT ===')
  console.log(JSON.stringify(product, null, 2))
}

main().catch(console.error)
