# Manual Operasional PAWON (Pasar Warga Sijenggung) 🍲⚡

Dokumen ini berisi panduan lengkap untuk mengelola aplikasi PAWON melalui dashboard Sanity Studio.

## 1. Manajemen Pesanan & Verifikasi Pembeli (Trust Score)

Untuk mencegah pesanan fiktif (fake order) pada sistem COD, PAWON menggunakan sistem **Trust Score (Skor Kepercayaan)** untuk setiap pembeli.

### Memeriksa Keaslian Pembeli:
1.  Buka dokumen **Pesanan** yang baru masuk.
2.  Lihat pada kolom **"Profil Warga (Pembeli)"**.
3.  Klik dokumen profil pembeli tersebut untuk melihat rekam jejaknya:
    *   **Total COD Berhasil**: Jumlah transaksi yang sukses diselesaikan.
    *   **Total COD Gagal**: Jumlah transaksi fiktif atau pembatalan di tempat.
    *   **Status Verifikasi**: Tanda centang jika warga tersebut sudah dikenal baik oleh Admin.

### Panduan Pengambilan Keputusan:
*   **Pembeli Baru (Berhasil: 0)**: Admin **WAJIB** menghubungi nomor WhatsApp pembeli untuk konfirmasi manual sebelum pesanan diteruskan ke UMKM.
*   **Pembeli Terpercaya (Berhasil > 1)**: Pesanan bisa langsung diproses tanpa ragu.
*   **Pembeli Bermasalah (Gagal > 1)**: Admin berhak membatalkan pesanan atau meminta pembeli datang mengambil sendiri ke lokasi.

### Alur Kerja Pesanan:
1.  **Status: Menunggu Konfirmasi**: Admin memverifikasi profil pembeli dan stok UMKM.
2.  **Status: Diproses Penjual**: UMKM mulai menyiapkan barang.
3.  **Penunjukan Kurir**: Admin memilih kurir desa dan mengisi instruksi tambahan.
4.  **Status: Sedang Diantar**: Kurir membawa barang ke alamat.
5.  **Status: Selesai (COD)**: **Admin memperbarui angka "Total COD Berhasil"** di profil pembeli setelah kurir menyetorkan uang.

---

## 2. Manajemen Pengguna (UMKM & Kurir)

### Mendaftarkan UMKM Baru:
*   Warga mendaftar melalui website di menu **"Daftar UMKM"** (Footer).
*   Data masuk ke menu **"Penjual (UMKM)"** dengan status `isVerified: false`.
*   **Admin:** Melakukan survei lokasi. Jika valid, centang **"Status Verifikasi"**.

### Mendaftarkan Kurir Baru:
*   Warga mendaftar melalui website di menu **"Daftar Jadi Kurir"** (Footer).
*   Data masuk ke menu **"Kurir Desa"** dengan status `Inactive`.
*   **Admin:** Verifikasi identitas, lalu ubah status menjadi **"Aktif"**.

---

## 3. Konten & Promosi

### Banner Promosi (Slider):
*   Gunakan menu **"Banner Promosi"**.
*   Wajib unggah gambar versi Desktop (Landscape) dan Mobile (Portrait).

### Produk Terlaris & Promo:
*   **Terlaris**: Centang "Produk Terlaris" agar muncul di halaman depan.
*   **Promo**: Centang "Produk Promo" dan isi "Diskon (%)" untuk mengaktifkan harga coret.

---

## 4. Informasi Desa (Kabar Desa)

*   Gunakan menu **"Info & Pengumuman"** untuk memposting berita, undangan pelatihan, atau panduan resmi bagi warga.

---
*© 2026 Pemerintah Desa Sijenggung.*
