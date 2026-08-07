'use server'

import { createClient } from 'next-sanity'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-02-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

/**
 * Mencari vendor berdasarkan nama dan PIN untuk keperluan login portal.
 */
export async function getVendorByUsername(username: string, pin: string) {
  try {
    // Normalize: uppercase, remove spaces and hyphens for matching
    const normalized = username.trim().toUpperCase().replace(/[\s-]/g, '')
    
    // Query all vendors with PIN, then filter by name in JS
    const vendors = await writeClient.fetch(`*[_type == "vendor" && defined(pin) && pin == $pin]{
      _id,
      name,
      phone,
      pin,
      description,
      isOpen,
      closingMessage,
      "slug": slug.current
    }`, { pin })
    
    if (!vendors || vendors.length === 0) {
      return { success: false, error: 'Username atau PIN salah.' }
    }

    // Find matching vendor by normalized name
    const vendor = vendors.find((v: any) => {
      const vendorNameNormalized = v.name.trim().toUpperCase().replace(/[\s-]/g, '')
      return vendorNameNormalized === normalized
    })

    if (!vendor) {
      return { success: false, error: 'Username atau PIN salah.' }
    }

    // Jangan kirim PIN balik ke client untuk keamanan
    delete vendor.pin

    return { success: true, data: vendor }
  } catch (error) {
    console.error('Fetch vendor failed:', error)
    return { success: false, error: 'Terjadi kesalahan sistem.' }
  }
}

/**
 * Update profil operasional vendor (Buka/Tutup & Deskripsi)
 */
export async function updateVendorProfile(vendorId: string, data: { isOpen: boolean, closingMessage?: string, description?: string }) {
  try {
    await writeClient
      .patch(vendorId)
      .set({
        isOpen: data.isOpen,
        closingMessage: data.closingMessage || '',
        description: data.description || ''
      })
      .commit()

    return { success: true }
  } catch (error) {
    console.error('Update vendor failed:', error)
    return { success: false, error: 'Gagal memperbarui profil toko.' }
  }
}
