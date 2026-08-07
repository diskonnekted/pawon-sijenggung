import { sanityFetch } from "@/sanity/lib/live";
import { INCUBATOR_SERVICE_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { IncubatorService } from "@/types";
import { notFound } from "next/navigation";
import { 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  Palette, 
  Globe, 
  Handshake, 
  Banknote, 
  Building,
  ChevronLeft,
  MessageCircle,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

const iconMap: Record<string, any> = {
  GraduationCap,
  Users,
  ShieldCheck,
  Palette,
  Globe,
  Handshake,
  Banknote,
  Building
};

interface ServiceDetails {
  manfaat: string[];
  materi: string[];
  materiTitle: string;
}

const detailsMap: Record<string, ServiceDetails> = {
  "pelatihan-terstruktur-inkubator": {
    manfaat: [
      "Workshop interaktif dua mingguan dengan mentor bisnis praktisi.",
      "Akses modul belajar mandiri (manajemen, keuangan, marketing).",
      "Sertifikat kelulusan program inkubasi dari Desa Sijenggung."
    ],
    materiTitle: "Kurikulum & Materi Pelatihan",
    materi: [
      "Fundamental Bisnis & Mindset Kewirausahaan",
      "Penyusunan Laporan Keuangan & HPP Produk",
      "Digital Marketing & Optimasi Toko Online",
      "Standardisasi Mutu Produk & Keamanan Pangan"
    ]
  },
  "mentoring-personal-inkubator": {
    manfaat: [
      "Jadwal fleksibel, disesuaikan dengan ketersediaan pelaku UMKM.",
      "Pemecahan masalah spesifik (penurunan omzet, kendala bahan baku, dll).",
      "Rencana aksi taktis yang dipantau perkembangannya setiap minggu."
    ],
    materiTitle: "Tahapan Mentoring",
    materi: [
      "Sesi Diagnostik: Memetakan kondisi dan masalah utama UMKM",
      "Sesi Strategi: Menyusun solusi langkah-demi-langkah",
      "Eksekusi & Pendampingan Lapangan",
      "Evaluasi Berkala & Review Omzet Bulanan"
    ]
  },
  "bantuan-legalitas-inkubator": {
    manfaat: [
      "Pengurusan gratis bagi warga desa yang terdaftar program.",
      "Pendampingan melengkapi berkas administrasi dan uji produk.",
      "Membuka peluang produk masuk ke pasar retail modern & minimarket."
    ],
    materiTitle: "Legalitas yang Difasilitasi",
    materi: [
      "Nomor Induk Berusaha (NIB)",
      "Sertifikasi Halal (Self Declare / Reguler)",
      "Pangan Industri Rumah Tangga (P-IRT)",
      "Pendaftaran Hak Merek / HAKI"
    ]
  },
  "desain-branding-inkubator": {
    manfaat: [
      "Desain logo baru yang modern dan merepresentasikan keunikan produk.",
      "Rekayasa desain kemasan agar lebih menarik dan tahan lama.",
      "Foto produk kualitas studio gratis untuk katalog & promosi online."
    ],
    materiTitle: "Fasilitas Branding",
    materi: [
      "Redesain Identitas Visual & Logo Brand",
      "Konsultasi Material Kemasan Higienis",
      "Pembuatan Copywriting Label & Kemasan",
      "Sesi Foto Produk Studio Mini"
    ]
  },
  "akses-digital-inkubator": {
    manfaat: [
      "Pendampingan pendaftaran toko di Shopee, Tokopedia, dan PAWON.",
      "Pelatihan optimasi SEO produk agar mudah dicari pembeli.",
      "Pembuatan katalog digital & pemanfaatan WhatsApp Business."
    ],
    materiTitle: "Fokus Digitalisasi",
    materi: [
      "Setup Toko Online di Marketplace & PAWON",
      "Strategi Iklan & Promosi Digital Efektif",
      "Pengelolaan Media Sosial (Instagram/TikTok)",
      "Integrasi Pembayaran QRIS & Cashless"
    ]
  },
  "b2b-matching-inkubator": {
    manfaat: [
      "Fasilitasi pameran produk UMKM di tingkat kabupaten/provinsi.",
      "Pertemuan bisnis dengan agen, distributor, dan ritel modern.",
      "Kesempatan kontrak kerja sama suplai barang rutin jangka panjang."
    ],
    materiTitle: "Saluran Kemitraan",
    materi: [
      "Pameran & Expo Produk Unggulan Desa",
      "Pitching ke Jaringan Toko Oleh-oleh & Ritel",
      "Kemitraan Suplai Hotel & Restoran",
      "Negosiasi Kontrak Dagang B2B"
    ]
  },
  "akses-modal-inkubator": {
    manfaat: [
      "Bantuan penyusunan proposal bisnis yang rapi dan bankable.",
      "Pendampingan pengajuan Kredit Usaha Rakyat (KUR).",
      "Akses permodalan alternatif dari paguyuban/investor lokal."
    ],
    materiTitle: "Layanan Pembiayaan",
    materi: [
      "Analisis Kelayakan Finansial Usaha",
      "Penyusunan Proposal & Laporan Laba Rugi",
      "Koneksi ke Bank Penyalur KUR Desa",
      "Fasilitasi Hubungan Investor & UMKM"
    ]
  },
  "ruang-kerja-bersama-inkubator": {
    manfaat: [
      "Fasilitas internet berkecepatan tinggi gratis di Coworking Space.",
      "Ruang pertemuan ber-AC yang nyaman untuk rapat dan diskusi.",
      "Pojok baca dengan referensi buku bisnis & kewirausahaan."
    ],
    materiTitle: "Fasilitas Ruang",
    materi: [
      "Akses Meja Kerja & Internet Cepat",
      "Ruang Kolaborasi & Brainstorming",
      "Peralatan Presentasi Lengkap",
      "Fasilitas Cetak & Scan Dokumen Usaha"
    ]
  }
};

export default async function IncubatorDetailPage({ params }: Props) {
  const { slug } = await params;
  const { data: service } = await sanityFetch({
    query: INCUBATOR_SERVICE_BY_SLUG_QUERY,
    params: { slug },
  }) as { data: IncubatorService | null };

  if (!service) {
    notFound();
  }

  const Icon = iconMap[service.iconName] || Globe;
  const details = detailsMap[slug] || {
    manfaat: [
      "Pendampingan intensif oleh tenaga ahli di bidangnya.",
      "Akses eksklusif ke jaringan pemasaran Desa Sijenggung.",
      "Meningkatkan kredibilitas dan profesionalisme usaha Anda."
    ],
    materiTitle: "Fokus Program",
    materi: [
      "Perencanaan & Strategi Operasional Usaha",
      "Implementasi Metode Kerja Terbaik",
      "Evaluasi & Kontrol Kualitas Produk",
      "Kolaborasi Sinergis Antar-UMKM"
    ]
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <Link 
            href="/inkubator"
            className="inline-flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest mb-8 hover:text-green-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Inkubator
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            <div className="bg-green-600 text-white p-8 rounded-[2.5rem] shadow-xl shadow-green-600/20">
              <Icon className="w-16 h-16" />
            </div>
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-green-100">
                Layanan Unggulan Inkubator
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight mb-4">
                {service.title}
              </h1>
              <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                {service.description}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Left Column: Manfaat */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                Manfaat Program
              </h3>
              <ul className="space-y-4 text-slate-600 font-medium">
                {details.manfaat.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: Materi */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <Icon className="w-6 h-6 text-green-600" />
                {details.materiTitle}
              </h3>
              <ul className="space-y-4 text-slate-600 font-medium">
                {details.materi.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="bg-green-50 text-green-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="leading-relaxed">{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Full Width CTA */}
          <div className="bg-slate-900 p-10 md:p-12 rounded-[3.5rem] text-white shadow-2xl shadow-green-900/20 relative overflow-hidden mb-20">
            <div className="relative z-10 max-w-2xl">
              <h3 className="text-2xl md:text-3xl font-black mb-4">Konsultasi Sekarang</h3>
              <p className="text-slate-400 mb-8 font-medium leading-relaxed">
                Punya pertanyaan spesifik tentang layanan {service.title}? Tim kami siap membantu dan memandu Anda untuk bergabung dalam Inkubator UMKM Sijenggung.
              </p>
              <a
                href={`https://wa.me/081234567890?text=Halo, saya ingin berkonsultasi mengenai program Inkubator: ${service.title}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-xl shadow-green-600/30 active:scale-95"
              >
                <MessageCircle className="w-6 h-6" />
                Hubungi via WhatsApp
              </a>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
          </div>

          <div className="text-center">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Program Resmi Desa Sijenggung</h4>
            <div className="inline-flex gap-8 items-center opacity-30 grayscale">
               <span className="font-black text-2xl tracking-tighter">PAWON</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
