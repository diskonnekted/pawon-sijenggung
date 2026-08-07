export function formatOrderMessage(
  orderNumber: string,
  customerName: string,
  customerPhone: string,
  customerAddress: string,
  items: { name: string; quantity: number; price: number }[],
  totalPrice: number,
  shippingFee: number,
  grandTotal: number
): string {
  const itemLines = items
    .map((item, index) => `${index + 1}. *${item.name}*\n   Jumlah: ${item.quantity}\n   Harga: Rp${(item.price * item.quantity).toLocaleString('id-ID')}`)
    .join('\n\n')

  return `📦 *PESANAN BARU MASUK* 📦
----------------------------------
🆔 *No. Pesanan:* ${orderNumber}
👤 *Pemesan:* ${customerName}
📞 *No. WhatsApp:* ${customerPhone}
📍 *Alamat Kirim:* ${customerAddress}
----------------------------------

🛍️ *DAFTAR BELANJA:*
${itemLines}

----------------------------------
💰 *RINGKASAN PEMBAYARAN:*
Subtotal: Rp${totalPrice.toLocaleString('id-ID')}
Ongkir: Rp${shippingFee.toLocaleString('id-ID')}
*TOTAL BAYAR: Rp${grandTotal.toLocaleString('id-ID')}*

----------------------------------
📝 *Catatan:* Pembayaran dilakukan secara *COD (Bayar di Tempat)* saat barang diantar oleh kurir.

_Mohon segera diproses dan hubungi pemesan jika diperlukan. Terima kasih!_`
}

/**
 * Mengirim pesan WhatsApp menggunakan API Fonnte.
 */
/**
 * Format nomor telepon ke format internasional (62xxx).
 * Fonnte API v2 memerlukan format internasional.
 */
function formatPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1)
  }
  if (cleaned.startsWith('620')) {
    cleaned = '62' + cleaned.slice(3)
  }
  return cleaned
}

export async function sendWhatsAppNotification(target: string, message: string) {
  const token = process.env.FONNTE_API_TOKEN || process.env.FONNTE_NEW_TOKEN || 'NPNgp2WtN8Ya3JXkb2pp'

  if (!token) {
    console.warn('FONNTE_API_TOKEN tidak ditemukan di environment variables.')
    return { success: false, error: 'API Token tidak dikonfigurasi.' }
  }

  try {
    const formattedTarget = formatPhone(target)
    console.log(`[Fonnte] Sending to ${target} -> ${formattedTarget}`)

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        target: formattedTarget,
        message: message,
      }),
    })

    const data = await response.json().catch(() => ({ status: response.ok }))
    console.log(`[Fonnte] Response (${target}):`, JSON.stringify(data))

    const success = data.status === 200 || data.status === true || response.ok
    return { success, data }
  } catch (error) {
    console.error(`[Fonnte] Error (${target}):`, error)
    return { success: false, error: 'Gagal menghubungi server Fonnte.' }
  }
}
