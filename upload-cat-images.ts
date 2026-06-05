import { createClient } from 'next-sanity'
import * as fs from 'fs'

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

const categories = [
  { id: 'category-makanan', file: 'C:\\Users\\diskonekted\\.gemini\\antigravity\\brain\\a774d4fd-73fa-4bad-901d-0fb23bb0b8ae\\cat_makanan_1780629181350.png' },
  { id: 'category-jasa', file: 'C:\\Users\\diskonekted\\.gemini\\antigravity\\brain\\a774d4fd-73fa-4bad-901d-0fb23bb0b8ae\\cat_jasa_1780629196667.png' },
  { id: 'category-kerajinan-tangan', file: 'C:\\Users\\diskonekted\\.gemini\\antigravity\\brain\\a774d4fd-73fa-4bad-901d-0fb23bb0b8ae\\cat_kerajinan_1780629210437.png' },
  { id: 'category-bibit-tanaman-dan-buah', file: 'C:\\Users\\diskonekted\\.gemini\\antigravity\\brain\\a774d4fd-73fa-4bad-901d-0fb23bb0b8ae\\cat_bibit_1780629221962.png' },
  { id: 'category-fashion', file: 'C:\\Users\\diskonekted\\.gemini\\antigravity\\brain\\a774d4fd-73fa-4bad-901d-0fb23bb0b8ae\\cat_fashion_1780629235979.png' },
  { id: 'category-mainan-anak', file: 'C:\\Users\\diskonekted\\.gemini\\antigravity\\brain\\a774d4fd-73fa-4bad-901d-0fb23bb0b8ae\\cat_mainan_1780629248473.png' }
]

async function run() {
  for (const cat of categories) {
    if (!fs.existsSync(cat.file)) {
      console.log(`Skipping ${cat.id}, file not found: ${cat.file}`)
      continue
    }

    console.log(`Uploading image for ${cat.id}...`)
    const buffer = fs.readFileSync(cat.file)
    const asset = await client.assets.upload('image', buffer, { filename: cat.file.split('\\').pop() })
    
    console.log(`Patching category ${cat.id}...`)
    await client.patch(cat.id).set({
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id
        }
      }
    }).commit()
    console.log(`Updated ${cat.id} successfully!`)
  }
}

run().catch(console.error)
