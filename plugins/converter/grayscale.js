import sharp from 'sharp';
import { toSmallCaps } from '../../utils/font.js';

export default {
  name: 'grayscale',
  aliases: ['hitamputih', 'bw', 'blackandwhite'],
  category: 'converter',
  description: 'Mengubah foto/gambar menjadi hitam putih (grayscale)',
  async run({ sock, m, usedPrefix }) {
    const qMsg = m.quoted ? m.quoted : m;
    const isImage = qMsg.type === 'imageMessage' || qMsg.msg?.mimetype?.startsWith('image/');

    if (!isImage) {
      return m.reply(`🖼️ Reply foto yang ingin diubah menjadi hitam putih dengan \`${usedPrefix}grayscale\`.`);
    }

    await m.react('⏳');

    try {
      const buffer = await qMsg.download();
      const processed = await sharp(buffer).grayscale().toBuffer();

      await sock.sendMessage(m.chat, {
        image: processed,
        caption: `✓ *${toSmallCaps('efek hitam putih berhasil diterapkan')}*`
      }, { quoted: m });

      await m.react('✅');
    } catch (err) {
      await m.react('❌');
      await m.reply(`✕ Gagal memproses gambar: ${err.message}`);
    }
  }
};
