'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, Package } from 'lucide-react'

export default function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastOrder, setLastOrder] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('pawon-lastOrder')
    if (stored) {
      setLastOrder(stored.toUpperCase())
    }
  }, [])

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim()) return
    
    setLoading(true)
    router.push(`/track/${orderNumber.trim().toUpperCase()}`)
  }

  const handleLastOrder = () => {
    if (lastOrder) {
      setLoading(true)
      router.push(`/track/${lastOrder}`)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {lastOrder && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-center">
          <p className="text-xs font-bold text-green-700 mb-2">Pesanan Terakhir</p>
          <p className="font-mono font-black text-green-900 text-lg mb-3">{lastOrder}</p>
          <button
            onClick={handleLastOrder}
            className="w-full bg-green-600 text-white font-black py-3 rounded-xl hover:bg-green-700 transition-colors active:scale-95"
          >
            <Package className="w-4 h-4 inline mr-2" />
            Lacak Pesanan Ini
          </button>
        </div>
      )}
      <form onSubmit={handleTrack}>
        <div className="flex gap-2">
          <input
            type="text"
            required
            className="flex-grow p-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-green-500 outline-none transition-all uppercase font-mono"
            placeholder="Masukkan No. Pesanan (Contoh: ORD-ABC123)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
          <button
            disabled={loading}
            type="submit"
            className="bg-green-600 text-white p-4 rounded-2xl hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
          </button>
        </div>
      </form>
    </div>
  )
}
