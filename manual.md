# Manual Operasional PAWON (Pasar Warga Pondokrejo) 🍲⚡

Dokumen ini berisi panduan lengkap untuk mengelola aplikasi PAWON melalui dashboard Sanity Studio.

## 1. Manajemen Pesanan (Alur Kurir & Admin)

PAWON menggunakan mekanisme **"Penunjukan Admin"** untuk pengantaran barang guna memastikan keadilan dan ketepatan lokasi.

### Alur Kerja Pesanan:
1.  **Status: Menunggu Konfirmasi**
    *   Pesanan baru masuk dari warga (pembeli).
    *   **Admin:** Menghubungi UMKM terkait untuk memastikan stok barang tersedia.
2.  **Status: Diproses Penjual**
    *   Admin mengubah status ke "Diproses Penjual" setelah stok dikonfirmasi.
    *   UMKM mulai menyiapkan/mengemas barang.
3.  **Penunjukan Kurir (Critical Step):**
    *   Admin membuka dokumen pesanan di Sanity Studio.
    *   Pada kolom **"Kurir yang Bertugas"**, pilih nama kurir yang tersedia dan paling dekat lokasinya.
    *   **Catatan Khusus untuk Kurir:** Isi instruksi tambahan jika ada (misal: "Barang pecah belah" atau "Titipkan ke warung depan rumah").
4.  **Status: Sedang Diantar Kurir**
    *   Admin mengubah status ke "Sedang Diantar Kurir" setelah barang diambil oleh kurir dari UMKM.
    *   Pembeli dapat melihat nama & nomor WA kurir di halaman "Lacak Pesanan".
5.  **Status: Selesai (COD)**
    *   Kurir menerima uang tunai dari pembeli.
    *   Admin mengubah status ke "Selesai (COD)" setelah menerima konfirmasi dari kurir.

---

## 2. Manajemen Pengguna (UMKM & Kurir)

### Mendaftarkan UMKM Baru:
*   Warga mendaftar melalui website di menu **"Daftar UMKM"** (Footer).
*   Data masuk ke menu **"Penjual (UMKM)"** di Sanity dengan status `isVerified: false`.
*   **Admin:** Melakukan survei lokasi/identitas. Jika valid, centang **"Status Verifikasi"** dan klik **Publish**.

### Mendaftarkan Kurir Baru:
*   Warga mendaftar melalui website di menu **"Daftar Jadi Kurir"** (Footer).
*   Data masuk ke menu **"Kurir Desa"** dengan status `Inactive`.
*   **Admin:** Verifikasi identitas. Jika valid, ubah status menjadi **"Aktif"** dan klik **Publish**.

---

## 3. Konten & Promosi

### Banner Promosi (Slider):
*   Gunakan menu **"Banner Promosi"**.
*   **Wajib:** Unggah dua versi gambar (Desktop: Landscape & Mobile: Portrait) agar tampilan di HP tidak terpotong.
*   Banner yang berstatus "Aktif" akan muncul otomatis di atas seksi "Paling Laris".

### Produk Terlaris & Promo:
*   **Terlaris:** Centang "Produk Terlaris" pada dokumen produk agar muncul di seksi "Paling Laris 🔥".
*   **Promo:** Centang "Produk Promo" dan masukkan angka "Diskon (%)" agar harga coret otomatis muncul di website.

---

## 4. Informasi Desa (Kabar Kalurahan)

*   Gunakan menu **"Info & Pengumuman"** untuk memposting berita atau panduan.
*   Setiap artikel akan otomatis tampil di halaman depan mobile & desktop sebagai bentuk dukungan desa kepada warga.

---
*Manual ini diperbarui secara otomatis setiap ada perubahan fitur sistem.*
*© 2026 Pemerintah Kalurahan Pondokrejo.*
