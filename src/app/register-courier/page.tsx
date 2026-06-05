'use client'

import { useState } from 'react'
import { registerCourier } from '@/app/actions/courier'
import { CheckCircle, Loader2, Truck, ChevronLeft, Info } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterCourierPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await registerCourier(formData)
    if (result.success) {
      setSuccess(true)
    } else {
      alert(result.error)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-[3rem] p-12 shadow-xl shadow-slate-200/50 inline-block max-w-md">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-slate-900 mb-4">Pendaftaran Terkirim!</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Terima kasih telah mendaftar sebagai Kurir Desa. Data Anda sedang ditinjau oleh Admin Desa Sijenggung. Kami akan menghubungi Anda segera.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-green-600 transition-all active:scale-95"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-xl mx-auto">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-green-600 transition-colors mb-8">
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </Link>
          <div className="bg-green-100 w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 shadow-lg shadow-green-100/50">
            <Truck className="w-10 h-10 text-green-700" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">Gabung Jadi <span className="text-green-600">Kurir Desa</span>.</h1>
          <p className="text-slate-500 font-medium">Bantu pengantaran produk warga dan dapatkan penghasilan tambahan melalui ekosistem PAWON.</p>
        </div>

        <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Nama Lengkap</label>
              <input
                required
                type="text"
                placeholder="Masukkan nama sesuai KTP"
                className="w-full p-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Nomor WhatsApp</label>
              <input
                required
                type="tel"
                placeholder="Contoh: 081234567890"
                className="w-full p-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-green-600 text-white font-black py-5 rounded-3xl shadow-xl shadow-green-600/30 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>Kirim Pendaftaran</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-black text-blue-800 uppercase tracking-wider mb-1">Informasi</h4>
              <p className="text-[10px] font-bold text-blue-600 leading-relaxed">
                Pendaftaran ini akan ditinjau oleh Admin Desa Sijenggung. Pastikan nomor WhatsApp Anda aktif untuk proses verifikasi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
