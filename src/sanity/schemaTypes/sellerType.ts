import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const sellerType = defineType({
  name: 'seller',
  title: 'Toko/UMKM',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nama Toko',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rt',
      title: 'RT',
      type: 'string',
      description: 'Contoh: 01',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rw',
      title: 'RW',
      type: 'string',
      description: 'Contoh: 01',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo Toko',
      type: 'image',
      description: 'Logo atau stiker utama toko (dari folder Stiker)',
      options: { hotspot: true },
    }),
    defineField({
      name: 'banner',
      title: 'Banner Toko',
      type: 'image',
      description: 'Banner promosi toko (dari folder Banner)',
      options: { hotspot: true },
    }),
    defineField({
      name: 'posters',
      title: 'Poster Produk',
      type: 'array',
      of: [{ type: 'image' }],
      description: 'Foto-foto poster produk toko (dari folder Poster)',
    }),
    defineField({
      name: 'products',
      title: 'Daftar Produk',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Nama-nama produk toko (berasal dari stiker produk)',
    }),
    defineField({
      name: 'phone',
      title: 'Nomor WhatsApp',
      type: 'string',
      description: 'Akan ditambahkan belakangan',
    }),
    defineField({
      name: 'address',
      title: 'Alamat',
      type: 'string',
      description: 'Akan ditambahkan belakangan',
    }),
    defineField({
      name: 'vendorReference',
      title: 'Ref Penjual',
      type: 'reference',
      to: [{ type: 'vendor' }],
      description: 'Kaitkan dengan data penjual di sistem',
    }),
    defineField({
      name: 'localImagePath',
      title: 'Path Folder Lokal',
      type: 'string',
      description: 'Path relatif ke folder lokal di seller/',
      readOnly: true,
    }),
    defineField({
      name: 'importedAt',
      title: 'Tanggal Import',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'isActive',
      title: 'Status Aktif',
      type: 'boolean',
      initialValue: true,
      description: 'Nonaktifkan jika toko sudah tidak aktif',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      rt: 'rt',
      rw: 'rw',
      products: 'products',
      media: 'logo',
    },
    prepare({ title, rt, rw, products, media }) {
      const productCount = Array.isArray(products) ? products.length : 0
      const subtitle = `RT ${rt} RW ${rw} — ${productCount} produk`
      return {
        title,
        subtitle,
        media,
      }
    },
  },
})
