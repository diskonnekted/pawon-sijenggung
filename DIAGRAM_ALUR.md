# 📊 Diagram Alur Sistem PAWON

Berikut adalah skrip **Mermaid.js** yang menggambarkan alur kerja aplikasi PAWON dari pemesanan hingga pengantaran. Anda dapat melihat visualisasinya di [Mermaid Live Editor](https://mermaid.live/).

## 1. Alur Pemesanan & Notifikasi (Order Flow)
```mermaid
sequenceDiagram
    participant P as Pembeli (Warga)
    participant S as Server (Next.js)
    participant DB as Sanity CMS
    participant WA as Fonnte API (WhatsApp)
    participant V as Penjual (UMKM)
    participant K as Kurir
    participant A as Admin Desa

    P->>S: Lakukan Checkout (COD)
    S->>DB: Buat Dokumen Pesanan (Pending)
    S->>WA: Kirim Notifikasi Multi-Channel
    WA-->>A: Notifikasi Invoice Lengkap
    WA-->>V: Notifikasi Persiapan Barang + Magic Link
    WA-->>K: Notifikasi Alamat Tujuan + Magic Link
    WA-->>P: Konfirmasi Pesanan Diterima
    
    Note over V,K: Koordinasi via WhatsApp
```

## 2. Alur Update Status Real-Time (Status Sync)
```mermaid
graph TD
    Start((Pesanan Masuk)) --> V_Prep[Penjual Siapkan Barang]
    V_Prep --> V_Link{Klik Magic Link WA}
    V_Link --> |Update: Shipped| DB[(Sanity Database)]
    
    DB --> Tracking[Halaman Lacak Pesanan Real-time]
    
    V_Link --> K_Task[Kurir Ambil Barang]
    K_Task --> K_Link{Klik Magic Link WA}
    K_Link --> |Update: Delivering| DB
    
    K_Link --> K_OTW[Kurir Menuju Alamat Warga]
    K_OTW --> K_Arrived[Barang Diterima & Bayar COD]
    K_Arrived --> K_Final{Klik Selesai}
    K_Final --> |Update: Completed| DB
    
    DB --> Admin_Notif[Admin Terima Laporan Akhir]
    K_Final --> End((Transaksi Selesai))

    style DB fill:#f9f,stroke:#333,stroke-width:4px
    style Tracking fill:#dfd,stroke:#333,stroke-width:2px
```

## 3. Alur Portal Mandiri (Self-Service)
```mermaid
graph LR
    User[Penjual / Kurir] --> Login{Portal Lapak/Kurir}
    Login --> |Input WA + PIN| Auth[Server Check]
    Auth --> |Valid| Dash[Dashboard Mandiri]
    
    subgraph Penjual
    Dash --> Op[Toggle Buka/Tutup]
    Dash --> Prod[Upload Produk Baru]
    Prod --> Cam[Ambil Foto Kamera]
    Cam --> Save[Simpan ke Sanity]
    end
    
    subgraph Kurir
    Dash --> Active[Toggle Aktif/Libur]
    Dash --> Task[Lihat Daftar Tugas]
    Task --> Update[Update Status Pengiriman]
    end
```

---
*Diagram ini dapat dimasukkan ke dalam file README.md atau dokumentasi teknis lainnya.*
