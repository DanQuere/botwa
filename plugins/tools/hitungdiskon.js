import { toSmallCaps, glyphs } from '../../utils/font.js';
import { formatNumber } from '../../utils/format.js';

export default {
  name: 'diskon',
  aliases: ['hitungdiskon', 'discount'],
  category: 'tools',
  description: 'Menghitung harga akhir setelah dipotong diskon',
  async run({ m, q, usedPrefix }) {
    if (!q || !q.includes(',')) {
      return m.reply(`🏷️ *Kalkulator Diskon*\n\nFormat: \`${usedPrefix}diskon <HargaAsli>, <PersenDiskon>\`\n*Contoh:* \`${usedPrefix}diskon 150000, 20\``);
    }

    const [priceStr, discStr] = q.split(',').map(s => s.trim().replace(/[^0-9.]/g, ''));
    const price = parseFloat(priceStr);
    const disc = parseFloat(discStr);

    if (isNaN(price) || isNaN(disc)) {
      return m.reply('✕ Angka harga atau persentase diskon tidak valid.');
    }

    const potong = (price * disc) / 100;
    const finalPrice = price - potong;

    let text = `┌───〔 🏷️ *${toSmallCaps('perhitungan diskon')}* 〕\n`;
    text += `│ ${glyphs.arrow} *Harga Awal:* Rp ${formatNumber(price)}\n`;
    text += `│ ${glyphs.arrow} *Diskon:* ${disc}%\n`;
    text += `│ ${glyphs.arrow} *Hemat / Potongan:* Rp ${formatNumber(potong)}\n`;
    text += `│ ${glyphs.arrow} *Harga Akhir:* *Rp ${formatNumber(finalPrice)}*\n`;
    text += `└────────────────────`;

    await m.reply(text.trim());
  }
};
