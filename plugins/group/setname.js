import { toSmallCaps } from '../../utils/font.js';

export default {
  name: 'setname',
  aliases: ['setsubject', 'namagrup', 'setnamegc'],
  category: 'group',
  description: 'Mengubah nama atau subjek grup WhatsApp',
  groupOnly: true,
  adminOnly: true,
  async run({ sock, m, q, isBotAdmin, usedPrefix }) {
    if (!isBotAdmin) return m.reply('◈ Bot harus menjadi Admin grup untuk menjalankan perintah ini.');
    if (!q) return m.reply(`📝 Masukkan nama grup baru.\n*Contoh:* \`${usedPrefix}setname Komunitas Antigravity\``);

    try {
      await sock.groupUpdateSubject(m.chat, q.trim());
      await m.reply(`✓ *${toSmallCaps('nama grup berhasil diubah')}* menjadi:\n"${q.trim()}"`);
    } catch (err) {
      await m.reply(`✕ Gagal mengubah nama grup: ${err.message}`);
    }
  }
};
