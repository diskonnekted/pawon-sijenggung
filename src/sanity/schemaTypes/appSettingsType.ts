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
      description: 'Biaya kirim standar untuk wilayah Kalurahan Pondokrejo.',
      initialValue: 5000,
    }),
    defineField({
      name: 'siteName',
      title: 'Nama Aplikasi',
      type: 'string',
      initialValue: 'PAWON PONDOKREJO',
    }),
    defineField({
      name: 'isMaintenance',
      title: 'Mode Perbaikan (Maintenance)',
      type: 'boolean',
      initialValue: false,
      description: 'Aktifkan ini jika ingin menutup akses belanja sementara untuk pemeliharaan sistem.',
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
