import { getQRUrl } from '../../utils/scraper.js';

export default {
  name: 'qr',
  aliases: ['qrcode', 'makeqr'],
  category: 'tools',
  description: 'Membuat QR Code dari teks atau tautan',
  async run({ sock, m, q, usedPrefix, command }) {
    const text = q || (m.quoted && m.quoted.text);
    if (!text) {
      return m.reply(`📱 Masukkan teks yang ingin dijadikan QR Code.\n*Contoh:* \`${usedPrefix + command} https://google.com\``);
    }

    await m.react('📷');
    const qrUrl = getQRUrl(text);

    await sock.sendMessage(m.chat, {
      image: { url: qrUrl },
      caption: `✅ *QR Code Generated*\n\n📝 *Konten:* ${text.slice(0, 100)}`
    }, { quoted: m });
  }
};
