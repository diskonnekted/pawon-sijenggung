import { defineLive } from 'next-sanity/live'
import { client } from './client'
import type { ReactNode } from 'react'

const liveClient = client.withConfig({
  apiVersion: '2026-02-01'
})

// Check if we're in development with Turbopack (live mode can be flaky)
const isDev = process.env.NODE_ENV === 'development'

let sanityFetch: ({ query, params, tags }: { query: string; params?: Record<string, unknown>; tags?: string[] }) => Promise<unknown>
let SanityLive: any

if (isDev) {
  // In development, use regular client to avoid SSE network errors with Turbopack
  sanityFetch = async ({ query, params, tags }) => {
    const data = await liveClient.fetch(query, params || {}, { cache: 'no-store', next: { tags } })
    return { data }
  }
  SanityLive = ({ children }: { children?: ReactNode }) => (children || null) as ReactNode
} else {
  // In production, use full live mode
  const { sanityFetch: sf, SanityLive: SL } = defineLive({ client: liveClient })
  sanityFetch = sf
  SanityLive = SL
}

export { sanityFetch, SanityLive }
