import { defineField, defineType } from 'sanity'
import { UserIcon } from '@sanity/icons'

export const vendorType = defineType({
  name: 'vendor',
  title: 'Penjual (UMKM)',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
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
      name: 'logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      type: 'text',
    }),
    defineField({
      name: 'phone',
      title: 'Nomor WhatsApp',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pin',
      title: 'PIN Akses Portal',
      type: 'string',
      description: 'PIN rahasia (4-6 digit) untuk login ke portal penjual.',
      validation: (rule) => rule.min(4).max(6),
    }),
    defineField({
      name: 'address',
      type: 'string',
    }),
    defineField({
      name: 'isOpen',
      title: 'Status Toko Buka',
      type: 'boolean',
      initialValue: true,
      description: 'Matikan ini jika toko sedang tutup atau libur.',
    }),
    defineField({
      name: 'closingMessage',
      title: 'Pesan Saat Tutup',
      type: 'string',
      description: 'Contoh: "Maaf, kami sedang libur Lebaran, buka kembali tanggal 10 Mei."',
      hidden: ({ document }) => !!document?.isOpen,
    }),
    defineField({
      name: 'isVerified',
      title: 'Status Verifikasi',
      type: 'boolean',
      initialValue: false,
      description: 'Aktifkan ini jika UMKM sudah diverifikasi oleh Admin Kalurahan.',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'address',
      media: 'logo',
    },
  },
})
