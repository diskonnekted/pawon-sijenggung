'use server'

import { createClient } from 'next-sanity'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-02-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

export async function registerCourier(formData: { name: string, phone: string }) {
  try {
    const doc = {
      _type: 'courier',
      name: formData.name,
      phone: formData.phone,
      status: 'inactive', // Default to inactive until verified by admin
    }

    const result = await writeClient.create(doc)
    return { success: true, courierId: result._id }
  } catch (error) {
    console.error('Courier registration failed:', error)
    return { success: false, error: 'Gagal mengirim pendaftaran kurir.' }
  }
}
