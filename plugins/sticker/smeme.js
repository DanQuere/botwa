import { createMemeSticker } from '../../lib/sticker.js';
import config from '../../config/config.js';

export default {
  name: 'smeme',
  aliases: ['stickermeme', 'smem', 'smm'],
  category: 'sticker',
  description: 'Membuat stiker meme dengan teks atas dan/atau teks bawah',
  async run({ sock, m, q }) {
    if (!q) {
      return m.reply(
        `┌───〔 🤡 *MEME STICKER* 〕\n` +
        `│ › Reply gambar / stiker dengan teks:\n` +
        `│ › Format: \`.smeme teks atas | teks bawah\`\n` +
        `│ › Contoh: \`.smeme ketika bot | bisa semua fitur\`\n` +
        `└────────────────────────`
      );
    }

    let topText = '';
    let bottomText = '';

    if (q.includes('|')) {
      const [t, b] = q.split('|');
      topText = t ? t.trim() : '';
      bottomText = b ? b.trim() : '';
    } else {
      topText = q.trim();
    }

    let buffer = null;
    if (m.quoted && (m.quoted.type === 'imageMessage' || m.quoted.type === 'stickerMessage')) {
      buffer = await m.quoted.download();
    } else if (m.type === 'imageMessage') {
      buffer = await m.download();
    }

    if (!buffer) {
      return m.reply('🖼️ Kirim atau balas gambar/stiker dengan `.smeme teks atas | teks bawah`');
    }

    await m.react('⏳');

    try {
      const memeSticker = await createMemeSticker(buffer, topText, bottomText, {
        packname: config.sticker?.packname,
        author: config.sticker?.author
      });

      await sock.sendMessage(m.chat, {
        sticker: memeSticker
      }, { quoted: m });

      await m.react('✨');
    } catch (err) {
      await m.react('❌');
      await m.reply(`✕ Gagal membuat stiker meme: ${err.message}`);
    }
  }
};
