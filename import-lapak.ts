import { createClient } from 'next-sanity'

// Basic slugify function
function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !token) {
  console.error("Missing SANITY_API_WRITE_TOKEN or NEXT_PUBLIC_SANITY_PROJECT_ID. Use: NEXT_PUBLIC_SANITY_PROJECT_ID=x SANITY_API_WRITE_TOKEN=y npx tsx import-lapak.ts")
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token
})

async function uploadImageFromUrl(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
    
    const buffer = await response.arrayBuffer()
    // upload the image to sanity
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename: url.split('/').pop()?.split('?')[0] || 'image.jpg'
    })
    
    return asset._id
  } catch (err) {
    console.error('Error uploading image:', url, err)
    return null
  }
}

async function migrate() {
  console.log('Fetching products from Sijenggung API...')
  const response = await fetch('https://sijenggung-banjarnegara.desa.id/internal_api/lapak/produk')
  const json = await response.json()
  const products = json.data
  
  console.log(`Found ${products.length} products. Starting migration...`)
  
  for (const p of products) {
    const attr = p.attributes
    if (!attr) continue;
    
    console.log(`\nProcessing: ${attr.nama}`)
    
    // 1. Create Category
    let categoryId = null
    if (attr.kategori && attr.kategori.kategori) {
      const catSlug = slugify(attr.kategori.kategori, { lower: true })
      categoryId = `category-${catSlug}`
      await client.createIfNotExists({
        _id: categoryId,
        _type: 'category',
        name: attr.kategori.kategori,
        slug: { _type: 'slug', current: catSlug }
      })
      console.log(`- Category [${attr.kategori.kategori}] created/exists`)
    }
    
    // 2. Create Vendor
    let vendorId = null
    if (attr.pelapak && attr.pelapak.penduduk && attr.pelapak.penduduk.nama) {
      const vendorSlug = slugify(attr.pelapak.penduduk.nama, { lower: true })
      vendorId = `vendor-${vendorSlug}`
      await client.createIfNotExists({
        _id: vendorId,
        _type: 'vendor',
        name: attr.pelapak.penduduk.nama,
        slug: { _type: 'slug', current: vendorSlug },
        phone: attr.pelapak.telepon || attr.pelapak.penduduk.telepon || '',
      })
      console.log(`- Vendor [${attr.pelapak.penduduk.nama}] created/exists`)
    }
    
    // 3. Upload first image
    let imageAssetId = null
    if (attr.foto && attr.foto.length > 0) {
      console.log(`- Uploading image...`)
      imageAssetId = await uploadImageFromUrl(attr.foto[0])
    }
    
    // 4. Create Product
    if (!imageAssetId) {
       console.log(`- Skipping product due to image upload failure.`)
       continue;
    }

    const prodSlug = slugify(attr.nama, { lower: true })
    const productId = `product-${p.id}-${prodSlug}`
    
    const productDoc: any = {
      _id: productId,
      _type: 'product',
      name: attr.nama,
      slug: { _type: 'slug', current: prodSlug },
      price: attr.harga,
      description: attr.deskripsi || '',
      stock: 99,
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAssetId
        }
      }
    }
    
    if (vendorId) {
      productDoc.vendor = {
        _type: 'reference',
        _ref: vendorId
      }
    }
    
    if (categoryId) {
      productDoc.categories = [{
        _type: 'reference',
        _ref: categoryId,
        _key: categoryId
      }]
    }
    
    await client.createOrReplace(productDoc)
    console.log(`- Product created successfully!`)
  }
  
  console.log('\nMigration completed!')
}

migrate().catch(err => {
  console.error("Migration failed:", err)
})
