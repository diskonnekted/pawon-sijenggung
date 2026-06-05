import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !token) {
  console.error("Missing credentials")
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token
})

async function run() {
  const vendors = await client.fetch('*[_type == "vendor"]')
  console.log(`Found ${vendors.length} vendors.`)

  for (const vendor of vendors) {
    if (!vendor.isVerified) {
      console.log(`Verifying vendor: ${vendor.name} (${vendor._id})`)
      await client.patch(vendor._id).set({ isVerified: true }).commit()
    }
  }
  console.log('All vendors verified successfully!')
}

run().catch(console.error)
