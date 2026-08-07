import { createClient } from 'next-sanity'
import { readFileSync } from 'fs'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'

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
  // Get all sellers with products
  const sellers = await sanityClient.fetch(
    `*[_type == "seller"] | order(name asc) {
      _id, name, rt, rw, "productCount": count(products), products
    }`
  )

  console.log('=== SELLERS & PRODUCTS ===')
  for (const s of sellers) {
    console.log(`RT ${s.rt} RW ${s.rw}: ${s.productCount} products`)
    if (s.products?.length > 0) {
      for (const p of s.products) {
        console.log(`  - ${p}`)
      }
    }
  }

  // Check which RT/RW have products in DB
  console.log('\n=== RT/RW SUMMARY ===')
  const rtRwMap = new Map()
  for (const s of sellers) {
    const key = `RT ${s.rt} RW ${s.rw}`
    rtRwMap.set(key, s.productCount || 0)
  }
  
  for (const [key, count] of rtRwMap) {
    const status = count > 0 ? '✓' : '✗ NO PRODUCTS'
    console.log(`  ${key}: ${count} products ${status}`)
  }

  // Check sticker folders on disk
  console.log('\n=== DISK FOLDERS (seller/) ===')
  const SELLER_ROOT = 'i:\\pawonsjg\\seller'
  const dirs = await readdir(SELLER_ROOT)
  
  for (const dir of dirs) {
    const dirPath = join(SELLER_ROOT, dir)
    const s = await stat(dirPath)
    if (!s.isDirectory()) continue
    
    const innerDirs = await readdir(dirPath)
    for (const inner of innerDirs) {
      const innerPath = join(dirPath, inner)
      const s2 = await stat(innerPath)
      if (!s2.isDirectory()) continue
      
      // Check for Stiker folder
      const contents = await readdir(innerPath)
      let hasStiker = false
      for (const c of contents) {
        if (c.toLowerCase().includes('stiker')) {
          const stickerPath = join(innerPath, c)
          const s3 = await stat(stickerPath)
          if (s3.isDirectory()) {
            const files = await readdir(stickerPath)
            if (files.length > 0) hasStiker = true
          }
        }
      }
      console.log(`  ${inner}: ${hasStiker ? '✓' : '✗'} has stickers`)
    }
  }
}

main().catch(console.error)
