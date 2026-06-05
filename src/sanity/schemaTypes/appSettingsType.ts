import { defineField, defineType } from 'sanity'
import { CogIcon } from '@sanity/icons'

export const appSettingsType = defineType({
  name: 'appSettings',
  title: 'Pengaturan Aplikasi',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'adminPhone',
      title: 'Nomor WhatsApp Admin Pusat',
      type: 'string',
      description: 'Nomor utama yang akan menerima laporan pesanan baru (Format: 08xxx atau 628xxx).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'defaultShippingFee',
      title: 'Biaya Ongkir Flat',
      type: 'number',
      description: 'Biaya kirim standar untuk wilayah Desa Sijenggung.',
      initialValue: 5000,
    }),
    defineField({
      name: 'siteName',
      title: 'Nama Aplikasi',
      type: 'string',
      initialValue: 'PAWON SIJENGGUNG',
    }),
    defineField({
      name: 'isMaintenance',
      title: 'Mode Perbaikan (Maintenance)',
      type: 'boolean',
      initialValue: false,
      description: 'Aktifkan ini jika ingin menutup akses belanja sementara untuk pemeliharaan sistem.',
    }),
    defineField({
      name: 'qrisImage',
      title: 'Gambar QRIS Desa',
      type: 'image',
      options: { hotspot: true },
      description: 'Barcode QRIS yang akan ditampilkan kepada pembeli saat checkout.',
    }),
    defineField({
      name: 'qrisName',
      title: 'Nama Akun QRIS',
      type: 'string',
      description: 'Contoh: BUMDes Sijenggung',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Konfigurasi Global PAWON',
      }
    },
  },
})
