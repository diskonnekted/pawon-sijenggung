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
  // Fix product name
  const product = await sanityClient.fetch(
    `*[_type == "product" && name == "banner cilok legend"][0] {
      _id, name, "imageId": image.asset->_id
    }`
  )
  
  if (!product) {
    console.log('Product not found!')
    return
  }

  // Use the cilok legend image (second file)
  // Get the correct image asset ID
  const oldImageId = product.image?._ref
  
  // Update product name and keep the same image
  await sanityClient
    .patch(product._id)
    .set({
      name: 'cilok legend',
      slug: { _type: 'slug', current: 'cilok-legend-rt-03-rw-03' },
    })
    .commit()
  
  // Update seller products
  const seller = await sanityClient.fetch(
    `*[_type == "seller" && slug.current == "rt-03-rw-03"][0] { _id, products }`
  )
  
  if (seller) {
    await sanityClient
      .patch(seller._id)
      .set({
        products: ['cilok legend']
      })
      .commit()
  }

  console.log(`Fixed: "banner cilok legend" -> "cilok legend"`)
}

main().catch(console.error)
