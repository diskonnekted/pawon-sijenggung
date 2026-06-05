import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const token = process.env.SANITY_API_WRITE_TOKEN

const client = createClient({
  projectId,
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token
})

async function run() {
  const products = await client.fetch('*[_type == "product"]')
  console.log(`Found ${products.length} products.`)

  for (const product of products) {
    // Fetch product with expanded categories to check slug
    const prodWithCats = await client.fetch('*[_id == $id]{ categories[]->{slug} }[0]', { id: product._id })
    const isJasa = prodWithCats.categories?.some((c: any) => c.slug?.current.includes('jasa'))

    if (isJasa) {
      console.log(`Converting ${product.name} to service...`)
      
      const serviceDoc = {
        ...product,
        _id: product._id.replace('product-', 'service-'), // Change ID prefix
        _type: 'service',
        priceType: 'fixed'
      }
      delete serviceDoc.stock // Remove product specific field
      
      // Create new service
      await client.createIfNotExists(serviceDoc)
      console.log(`Created service ${serviceDoc._id}`)
      
      // Delete old product
      await client.delete(product._id)
      console.log(`Deleted product ${product._id}`)
    }
  }
  console.log('Conversion complete!')
}

run().catch(console.error)
