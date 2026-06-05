import { describe, it, expect, vi } from 'vitest'
import { createOrder } from './order'

// Mock next-sanity
vi.mock('next-sanity', () => ({
  createClient: () => ({
    create: vi.fn().mockResolvedValue({ _id: 'mock-order-id' })
  }),
  defineQuery: (q: string) => q
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project'
process.env.NEXT_PUBLIC_SANITY_DATASET = 'test-dataset'
process.env.SANITY_API_WRITE_TOKEN = 'test-token'

describe('Order Server Action', () => {
  it('should generate an order number correctly', async () => {
    const formData = {
      name: 'Budi',
      phone: '08123',
      address: 'Sijenggung'
    }
    const items = [
      { _id: 'p1', name: 'Produk 1', price: 10000, quantity: 2, image: {} as any, vendorName: 'UMKM' }
    ]
    
    const result = await createOrder(formData, items, 25000, 5000)
    
    expect(result.success).toBe(true)
    expect(result.orderNumber).toMatch(/^ORD-/)
    expect(result.orderId).toBe('mock-order-id')
  })
})
