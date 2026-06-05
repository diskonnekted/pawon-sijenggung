# 🍱 Panduan Penggunaan Aplikasi PAWON
**Pasar Online Warga Sijenggung**

Selamat datang di ekosistem digital **PAWON**. Aplikasi ini dirancang untuk menghubungkan warga, pelaku UMKM, dan kurir lokal dalam satu platform yang terintegrasi dengan WhatsApp.

---

## 🏗️ 1. Peran & Tanggung Jawab

Sistem PAWON membagi pengguna ke dalam 4 peran utama:
1.  **ADMIN**: Pengendali pusat, pengatur nomor WhatsApp admin, kurator produk, dan pendaftar akun.
2.  **PENJUAL (UMKM)**: Pengelola produk, stok, dan status buka/tutup toko.
3.  **KURIR**: Petugas lapangan yang mengantar barang dan mengelola status pengiriman.
4.  **PEMBELI (WARGA)**: Pengguna yang melakukan pemesanan produk atau jasa melalui website.

---

## 🛠️ 2. Panduan untuk ADMIN (Pusat Kendali)
**Akses Dashboard**: `https://pawon.sijenggung.id/studio`

### A. Pengaturan Awal (Wajib)
1.  Masuk ke menu **"Pengaturan Aplikasi"**.
2.  Isi **Nomor WhatsApp Admin Pusat** (Contoh: `081328128315`). Semua laporan pesanan akan masuk ke nomor ini.
3.  Setel **Biaya Ongkir Flat** (Contoh: `5000`).

### B. Mendaftarkan Penjual & Kurir
1.  **Penjual**: Masuk ke menu **"Penjual (UMKM)"**, klik (+), isi nama, WhatsApp, dan tentukan **PIN Akses** (4-6 digit).
2.  **Kurir**: Masuk ke menu **"Kurir"**, klik (+), isi nama, WhatsApp, dan tentukan **PIN Akses**.
3.  Berikan nomor WhatsApp dan PIN tersebut kepada masing-masing orang.

---

## 🏪 3. Panduan untuk PENJUAL (UMKM)
**Akses Portal**: `https://pawon.sijenggung.id/lapak`

### A. Login & Operasional
1.  Login menggunakan Nomor WhatsApp dan PIN dari Admin.
2.  **Buka/Tutup Toko**: Gunakan tombol saklar di halaman utama. Jika tutup, isi pesan (misal: "Lagi Libur"). Pembeli tidak akan bisa memesan produk Anda selama toko tutup.
3.  **Update Deskripsi**: Ubah deskripsi toko Anda agar warga lebih mengenal usaha Anda.

### B. Manajemen Produk
1.  Klik tab **"Kelola Produk"**.
2.  **Tambah Produk**: Klik (+), ambil foto produk langsung dari kamera HP, isi Nama, Harga, dan Stok.
3.  **Hapus Produk**: Klik ikon tempat sampah jika barang sudah tidak diproduksi lagi.

---

## 🚚 4. Panduan untuk KURIR
**Akses Portal**: `https://pawon.sijenggung.id/kurir`

### A. Menangani Pesanan Baru
1.  Setiap ada warga belanja, Anda akan menerima pesan WhatsApp otomatis berisi rincian item, alamat tujuan, dan jumlah tagihan COD.
2.  Klik **Magic Link** (link biru) di pesan WA untuk langsung mengupdate status tanpa login, atau masuk ke portal `/kurir`.

### B. Alur Pengantaran (Wajib Update!)
Kurir wajib menekan tombol status sesuai urutan:
1.  **Barang Diambil**: Klik saat Anda sudah mengambil barang dari penjual.
2.  **Mulai Kirim**: Klik saat Anda berangkat ke alamat warga.
3.  **Selesai**: Klik saat barang sudah diterima warga dan uang tunai (COD) sudah Anda terima.
4.  **Masalah**: Klik jika alamat tidak ditemukan atau warga membatalkan pesanan di tempat.

---

## 🛍️ 5. Panduan untuk PEMBELI (WARGA)
**Akses Web**: `https://pawon.sijenggung.id`

### A. Cara Belanja
1.  Pilih produk atau jasa yang diinginkan.
2.  Klik **"Tambah ke Keranjang"**.
3.  Masuk ke ikon Keranjang, klik **"Checkout"**.
4.  Isi Nama, Alamat, dan WhatsApp Aktif.
5.  Klik **"Buat Pesanan"**. Anda akan otomatis menerima konfirmasi via WhatsApp.

### B. Melacak Pesanan
1.  Klik menu **"Lacak Pesanan"** di bagian bawah atau melalui link yang dikirim ke WhatsApp Anda.
2.  Anda bisa melihat posisi barang secara real-time (apakah sedang disiapkan penjual atau sudah dibawa kurir).

---

## ⚙️ 6. Pemeliharaan Teknis (Untuk IT/Developer)

### Update Aplikasi di Server:
1.  `git pull origin master` (Tarik kode terbaru).
2.  `npm run build` (Kompilasi fitur baru).
3.  `pm2 restart pawon-app` (Restart server).

### Integrasi Notifikasi:
*   **WhatsApp**: Menggunakan API Fonnte (Pastikan saldo/token aktif).
*   **Android Push**: Menggunakan PushAlert (Izin akan diminta saat pertama kali buka web di HP).

---
**PAWON** - *Membangun Desa dari Tetangga.*
© 2026 Pemerintah Desa Sijenggung.
