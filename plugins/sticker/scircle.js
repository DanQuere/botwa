import { createCircleSticker } from '../../lib/sticker.js';
import config from '../../config/config.js';

export default {
  name: 'scircle',
  aliases: ['circle', 'circlesticker', 'sbulat'],
  category: 'sticker',
  description: 'Mengubah gambar atau stiker menjadi stiker bulat (circle)',
  async run({ sock, m, q }) {
    let buffer = null;

    if (m.quoted && (m.quoted.type === 'imageMessage' || m.quoted.type === 'stickerMessage')) {
      buffer = await m.quoted.download();
    } else if (m.type === 'imageMessage') {
      buffer = await m.download();
    }

    if (!buffer) {
      return m.reply('⚪ Kirim gambar atau balas gambar/stiker dengan `.scircle`');
    }

    let packname = config.sticker?.packname || 'Antigravity Bot';
    let author = config.sticker?.author || 'WhatsApp Bot 2026';

    if (q && q.includes('|')) {
      const [p, a] = q.split('|');
      if (p) packname = p.trim();
      if (a) author = a.trim();
    } else if (q) {
      packname = q.trim();
    }

    await m.react('⏳');

    try {
      const stickerBuffer = await createCircleSticker(buffer, { packname, author });

      await sock.sendMessage(m.chat, {
        sticker: stickerBuffer
      }, { quoted: m });

      await m.react('✨');
    } catch (err) {
      await m.react('❌');
      await m.reply(`✕ Gagal membuat stiker bulat: ${err.message}`);
    }
  }
};
