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

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
})

async function main() {
  // 1. Check product in Sanity (published perspective)
  console.log('=== 1. PRODUCT IN SANITY (published) ===')
  const product = await sanityClient.fetch(
    `*[_type == "product" && name == "Keripik tela"][0] {
      _id,
      name,
      "imageAssetId": image.asset->_id,
      "imageFilename": image.asset->originalFilename,
      _rev,
      _updatedAt
    }`,
    {},
    { perspective: 'published' }
  )
  console.log(JSON.stringify(product, null, 2))

  // 2. Check product in drafts perspective
  console.log('\n=== 2. PRODUCT IN DRAFTS ===')
  const productDraft = await sanityClient.fetch(
    `*[_type == "product" && name == "Keripik tela"][0] {
      _id,
      name,
      "imageAssetId": image.asset->_id,
      "imageFilename": image.asset->originalFilename,
      _rev,
      _updatedAt
    }`,
    {},
    { perspective: 'drafts' }
  )
  console.log(JSON.stringify(productDraft, null, 2))

  // 3. Check what image URL the frontend would generate
  console.log('\n=== 3. EXPECTED IMAGE URL ===')
  if (product?.imageAssetId) {
    console.log(`Asset ID: ${product.imageAssetId}`)
    console.log(`Expected URL: https://cdn.sanity.io/images/plgdzori/production/${product.imageAssetId.split('-')[0]}.webp`)
  }

  // 4. Check all product images for RT 04 RW 01
  console.log('\n=== 4. ALL RT 04 RW 01 PRODUCTS ===')
  const products = await sanityClient.fetch(
    `*[_type == "product" && vendor._ref == "seller-rt-04-rw-01"] | order(name asc) {
      name,
      "imageId": image.asset->_id,
      "filename": image.asset->originalFilename
    }`
  )
  for (const p of products) {
    console.log(`${p.name}: ${p.imageId || 'NO IMAGE'} - ${p.filename || 'NO FILE'}`)
  }

  // 5. Check if there's a cache issue - fetch with no-cache
  console.log('\n=== 5. FORCE REFRESH ===')
  const productFresh = await sanityClient.fetch(
    `*[_type == "product" && name == "Keripik tela"][0] {
      _id, name, "imageId": image.asset->_id
    }`,
    {},
    { cache: 'no-cache' }
  )
  console.log(JSON.stringify(productFresh, null, 2))
}

main().catch(console.error)
