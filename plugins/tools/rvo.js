import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'rvo',
  aliases: ['readviewonce', 'antiviewonce'],
  category: 'tools',
  description: 'Membuka dan mengambil media pesan View Once (Sekali Lihat)',
  async run({ sock, m, usedPrefix }) {
    if (!m.quoted) {
      return m.reply(`👁️ Reply pesan View Once (gambar/video sekali lihat) dengan perintah \`${usedPrefix}rvo\`.`);
    }

    const qMsg = m.quoted.msg;
    const isViewOnce = qMsg?.viewOnce || m.quoted.type === 'viewOnceMessage' || m.quoted.type === 'viewOnceMessageV2';

    try {
      const buffer = await m.quoted.download();
      if (!buffer) throw new Error('Gagal mengunduh media dari pesan yang di-reply.');

      const isVideo = m.quoted.type === 'videoMessage' || qMsg?.mimetype?.startsWith('video/');

      if (isVideo) {
        await sock.sendMessage(m.chat, {
          video: buffer,
          caption: `👁️ *View Once Video Restored*\n\nDari: @${m.quoted.senderNumber}`,
          mentions: [m.quoted.sender]
        }, { quoted: m });
      } else {
        await sock.sendMessage(m.chat, {
          image: buffer,
          caption: `👁️ *View Once Image Restored*\n\nDari: @${m.quoted.senderNumber}`,
          mentions: [m.quoted.sender]
        }, { quoted: m });
      }
    } catch (err) {
      await m.reply(`✕ Gagal mengambil View Once: ${err.message}`);
    }
  }
};
