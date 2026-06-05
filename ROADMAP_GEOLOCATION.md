# 🗺️ Roadmap Pengembangan: Sistem Geolokasi PAWON

Berdasarkan rencana teknis di `buyer-marking.md` dan `tracking.md`, berikut adalah rencana pengembangan sistem pemetaan lokal untuk Desa Sijenggung menggunakan teknologi Open-Source (**Leaflet.js + OpenStreetMap**).

---

## 📍 Tahap 1: Location Marking (Akurasi Alamat Pembeli)
*Tujuan: Memudahkan kurir menemukan rumah warga tanpa harus bertanya-tanya arah.*

### 🛠️ Pekerjaan Teknis:
1.  **Update Schema Sanity**: Menambahkan field `buyerLocation` (lat, lng, address, method) pada dokumen `order`.
2.  **Komponen Peta Checkout**: 
    *   Integrasi **Leaflet.js** pada halaman checkout.
    *   Fitur **"Gunakan Lokasi Saya"** (GPS Otomatis).
    *   Fitur **"Geser Pin"** (Manual Marking) untuk koreksi posisi.
3.  **Integrasi WhatsApp**: Mengirimkan link peta OpenStreetMap langsung ke WA Kurir saat pesanan masuk.
    *   *Contoh link:* `https://www.openstreetmap.org/?mlat=-7.79&mlon=110.3#map=18`

---

## 🚚 Tahap 2: Courier Tracking (Pelacakan Real-Time)
*Tujuan: Pembeli bisa melihat posisi kurir di peta secara langsung.*

### 🛠️ Pekerjaan Teknis:
1.  **Portal Kurir GPS**:
    *   Menambahkan fitur pengiriman koordinat otomatis di halaman `/kurir` menggunakan Browser Geolocation API.
    *   Sistem **Polling** (update tiap 30-60 detik) untuk menyimpan posisi kurir ke Sanity.
2.  **Halaman Tracking Interaktif**:
    *   Memperbarui `/track/[orderNumber]` dengan peta interaktif.
    *   Menampilkan marker **Rumah Pembeli** (merah) dan marker **Posisi Kurir** (ikon motor/truk) yang bergerak.
3.  **Smart Notification**:
    *   Kirim pesan WA otomatis via Fonnte: *"Kurir sudah dekat! Posisi 500m dari rumah Anda."*

---

## 📋 Daftar Kebutuhan Library:
*   `leaflet` & `react-leaflet`: Engine peta utama.
*   `lucide-react`: Ikon marker kustom.
*   `nominatim`: Untuk mengubah koordinat menjadi nama jalan/alamat secara gratis.

---

## 📈 Keunggulan Strategis:
1.  **Tanpa Biaya (Gratis)**: Tidak menggunakan Google Maps API yang berbayar mahal.
2.  **Privasi Terjamin**: Data lokasi hanya digunakan untuk operasional pengantaran desa dan bisa dihapus otomatis setelah pesanan selesai.
3.  **Cakupan Lokal**: Sangat akurat untuk pemetaan wilayah RT/RW di Sijenggung yang sering tidak terindeks sempurna di Google Maps.

---
*Status Rencana: **Ready for Implementation***
*Prioritas: Setelah sistem operasional WhatsApp stabil.*
