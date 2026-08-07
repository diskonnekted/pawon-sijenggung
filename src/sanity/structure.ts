import type { StructureResolver } from 'sanity/structure'
import { BasketIcon, UserIcon, TagIcon, RocketIcon, MenuIcon } from '@sanity/icons'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Manajemen Pasar Sijenggung')
    .items([
      // Group for Orders
      S.listItem()
        .title('Pesanan Masuk')
        .icon(BasketIcon)
        .child(
          S.list()
            .title('Filter Pesanan')
            .items([
              S.listItem()
                .title('Semua Pesanan')
                .child(S.documentTypeList('order').title('Semua Pesanan')),
              S.divider(),
              S.listItem()
                .title('Perlu Konfirmasi')
                .child(
                  S.documentList()
                    .title('Menunggu Konfirmasi')
                    .filter('_type == "order" && status == "pending"')
                ),
              S.listItem()
                .title('Sedang Diantar Kurir')
                .child(
                  S.documentList()
                    .title('Dalam Pengiriman')
                    .filter('_type == "order" && status == "delivering"')
                ),
              S.listItem()
                .title('Selesai (COD)')
                .child(
                  S.documentList()
                    .title('Pesanan Selesai')
                    .filter('_type == "order" && status == "completed"')
                ),
            ])
        ),
      S.divider(),
      // Core Content
      S.listItem()
        .title('Produk')
        .icon(TagIcon)
        .child(S.documentTypeList('product').title('Produk UMKM')),
      S.listItem()
        .title('Kategori')
        .icon(MenuIcon)
        .child(S.documentTypeList('category').title('Kategori Produk')),
      S.divider(),
      // People
      S.listItem()
        .title('Penjual (UMKM)')
        .icon(UserIcon)
        .child(
          S.list()
            .title('Manajemen Penjual')
            .items([
              S.listItem()
                .title('Semua Penjual')
                .child(S.documentTypeList('vendor').title('Semua Penjual')),
              S.divider(),
              S.listItem()
                .title('Perlu Verifikasi')
                .child(
                  S.documentList()
                    .title('Pendaftaran Baru')
                    .filter('_type == "vendor" && isVerified == false')
                ),
            ])
        ),
      S.listItem()
        .title('Toko/UMKM')
        .icon(TagIcon)
        .child(
          S.list()
            .title('Manajemen Toko')
            .items([
              S.listItem()
                .title('Semua Toko')
                .child(S.documentTypeList('seller').title('Semua Toko/UMKM')),
              S.divider(),
              S.listItem()
                .title('Perlu Import Data')
                .child(
                  S.documentList()
                    .title('Belum Import dari Folder')
                    .filter('_type == "seller" && !logo')
                ),
            ])
        ),
      S.listItem()
        .title('Kurir Desa')
        .icon(RocketIcon)
        .child(S.documentTypeList('courier').title('Tim Kurir')),
      
      // Filter out types that are handled above manually
      ...S.documentTypeListItems().filter(
        (item) => !['order', 'product', 'vendor', 'courier', 'category', 'seller'].includes(item.getId()!)
      ),
    ])
