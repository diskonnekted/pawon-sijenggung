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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                Manfaat Program
              </h3>
              <ul className="space-y-4 text-slate-600 font-medium">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Pendampingan intensif oleh tenaga ahli di bidangnya.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Akses eksklusif ke jaringan pemasaran Desa Sijenggung.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Meningkatkan kredibilitas dan profesionalisme usaha Anda.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-green-900/20 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-4">Konsultasi Sekarang</h3>
                <p className="text-slate-400 mb-8 font-medium leading-relaxed">
                  Punya pertanyaan spesifik tentang layanan {service.title}? Tim kami siap membantu Anda.
                </p>
                <a
                  href={`https://wa.me/081234567890?text=Halo, saya ingin berkonsultasi mengenai program Inkubator: ${service.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-xl shadow-green-600/30 active:scale-95"
                >
                  <MessageCircle className="w-6 h-6" />
                  Hubungi via WhatsApp
                </a>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-2xl rounded-full -mr-16 -mt-16"></div>
            </div>
          </div>

          <div className="text-center">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Program Resmi Desa Sijenggung</h4>
            <div className="inline-flex gap-8 items-center opacity-30 grayscale">
               <span className="font-black text-2xl tracking-tighter">PAWON</span>
               <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
               <span className="font-black text-2xl tracking-tighter">BUMKAL</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
