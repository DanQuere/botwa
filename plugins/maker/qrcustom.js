import { toSmallCaps } from '../../utils/font.js';

export default {
  name: 'qrcustom',
  aliases: ['customqr', 'qrcode'],
  category: 'maker',
  description: 'Membuat QR Code dari teks atau link URL',
  async run({ sock, m, q, usedPrefix }) {
    const input = q || m.quoted?.text;
    if (!input) {
      return m.reply(`📱 *QR Code Generator*\n\nMasukkan teks atau link untuk dibuatkan QR Code.\n*Contoh:* \`${usedPrefix}qrcode https://google.com\``);
    }

    await m.react('⏳');

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(input)}`;

    await sock.sendMessage(m.chat, {
      image: { url: qrUrl },
      caption: `✓ *${toSmallCaps('qr code berhasil dibuat')}*\n\nData: "${input.length > 80 ? input.slice(0, 77) + '...' : input}"`
    }, { quoted: m });

    await m.react('✅');
  }
};
