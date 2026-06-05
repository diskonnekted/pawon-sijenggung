import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const token = process.env.SANITY_API_WRITE_TOKEN

const client = createClient({
  projectId,
  dataset: 'production',
  useCdn: false, // Ensure no CDN cache
  apiVersion: '2024-01-01',
  token
})

async function check() {
  const products = await client.fetch(`*[_type == "product" && (!defined($search) || name match $search + "*")] | order(_createdAt desc) { _id, name }`, { search: null })
  console.log(`Query returned ${products.length} products:`, products)
}

check().catch(console.error)
