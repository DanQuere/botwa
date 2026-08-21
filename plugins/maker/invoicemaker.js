import { toSmallCaps, glyphs } from '../../utils/font.js';
import { formatNumber, getWIBTime, getIndonesianDate } from '../../utils/format.js';

export default {
  name: 'invoice',
  aliases: ['struk', 'kwitansi', 'invoicemaker'],
  category: 'maker',
  description: 'Membuat format invoice / kwitansi pembayaran digital profesional',
  async run({ m, q, usedPrefix }) {
    if (!q || !q.includes('|')) {
      return m.reply(`🧾 *Invoice Maker Digital*\n\nFormat: \`${usedPrefix}invoice Nama Pembeli | Nama Barang | Harga\`\n*Contoh:* \`${usedPrefix}invoice Daniel | VIP Premium 1 Bulan | 25000\``);
    }

    const [buyer, item, priceStr] = q.split('|').map(s => s.trim());
    const price = parseInt(priceStr?.replace(/[^0-9]/g, ''), 10) || 0;
    const invId = `INV-${Date.now().toString().slice(-6)}`;
    const dateToday = getIndonesianDate();
    const timeNow = getWIBTime();

    let text = `╔════════════════════════╗\n`;
    text += `║       *INVOICE PEMBAYARAN*     ║\n`;
    text += `╚════════════════════════╝\n\n`;
    text += `*No. Invoice:* \`${invId}\`\n`;
    text += `*Tanggal:* ${dateToday} (${timeNow})\n`;
    text += `*Pelanggan:* ${buyer}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `*Detail Pesanan:*\n`;
    text += `• Item: *${item}*\n`;
    text += `• Jumlah: 1x\n`;
    text += `• Harga: Rp ${formatNumber(price)}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `*TOTAL BAYAR:* *Rp ${formatNumber(price)}*\n`;
    text += `*Status:* LUNAS / PAID ✅\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `_Terima kasih atas transaksi dan kepercayaannya!_`;

    await m.reply(text.trim());
  }
};
