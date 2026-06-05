import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AddToCartButton from './AddToCartButton'
import { CartProvider, useCart } from '@/context/CartContext'
import React from 'react'

// Mock useCart
vi.mock('@/context/CartContext', async () => {
  const actual = await vi.importActual('@/context/CartContext') as any
  return {
    ...actual,
    useCart: vi.fn(),
  }
})

describe('AddToCartButton Component', () => {
  const mockProduct = {
    _id: 'p1',
    name: 'Produk Tes',
    price: 5000,
    slug: 'produk-tes',
    stock: 10,
    image: {} as any,
    vendor: { name: 'UMKM Tes' } as any
  }

  it('should render the button text correctly', () => {
    const mockAddItem = vi.fn()
    ;(useCart as any).mockReturnValue({ addItem: mockAddItem })

    render(<AddToCartButton product={mockProduct} />)
    
    expect(screen.getByText(/Tambah ke Keranjang/i)).toBeInTheDocument()
  })

  it('should call addItem when clicked', () => {
    const mockAddItem = vi.fn()
    ;(useCart as any).mockReturnValue({ addItem: mockAddItem })

    render(<AddToCartButton product={mockProduct} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockAddItem).toHaveBeenCalledWith(mockProduct)
  })
})
