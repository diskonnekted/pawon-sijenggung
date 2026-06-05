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

async function check() {
  const count = await client.fetch('count(*[_type == "product"])')
  console.log(`Total products in Sanity: ${count}`)
  
  const products = await client.fetch('*[_type == "product"]{_id, name}')
  console.log(products)
}

check().catch(console.error)
