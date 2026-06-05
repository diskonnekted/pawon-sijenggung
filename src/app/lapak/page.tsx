'use client'

import { useState } from 'react'
import { getVendorByPhone } from '@/app/actions/vendor-portal'
import { Store, Phone, ArrowRight, Loader2, Lock } from 'lucide-react'
import VendorDashboard from './_components/VendorDashboard'

export default function VendorLoginPage() {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vendorData, setVendorData] = useState<any>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await getVendorByPhone(phone, pin)
    if (res.success && res.data) {
      setVendorData(res.data)
    } else {
      setError(res.error || 'Terjadi kesalahan.')
    }
    setLoading(false)
  }

  if (vendorData) {
    return <VendorDashboard initialData={vendorData} onLogout={() => setVendorData(null)} />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-xl border border-slate-100">
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-green-50 rounded-3xl mb-4">
            <Store className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Portal Penjual</h1>
          <p className="text-slate-400 font-bold mt-2 text-sm uppercase tracking-widest">Warga Sijenggung</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
              Nomor WhatsApp Toko
            </label>
            <div className="relative">
              <Phone className="absolute left-5 top-5 w-5 h-5 text-slate-300" />
              <input
                required
                type="tel"
                placeholder="Contoh: 08123456789"
                className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
              PIN Keamanan (4-6 Digit)
            </label>
            <div className="relative">
              <Lock className="absolute left-5 top-5 w-5 h-5 text-slate-300" />
              <input
                required
                type="password"
                maxLength={6}
                placeholder="••••••"
                className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-slate-900 tracking-[0.5em]"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold text-center">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span>Masuk ke Lapak</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 text-xs mt-10 leading-relaxed">
          Belum terdaftar? Hubungi <strong>Admin Desa</strong> untuk mendaftarkan UMKM Anda di PAWON.
        </p>
      </div>
    </div>
  )
}
