import { defineField, defineType } from 'sanity'
import { RocketIcon } from '@sanity/icons'

export const incubatorServiceType = defineType({
  name: 'incubatorService',
  title: 'Layanan Inkubator UMKM',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Nama Layanan',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Manfaat untuk UMKM',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'iconName',
      title: 'Nama Ikon (Lucide)',
      type: 'string',
      description: 'Gunakan nama dari lucide.dev (misal: GraduationCap, Palette, Banknote)',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Urutan Tampil',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
  },
})
