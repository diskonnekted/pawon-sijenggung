import { createClient } from 'next-sanity'
import { readFileSync } from 'fs'

function loadEnv(path: string): Record<string, string> {
  const result: Record<string, string> = {}
  let content: string
  try {
    content = readFileSync(path, 'utf-8')
  } catch {
    return result
  }
  content.split('\n').forEach((line) => {
    line = line.trim()
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=').replace(/^["']|["']$/g, '')
      if (key && value !== undefined) result[key.trim()] = value
    }
  })
  return result
}

const env = loadEnv('i:\\pawonsjg\\.env.local')
for (const [k, v] of Object.entries(env)) {
  if (!process.env[k]) process.env[k] = v
}

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
})

export async function main() {
  const categories = await sanityClient.fetch('*[_type == "category"] { name, slug }')
  console.log('Categories:')
  for (const c of categories) {
    console.log(`  ${c.name} - ${c.slug?.current}`)
  }
}

main().catch(console.error)
