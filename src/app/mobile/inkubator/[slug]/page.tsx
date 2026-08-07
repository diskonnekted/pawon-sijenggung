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

export default async function MobileIncubatorDetailPage({ params }: Props) {
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
      "Meningkatkan omzet & daya saing."
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
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 p-4 flex items-center gap-4">
        <Link href="/inkubator" className="p-2 rounded-xl bg-slate-50 text-slate-900 active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-black text-slate-900">Detail Layanan</h1>
      </header>

      <main className="p-6 pb-40">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-green-600 text-white p-6 rounded-[2rem] shadow-xl shadow-green-600/20 mb-6">
            <Icon className="w-12 h-12" />
          </div>
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-green-100">
            Layanan Inkubator
          </div>
          <h2 className="text-3xl font-black text-slate-900 leading-tight mb-4">
            {service.title}
          </h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            {service.description}
          </p>
        </div>

        <div className="h-px bg-slate-100 w-full mb-10" />

        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Manfaat Program</h3>
            <div className="space-y-4">
              {details.manfaat.map((benefit, idx) => (
                <div key={idx} className="flex gap-4 items-start bg-slate-50 p-5 rounded-3xl">
                  <div className="bg-green-100 p-1 rounded-full flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">{details.materiTitle}</h3>
            <div className="space-y-3">
              {details.materi.map((m, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-slate-50/50 border border-slate-100 p-4 rounded-2xl">
                  <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-xs font-bold text-slate-600">{m}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-2">Punya Pertanyaan?</h3>
              <p className="text-slate-400 text-xs mb-6 leading-relaxed">Tim Inkubator kami siap mendiskusikan rencana pengembangan bisnis Anda.</p>
              <a 
                href={`https://wa.me/081234567890?text=Halo, saya ingin bertanya tentang layanan Inkubator: ${service.title}`}
                className="inline-flex items-center gap-2 text-green-400 font-black text-sm"
              >
                <MessageCircle className="w-5 h-5" />
                Mulai Konsultasi Gratis
              </a>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-500/10 blur-2xl rounded-full -mr-16 -mb-16"></div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-6 z-50 pb-10 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
        <a
          href={`https://wa.me/081234567890?text=Halo, saya ingin mendaftar program Inkubator: ${service.title}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-green-600 text-white text-center font-black py-5 rounded-[2rem] shadow-xl shadow-green-600/30 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <span>Daftar Layanan Sekarang</span>
        </a>
      </div>
    </div>
  );
}
