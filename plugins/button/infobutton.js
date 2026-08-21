import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'infobutton',
  aliases: ['buttoninfo', 'issuebutton', 'baileysbutton'],
  category: 'button',
  description: 'Penjelasan & riset teknis mengenai tombol WhatsApp & issue Baileys GitHub',
  async run({ m, usedPrefix }) {
    const text = 
      `┌───〔 🔬 *${toSmallCaps('riset teknis tombol whatsapp baileys')}* 〕\n` +
      `│ Berdasarkan issue resmi di repository *WhiskeySockets/Baileys*:\n` +
      `└────────────────────────\n\n` +
      `📌 *1. Mengapa Tombol Tidak Muncul di WA Business / iOS / Web?*\n` +
      `• WhatsApp secara sepihak memblokir rendering payload \`interactiveMessage\` dan \`buttonsResponseMessage\` pada aplikasi *WhatsApp Business*, *WhatsApp Web*, dan *WhatsApp iOS* jika dikirim melalui protokol tidak resmi (Baileys/WebSockets).\n` +
      `• WhatsApp membatasi fitur ini agar pengguna bisnis beralih ke *Official WhatsApp Business Cloud API* berbayar.\n\n` +
      `📌 *2. Struktur Resmi Native Flow 2026 yang Didukung Baileys:*\n` +
      `• Struktur modern dibungkus menggunakan \`proto.Message.InteractiveMessage\` dengan sub-tipe \`nativeFlowMessage\`.\n` +
      `• Field \`buttonParamsJson\` WAJIB berupa *String JSON yang di-stringify* (\`JSON.stringify({...})\`), bukan Javascript Object mentah.\n` +
      `• Pengiriman dilakukan menggunakan \`sock.relayMessage\` dengan \`messageId\` dan \`messageContextInfo\`.\n\n` +
      `📌 *3. Matriks Kompatibilitas Perangkat:*\n` +
      `• ✅ *WhatsApp Biasa (Android):* 95% tombol Native Flow & Carousel muncul & berfungsi interaktif.\n` +
      `• ⚠️ *WhatsApp Business (Android):* Tombol sering disembunyikan oleh sistem WhatsApp (hanya terbaca sebagai teks).\n` +
      `• ⚠️ *WhatsApp Web / Desktop:* Memerlukan dukungan binary node spesifik dari update Baileys.\n` +
      `• ⚠️ *WhatsApp iOS (iPhone):* Tergantung versi aplikasi WhatsApp iOS.\n\n` +
      `📌 *4. Rekomendasi Best Practice untuk Developer:*\n` +
      `• Gunakan format teks terstruktur sebagai menu default agar **100% semua pengguna (WA Biasa & Business) tetap bisa membaca informasi dan mengetik perintah**.\n` +
      `• Sediakan opsi tombol pada kategori terpisah seperti \`${usedPrefix}button\`, \`${usedPrefix}carousel\`, \`${usedPrefix}listmsg\`, dan \`${usedPrefix}media\` untuk interaksi visual bagi perangkat yang mendukung.\n\n` +
      `_© 2026 Antigravity Bot • WhiskeySockets/Baileys Architecture_`;

    await m.reply(text);
  }
};
