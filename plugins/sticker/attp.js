import sharp from 'sharp';
import { addExif } from '../../lib/sticker.js';
import config from '../../config/config.js';

export default {
  name: 'attp',
  aliases: ['ttp', 'textsticker', 'stext'],
  category: 'sticker',
  description: 'Mengubah teks menjadi stiker warna-warni yang keren',
  async run({ sock, m, q }) {
    if (!q) {
      return m.reply(
        `┌───〔 🔤 *TEXT TO STICKER* 〕\n` +
        `│ › Ubah teks menjadi stiker:\n` +
        `│ › Contoh: \`.attp Antigravity Bot\`\n` +
        `│ › Atau: \`.ttp Halo Semua\`\n` +
        `└────────────────────────`
      );
    }

    const escapeXml = (unsafe) => {
      return String(unsafe || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const safeText = escapeXml(q.slice(0, 50));

    await m.react('⏳');

    try {
      const colors = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#34d399', '#fbbf24'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const svg = `
        <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
          <rect width="512" height="512" rx="40" fill="#0f172a" fill-opacity="0.85"/>
          <text x="256" y="260"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${safeText.length > 20 ? '36' : '48'}"
            font-weight="900"
            fill="${randomColor}"
            text-anchor="middle"
            dominant-baseline="middle"
            stroke="#000000"
            stroke-width="4"
            paint-order="stroke fill">
            ${safeText}
          </text>
        </svg>
      `;

      const webpBuffer = await sharp(Buffer.from(svg))
        .webp({ quality: 85, effort: 4 })
        .toBuffer();

      const stickerWithExif = await addExif(
        webpBuffer,
        `Text: ${q.slice(0, 20)}`,
        config.sticker?.author || 'Antigravity Bot'
      );

      await sock.sendMessage(m.chat, {
        sticker: stickerWithExif
      }, { quoted: m });

      await m.react('✨');
    } catch (err) {
      await m.react('❌');
      await m.reply(`✕ Gagal membuat stiker teks: ${err.message}`);
    }
  }
};
